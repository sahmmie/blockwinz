import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { RedisService } from '../shared/services/redis.service';
import { ConfigService } from '@nestjs/config';

const DEV_PRICES = {
  BTC: { price: 107433.6271, last_updated_at: 1750868686 },
  ETH: { price: 2416.0738, last_updated_at: 1750868686 },
  SOL: { price: 143.9618, last_updated_at: 1750868685 },
  BWZ: { price: 1.1 },
};

export interface CoinPrice {
  symbol: string;
  price: number;
  timestamp?: number;
  dev?: boolean;
  last_updated_at?: number;
}

const COIN_SYMBOLS = {
  bitcoin: 'BTC',
  ethereum: 'ETH',
  solana: 'SOL',
};

/** Redis key for SOL/USD quote (matches `solana:price` cache entries). */
export const SOLANA_PRICE_REDIS_ID = 'solana';

export interface SolUsdQuote {
  /** USD price of 1 SOL */
  priceUsdPerSol: number;
  /** When the quote was cached (ms since epoch) */
  quoteTimestampMs: number;
}

/**
 * Max age of a cached quote before we try CoinGecko on-demand.
 * Must be ≥ cron interval (see fetchAndCachePrice) so scheduled jobs alone don't leave "stale" gaps.
 */
const DEFAULT_SOL_USD_QUOTE_MAX_AGE_MS = 12 * 60 * 1000;

@Injectable()
export class CoinPriceService {
  private readonly logger = new Logger(CoinPriceService.name);
  private readonly priceUrl = 'https://api.coingecko.com/api/v3/simple/price';
  private readonly priceParams = {
    vs_currencies: 'usd',
    ids: 'solana,bitcoin,ethereum',
    names: 'Solana,Bitcoin,Ethereum',
    symbols: 'sol,btc,eth',
    include_last_updated_at: 'true',
    precision: '4',
  };
  private readonly priceHeaders;
  private readonly isDev;

  constructor(
    private readonly http: HttpService,
    private readonly redis: RedisService,
    private readonly config: ConfigService,
  ) {
    this.priceHeaders = {
      accept: 'application/json',
      'x-cg-demo-api-key': this.config.get('COIN_GECKO_API_KEY'),
    };
    this.isDev = this.config.get('NODE_ENV') === 'dev';
  }

  @Cron('*/10 * * * *') // every 10 minutes
  async fetchAndCachePrice() {
    if (this.isDev) {
      // In dev, hardcode all 4 currencies
      for (const [id, symbol] of Object.entries(COIN_SYMBOLS)) {
        const devData = DEV_PRICES[symbol];
        try {
          await this.redis.setValue(
            `${id}:price`,
            JSON.stringify({
              price: devData.price,
              timestamp: Date.now(),
              dev: true,
              last_updated_at: devData.last_updated_at,
            }),
          );
        } catch (error) {
          this.logger.warn(
            `Failed to cache ${symbol} price in dev mode: ${error.message}`,
          );
        }
      }
      // BWZ is not in Redis, but we keep logic consistent
      try {
        await this.redis.setValue(
          `bwz:price`,
          JSON.stringify({
            price: DEV_PRICES.BWZ.price,
            timestamp: Date.now(),
            dev: true,
          }),
        );
      } catch (error) {
        this.logger.warn(
          `Failed to cache BWZ price in dev mode: ${error.message}`,
        );
      }
      this.logger.log(
        `Development mode: Set static prices for BTC, ETH, SOL, BWZ in Redis.`,
      );
      return;
    }
    try {
      const { data } = await firstValueFrom(
        this.http.get(this.priceUrl, {
          params: this.priceParams,
          headers: this.priceHeaders,
        }),
      );
      for (const [id, symbol] of Object.entries(COIN_SYMBOLS)) {
        const coin = data?.[id];
        if (coin && coin.usd) {
          try {
            await this.redis.setValue(
              `${id}:price`,
              JSON.stringify({
                price: coin.usd,
                timestamp: Date.now(),
                last_updated_at: coin.last_updated_at,
              }),
            );
            this.logger.log(`Updated ${symbol} price in Redis: ${coin.usd}`);
          } catch (error) {
            this.logger.warn(
              `Failed to cache ${symbol} price: ${error.message}`,
            );
          }
        } else {
          this.logger.warn(`No price found in API response for ${symbol}`);
        }
      }
    } catch (err) {
      this.logger.error('Failed to fetch/cache coin prices', err);
    }
  }

