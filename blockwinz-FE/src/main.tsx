import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { ChakraProvider } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import { Toaster } from './components/ui/toaster';
import './index.css';
import { Provider } from './themes/provider';
import { system } from './themes/theme.ts';
import { BrowserRouter } from 'react-router-dom';
import { SocketProvider } from './context/socketContext';
import AppErrorBoundary from './components/ErrorBoundary/AppErrorBoundary';
import { initPosthog } from './shared/utils/posthog';

const queryClient = new QueryClient();

initPosthog();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <SocketProvider namespace='chat'>
        <AppErrorBoundary>
          <ChakraProvider value={system}>
            <Provider>
              <BrowserRouter>
                <Toaster />
                <App />
              </BrowserRouter>
            </Provider>
          </ChakraProvider>
        </AppErrorBoundary>
      </SocketProvider>
    </QueryClientProvider>
  </StrictMode>,
);
