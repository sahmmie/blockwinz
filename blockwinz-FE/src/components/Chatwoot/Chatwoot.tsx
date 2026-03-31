import { FunctionComponent, useEffect } from 'react';
import { reportClientError } from '@/shared/utils/monitoring';

interface ChatWootProps {}

const ChatWoot: FunctionComponent<ChatWootProps> = () => {
  useEffect(() => {
    const BASE_URL = import.meta.env.VITE_CHATWOOT_BASE_URL?.trim();
    const WEBSITE_TOKEN = import.meta.env.VITE_CHATWOOT_WEBSITE_TOKEN?.trim();
    if (!BASE_URL || !WEBSITE_TOKEN) {
      return;
    }

    // Set Chatwoot settings before loading the SDK
    window.chatwootSettings = {
      hideMessageBubble: true, // hides the default chat bubble
      position: 'right', // or 'left'
    };

    const loadChatwoot = () => {
      const script = document.createElement('script');
      script.src = `${BASE_URL}/packs/js/sdk.js`;
      script.async = true;
      script.defer = true;

      script.onload = () => {
        if (window.chatwootSDK) {
          window.chatwootSDK.run({
            websiteToken: WEBSITE_TOKEN,
            baseUrl: BASE_URL,
          });
        }
      };
      script.onerror = () => {
        reportClientError('chatwoot-load', 'Failed to load Chatwoot SDK');
      };

      document.body.appendChild(script);
    };

    // Load only once
    if (!window.chatwootSDK) {
      loadChatwoot();
    }

    // Optional: Listen for when Chatwoot is ready
    const handleReady = () => {
      console.info('Chat is ready');
    };

    window.addEventListener('chatwoot:ready', handleReady);

    return () => {
      window.removeEventListener('chatwoot:ready', handleReady);
    };
  }, []);

  return null; // This component doesn't render anything visually
};

export default ChatWoot;

declare global {
  interface Window {
    chatwootSettings?: {
      hideMessageBubble: boolean;
      position: 'right' | 'left';
    };
    chatwootSDK?: {
      run: (config: { websiteToken: string; baseUrl: string }) => void;
    };
  }
}
