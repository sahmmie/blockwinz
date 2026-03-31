type MonitoringContext = Record<string, unknown>;

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

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('blockwinz:client-error', {
        detail: payload,
      }),
    );
  }
}
