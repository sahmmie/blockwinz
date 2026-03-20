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

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <SocketProvider namespace='chat'>
        <ChakraProvider value={system}>
          <Provider>
            <BrowserRouter>
              <Toaster />
              <App />
            </BrowserRouter>
          </Provider>
        </ChakraProvider>
      </SocketProvider>
    </QueryClientProvider>
  </StrictMode>,
);
