import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(__dirname, '../.env') });

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { wallets } from '../src/database/schema/wallets';
import { Currency, CHAIN } from '@blockwinz/shared';
import { eq, and } from 'drizzle-orm';

async function main() {
  console.log('Starting USDT wallets backfill...');
  
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required');
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool);

  // Get distinct users who already have a Solana wallet
  const existingSolanaWallets = await db
    .select()
    .from(wallets)
    .where(
        eq(wallets.chain, CHAIN.SOLANA)
    );

  const distinctUsers = new Map<string, typeof existingSolanaWallets[0]>();
  for (const w of existingSolanaWallets) {
      if (!distinctUsers.has(w.userId)) {
          distinctUsers.set(w.userId, w);
      }
  }

  console.log(`Found ${distinctUsers.size} users with Solana wallets. Backfilling USDT...`);

  let insertedCount = 0;
  for (const [userId, referenceWallet] of distinctUsers.entries()) {
    // Check if USDT wallet already exists
    const existingUsdt = await db
        .select()
        .from(wallets)
        .where(
            and(
                eq(wallets.userId, userId),
                eq(wallets.chain, CHAIN.SOLANA),
                eq(wallets.currency, Currency.USDT)
            )
        ).limit(1);

    if (existingUsdt.length === 0) {
        await db.insert(wallets).values({
            userId: userId,
            address: referenceWallet.address,
            privateKey: referenceWallet.privateKey,
            publicKey: referenceWallet.publicKey,
            chain: CHAIN.SOLANA,
            currency: Currency.USDT,
            appBalance: '0',
            onChainBalance: '0',
            pendingWithdrawal: '0',
            lockedInBets: '0',
        } as any);
        insertedCount++;
    }
  }

  console.log(`Successfully backfilled ${insertedCount} USDT wallets.`);
  process.exit(0);
}

main().catch((err) => {
  console.error('Error during backfill:', err);
  process.exit(1);
});
