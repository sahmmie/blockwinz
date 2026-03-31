import React from 'react';
import { Box, Text } from '@chakra-ui/react';
import { Button } from '@/components/ui/button';
import { reportClientError } from '@/shared/utils/monitoring';

type Props = {
  children: React.ReactNode;
};

type State = {
  hasError: boolean;
};

class AppErrorBoundary extends React.Component<Props, State> {
  state: State = {
    hasError: false,
  };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    reportClientError('react-error-boundary', error, {
      componentStack: errorInfo.componentStack,
    });
  }

  private handleReload = (): void => {
    window.location.reload();
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <Box
          minH='100vh'
          bg='#0F172A'
          color='white'
          display='flex'
          alignItems='center'
          justifyContent='center'
          px='24px'
        >
          <Box maxW='420px' textAlign='center'>
            <Text fontSize='28px' fontWeight='700' mb='12px'>
              Something went wrong
            </Text>
            <Text color='gray.300' mb='20px'>
              The app hit an unexpected error. Reload to recover the session.
            </Text>
            <Button onClick={this.handleReload}>Reload App</Button>
          </Box>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default AppErrorBoundary;
