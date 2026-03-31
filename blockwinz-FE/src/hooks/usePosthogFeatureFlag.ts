import { useEffect, useState } from 'react';
import {
  isPosthogFeatureEnabled,
  subscribeToPosthogFeatureFlags,
} from '@/shared/utils/posthog';

export function usePosthogFeatureFlag(
  flagKey: string,
  defaultValue = false,
): boolean {
  const [enabled, setEnabled] = useState<boolean>(() => {
    const value = isPosthogFeatureEnabled(flagKey);
    return value ?? defaultValue;
  });

  useEffect(() => {
    const syncFlagValue = () => {
      const value = isPosthogFeatureEnabled(flagKey);
      setEnabled(value ?? defaultValue);
    };

    syncFlagValue();
    return subscribeToPosthogFeatureFlags(() => {
      syncFlagValue();
    });
  }, [defaultValue, flagKey]);

  return enabled;
}
