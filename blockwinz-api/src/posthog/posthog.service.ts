import { Injectable, Logger, OnApplicationShutdown } from '@nestjs/common';
import { PostHog } from 'posthog-node';
import { UserDto, UserProfileResponseDto } from 'src/shared/dtos/user.dto';
import { getUserId } from 'src/shared/helpers/user.helper';

type PosthogProperties = Record<string, unknown>;

const BLOCKED_KEYS = new Set([
  'destinationAddress',
  'walletAddress',
  'address',
  'token',
  'accessToken',
  'refreshToken',
  'serverSeed',
  'futureServerSeed',
  'privateKey',
]);

function readBooleanEnv(name: string, defaultValue = false): boolean {
  const value = process.env[name]?.trim().toLowerCase();
  if (!value) {
    return defaultValue;
  }
  if (['1', 'true', 'yes', 'on'].includes(value)) {
    return true;
  }
  if (['0', 'false', 'no', 'off'].includes(value)) {
    return false;
  }
  throw new Error(`Invalid boolean environment variable: ${name}`);
}

function sanitizeProperties(
  properties: PosthogProperties = {},
): PosthogProperties {
  return Object.fromEntries(
    Object.entries(properties).filter(([key, value]) => {
      if (BLOCKED_KEYS.has(key)) {
        return false;
      }
      return value !== undefined;
    }),
  );
}

function toStringProperties(
  properties: PosthogProperties = {},
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(sanitizeProperties(properties)).map(([key, value]) => [
      key,
      String(value),
    ]),
  );
}

/**
 * Shared PostHog wrapper for server-side analytics, errors, and feature flags.
 */
@Injectable()
export class PosthogService implements OnApplicationShutdown {
  private readonly logger = new Logger(PosthogService.name);
  private readonly enabled = readBooleanEnv('POSTHOG_ENABLED', false);
  private readonly client: PostHog | null;

  constructor() {
    if (!this.enabled) {
      this.client = null;
      return;
    }

    this.client = new PostHog(process.env.POSTHOG_API_KEY as string, {
      host: process.env.POSTHOG_HOST,
      flushAt: 1,
      flushInterval: 0,
    });
  }

  /**
   * Indicates whether PostHog is enabled for the current environment.
   */
  isEnabled(): boolean {
    return this.enabled && this.client !== null;
  }

  /**
   * Captures a server-side analytics event for a user or anonymous actor.
   */
  capture(
    event: string,
    distinctId: string,
    properties: PosthogProperties = {},
  ): void {
    if (!this.client || !distinctId) {
      return;
    }

    this.client.capture({
      distinctId,
      event,
      properties: sanitizeProperties(properties),
    });
  }

  /**
   * Updates person properties for an authenticated user.
   */
  identifyUser(
    user: UserDto | UserProfileResponseDto | null | undefined,
  ): void {
    if (!this.client || !user) {
      return;
    }

    const distinctId = getUserId(user);
    if (!distinctId) {
      return;
    }

    this.client.identify({
      distinctId,
      properties: sanitizeProperties({
        username: user.username,
        email: user.email,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        userAccounts: user.userAccounts,
        canWithdraw:
          typeof user.profile === 'object'
            ? user.profile?.canWithdraw
            : undefined,
      }),
    });
  }

  /**
   * Evaluates a feature flag for a distinct user id.
   */
  async isFeatureEnabled(
    flagKey: string,
    distinctId: string,
    properties: PosthogProperties = {},
  ): Promise<boolean> {
    if (!this.client || !flagKey || !distinctId) {
      return false;
    }

    try {
      return await this.client.isFeatureEnabled(flagKey, distinctId, {
        personProperties: toStringProperties(properties),
      });
    } catch (error) {
      this.logger.warn(
        `Failed to evaluate feature flag ${flagKey}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return false;
    }
  }

  /**
   * Flushes and closes the PostHog client during shutdown.
   */
  async onApplicationShutdown(): Promise<void> {
    if (!this.client) {
      return;
    }

    await this.client.shutdown();
  }
}
