import { FunctionComponent, useEffect } from 'react';

interface ChatWootProps {}

const ChatWoot: FunctionComponent<ChatWootProps> = () => {
  useEffect(() => {
    // Set Chatwoot settings before loading the SDK
    window.chatwootSettings = {
      hideMessageBubble: true, // hides the default chat bubble
      position: 'right', // or 'left'
    };

    const BASE_URL = 'https://app.chatwoot.com';
    const WEBSITE_TOKEN = '52Zu9tYoyhJTHYYFvxyW8Fsy'; // <-- Replace this with your token

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
