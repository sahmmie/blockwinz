'use client';

import {
  Box,
  HStack,
  Toaster as ChakraToaster,
  Portal,
  Spinner,
  Stack,
  Toast,
  createToaster,
} from '@chakra-ui/react';

export const toaster = createToaster({
  placement: 'top-end',
  pauseOnPageIdle: true,
  max: 3,
});

export const Toaster = () => {
  return (
    <Portal>
      <ChakraToaster toaster={toaster} insetInline={{ mdDown: '4' }}>
        {toast => (
          <Toast.Root width={{ md: 'sm' }}>
            {toast.type === 'loading' ? (
              <Spinner size='sm' color='blue.solid' />
            ) : (
              <Toast.Indicator />
            )}
            <Stack gap='1' flex='1' minW={0} maxW='100%'>
              <HStack
                align='center'
                justify='space-between'
                gap='2'
                w='100%'>
                {toast.title ? (
                  <Toast.Title flex='1' minW={0}>
                    {toast.title}
                  </Toast.Title>
                ) : (
                  <Box flex='1' minW={0} />
                )}
                {toast.meta?.closable !== false ? (
                  <Toast.CloseTrigger
                    aria-label='Dismiss notification'
                    flexShrink={0}
                  />
                ) : null}
              </HStack>
              {toast.description && (
                <Toast.Description>{toast.description}</Toast.Description>
              )}
            </Stack>
            {toast.action && (
              <Toast.ActionTrigger>{toast.action.label}</Toast.ActionTrigger>
            )}
          </Toast.Root>
        )}
      </ChakraToaster>
    </Portal>
  );
};
