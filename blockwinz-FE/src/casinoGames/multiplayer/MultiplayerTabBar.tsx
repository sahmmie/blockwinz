import { Box, Text } from '@chakra-ui/react';
import { FunctionComponent } from 'react';
import { Button } from '@/components/ui/button';
import type { MultiplayerPanelTab } from './types';

const OPTIONS: { label: string; value: MultiplayerPanelTab }[] = [
  { label: 'Host', value: 'create' },
  { label: 'Browse', value: 'lobbies' },
  { label: 'Join', value: 'join' },
];

/**
 * Segmented control for multiplayer intents (host includes quick match + create lobby).
 */
export const MultiplayerTabBar: FunctionComponent<{
  value: MultiplayerPanelTab;
  onChange: (tab: MultiplayerPanelTab) => void;
}> = ({ value, onChange }) => {
  return (
    <Box
      w='100%'
      display='flex'
      gap='4px'
      bg='#000A27'
      borderRadius='10px'
      p='5px'
      borderWidth='1px'
      borderColor='whiteAlpha.300'>
      {OPTIONS.map((opt) => {
        const active = value === opt.value;
        return (
          <Button
            key={opt.value}
            type='button'
            variant='ghost'
            flex={1}
            minW={0}
            h={{ base: '36px', md: '40px' }}
            borderRadius='8px'
            onClick={() => onChange(opt.value)}
            bg={active ? '#00DD25' : 'transparent'}
            color={active ? '#151832' : '#ECF0F1'}
            fontWeight='600'
            p={1}
            _hover={{
              bg: active ? '#00DD25' : 'rgba(255,255,255,0.08)',
            }}>
            <Text
              fontSize={{ base: '11px', sm: '12px', md: '13px' }}
              fontWeight='600'
              textAlign='center'
              lineHeight='1.1'
              px={0.5}>
              {opt.label}
            </Text>
          </Button>
        );
      })}
    </Box>
  );
};
