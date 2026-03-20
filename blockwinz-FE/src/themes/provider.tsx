import { ChakraProvider } from '@chakra-ui/react';
import { system } from '@chakra-ui/react/preset';
import { ThemeProvider } from 'next-themes';

export function Provider(props: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute='class' disableTransitionOnChange>
      <ChakraProvider value={system}>{props.children}</ChakraProvider>
    </ThemeProvider>
  );
}
