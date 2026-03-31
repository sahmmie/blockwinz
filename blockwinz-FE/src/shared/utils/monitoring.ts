import { capturePosthogError } from '@/shared/utils/posthog';

type MonitoringContext = Record<string, unknown>;

const monitoringEndpoint =
  import.meta.env.VITE_MONITORING_ENDPOINT?.trim() ?? '';
const monitoringToken = import.meta.env.VITE_MONITORING_TOKEN?.trim() ?? '';

/**
 * Centralized frontend error reporting hook.
 * This currently logs and dispatches a browser event so monitoring can be wired in one place later.
 */
export function reportClientError(
  scope: string,
  error: unknown,
  context: MonitoringContext = {},
): void {
  const message = error instanceof Error ? error.message : String(error);
  const payload = {
    scope,
    message,
    context,
    timestamp: new Date().toISOString(),
  };

  console.error(`[monitoring:${scope}]`, payload, error);
  capturePosthogError(error, {
    scope,
    ...context,
  });

  if (monitoringEndpoint && typeof window !== 'undefined') {
    const body = JSON.stringify(payload);
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (monitoringToken) {
      headers.Authorization = `Bearer ${monitoringToken}`;
    }

    if (typeof navigator !== 'undefined' && 'sendBeacon' in navigator) {
      const blob = new Blob([body], { type: 'application/json' });
      navigator.sendBeacon(monitoringEndpoint, blob);
    } else {
      void fetch(monitoringEndpoint, {
        method: 'POST',
        headers,
        body,
        keepalive: true,
      }).catch(() => undefined);
    }
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('blockwinz:client-error', {
        detail: payload,
      }),
    );
  }
}
