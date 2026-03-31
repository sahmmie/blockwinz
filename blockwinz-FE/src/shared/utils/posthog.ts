import posthog from 'posthog-js';
import type { PostHogConfig } from 'posthog-js';
import {
  APP_ENV,
  APP_VERSION,
  POSTHOG_ENABLE_SESSION_REPLAY,
  POSTHOG_ENABLE_SURVEYS,
  POSTHOG_ENABLED,
  POSTHOG_HOST,
  POSTHOG_KEY,
} from '@/shared/constants/app.constant';
import type { UserI } from '@/shared/interfaces/account.interface';

type EventProperties = Record<string, unknown>;

let initialized = false;

function buildInitConfig(): Partial<PostHogConfig> {
  return {
    api_host: POSTHOG_HOST,
    capture_pageview: false,
    capture_pageleave: true,
    persistence: 'localStorage+cookie',
    autocapture: true,
    person_profiles: 'identified_only',
    disable_session_recording: !POSTHOG_ENABLE_SESSION_REPLAY,
    disable_surveys: !POSTHOG_ENABLE_SURVEYS,
    session_recording: {
      maskAllInputs: true,
      maskInputOptions: {
        password: true,
        email: true,
      },
    },
    loaded: (client) => {
      client.register({
        app: 'blockwinz-fe',
        appVersion: APP_VERSION,
        appEnv: APP_ENV,
      });
    },
  };
}

function sanitizeProperties(properties: EventProperties = {}): EventProperties {
  const blockedKeys = new Set([
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

  return Object.fromEntries(
    Object.entries(properties).filter(([key, value]) => {
      if (blockedKeys.has(key)) {
        return false;
      }
      return value !== undefined;
    }),
  );
}

export function initPosthog(): void {
  if (!POSTHOG_ENABLED || initialized) {
    return;
  }

  posthog.init(POSTHOG_KEY, buildInitConfig());
  initialized = true;
}

export function isPosthogEnabled(): boolean {
  return POSTHOG_ENABLED;
}

export function capturePosthogEvent(
  event: string,
  properties: EventProperties = {},
): void {
  if (!POSTHOG_ENABLED || !initialized) {
    return;
  }

  posthog.capture(event, sanitizeProperties(properties));
}

export function capturePosthogError(
  error: unknown,
  properties: EventProperties = {},
): void {
  const sanitized = sanitizeProperties(properties);
  const message = error instanceof Error ? error.message : String(error);

  if (POSTHOG_ENABLED && initialized && typeof posthog.captureException === 'function') {
    posthog.captureException(error, sanitized);
  }

  capturePosthogEvent('client_error_reported', {
    ...sanitized,
    message,
  });
}

function buildPersonProperties(user: UserI): EventProperties {
  return sanitizeProperties({
    username: user.username,
    email: user.email,
    emailVerified: user.emailVerified,
    createdAt: user.createdAt,
    userAccounts: user.userAccounts,
    canWithdraw:
      typeof user.profile === 'object' ? user.profile?.canWithdraw : undefined,
    referralCount:
      typeof user.profile === 'object' ? user.profile?.referralCount : undefined,
  });
}

export function identifyPosthogUser(user: UserI): void {
  if (!POSTHOG_ENABLED || !initialized) {
    return;
  }

  const distinctId = user.id ?? user._id;
  if (!distinctId) {
    return;
  }

  posthog.identify(String(distinctId), buildPersonProperties(user));
}

export function resetPosthog(): void {
  if (!POSTHOG_ENABLED || !initialized) {
    return;
  }

  posthog.reset();
}

export function reloadPosthogFeatureFlags(): void {
  if (!POSTHOG_ENABLED || !initialized) {
    return;
  }

  posthog.reloadFeatureFlags();
}

export function isPosthogFeatureEnabled(flagKey: string): boolean | undefined {
  if (!POSTHOG_ENABLED || !initialized || !flagKey.trim()) {
    return undefined;
  }

  return posthog.isFeatureEnabled(flagKey);
}

export function subscribeToPosthogFeatureFlags(
  onChange: () => void,
): () => void {
  if (!POSTHOG_ENABLED || !initialized) {
    return () => undefined;
  }

  posthog.onFeatureFlags(onChange);
  return () => undefined;
}