  async getCachedPrice(): Promise<CoinPrice[]> {
    const results: CoinPrice[] = [];
    if (this.isDev) {
      // In dev, return all hardcoded prices
      for (const symbol of Object.values(COIN_SYMBOLS)) {
        const devData = DEV_PRICES[symbol];
        results.push({
          symbol,
          price: devData.price,
          dev: true,
          last_updated_at: devData.last_updated_at,
        });
      }
      results.push({ symbol: 'BWZ', price: DEV_PRICES.BWZ.price, dev: true });
      return results;
    }
    for (const [id, symbol] of Object.entries(COIN_SYMBOLS)) {
      const cached = await this.redis.getValue(`${id}:price`);
      let coin: CoinPrice;
      if (cached) {
        const parsed = JSON.parse(cached);
        coin = {
          symbol,
          price: parsed.price,
          timestamp: parsed.timestamp,
          dev: parsed.dev,
          last_updated_at: parsed.last_updated_at,
        };
      } else {
        coin = {
          symbol,
          price: 0.0,
          timestamp: Date.now(),
          dev: false,
          last_updated_at: Math.floor(Date.now() / 1000),
        };
      }
      results.push(coin);
    }
    // Always add BWZ
    const bwz: CoinPrice = { symbol: 'BWZ', price: 1.1 };
    results.push(bwz);
    return results;
  }

  /**
   * SOL/USD for staking. Reads Redis; if missing, invalid, or older than `SOL_USD_QUOTE_MAX_AGE_MS`
   * (cache `timestamp` when we wrote Redis — not the same as CoinGecko's `last_updated_at`),
   * fetches CoinGecko once and updates Redis. If that fails, returns the last cached price with a warning.
   */
  async getSolUsdQuote(): Promise<SolUsdQuote> {
    const maxAgeMs = Number(
      this.config.get('SOL_USD_QUOTE_MAX_AGE_MS') ??
        DEFAULT_SOL_USD_QUOTE_MAX_AGE_MS,
    );
    if (this.isDev) {
      const devData = DEV_PRICES.SOL;
      const ts = Date.now();
      return {
        priceUsdPerSol: devData.price,
        quoteTimestampMs: ts,
      };
    }

    const parsedCache = await this.readSolUsdFromRedis();
    const freshEnough = (ts: number) => Date.now() - ts <= maxAgeMs;

    if (parsedCache?.price && parsedCache.price > 0) {
      const ts = parsedCache.quoteTimestampMs;
      if (freshEnough(ts)) {
        return {
          priceUsdPerSol: parsedCache.price,
          quoteTimestampMs: ts,
        };
      }
      this.logger.debug(
        `SOL/USD cache older than ${maxAgeMs}ms; refreshing from CoinGecko`,
      );
    }

    try {
      await this.refreshSolanaUsdPrice();
      const after = await this.readSolUsdFromRedis();
      if (after?.price && after.price > 0) {
        return {
          priceUsdPerSol: after.price,
          quoteTimestampMs: after.quoteTimestampMs,
        };
      }
    } catch (e: unknown) {
      this.logger.warn(
        `On-demand SOL/USD refresh failed: ${e instanceof Error ? e.message : e}`,
      );
    }

    if (parsedCache?.price && parsedCache.price > 0) {
      this.logger.warn(
        'Using cached SOL/USD after refresh failed or returned empty (quote may be older than preferred)',
      );
      return {
        priceUsdPerSol: parsedCache.price,
        quoteTimestampMs: parsedCache.quoteTimestampMs,
      };
    }

    throw new Error('SOL/USD price unavailable');
  }

  private async readSolUsdFromRedis(): Promise<{
    price: number;
    quoteTimestampMs: number;
  } | null> {
    const cached = await this.redis.getValue(`${SOLANA_PRICE_REDIS_ID}:price`);
    if (!cached) {
      return null;
    }
    const parsed = JSON.parse(cached) as {
      price: number;
      timestamp?: number;
      last_updated_at?: number;
    };
    if (!parsed?.price || parsed.price <= 0) {
      return null;
    }
    const quoteTimestampMs =
      typeof parsed.timestamp === 'number'
        ? parsed.timestamp
        : typeof parsed.last_updated_at === 'number'
          ? parsed.last_updated_at * 1000
          : Date.now();
    return { price: parsed.price, quoteTimestampMs };
  }

  /** Single-asset fetch + Redis write (used when cache is stale or missing). */
  private async refreshSolanaUsdPrice(): Promise<void> {
    const { data } = await firstValueFrom(
      this.http.get(this.priceUrl, {
        params: {
          vs_currencies: 'usd',
          ids: 'solana',
          include_last_updated_at: 'true',
          precision: '8',
        },
        headers: this.priceHeaders,
      }),
    );
    const coin = data?.solana;
    if (!coin?.usd || coin.usd <= 0) {
      throw new Error('No SOL price in CoinGecko response');
    }
    await this.redis.setValue(
      `${SOLANA_PRICE_REDIS_ID}:price`,
      JSON.stringify({
        price: coin.usd,
        timestamp: Date.now(),
        last_updated_at: coin.last_updated_at,
      }),
    );
    this.logger.log(`Refreshed SOL/USD in Redis: ${coin.usd}`);
  }
}
