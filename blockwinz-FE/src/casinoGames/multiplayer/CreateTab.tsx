import { Box, HStack, Input, Text, VStack } from '@chakra-ui/react';
import { type ChangeEvent, FunctionComponent, useState } from 'react';
import { customAlphabet } from 'nanoid';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import type { CreateLobbyParams } from './types';

const genJoinCode = customAlphabet(
  '23456789ABCDEFGHJKLMNPQRSTUVWXYZ',
  6,
);

interface CreateTabProps {
  betAmount: number;
  currency: string;
  disabled: boolean;
  loading: boolean;
  onCreate: (params: CreateLobbyParams) => void;
}

/**
 * Host flow: public/private, optional exact stake, join code for private.
 */
const CreateTab: FunctionComponent<CreateTabProps> = ({
  betAmount,
  currency,
  disabled,
  loading,
  onCreate,
}) => {
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [joinCode, setJoinCode] = useState('');
  const [exactStake, setExactStake] = useState(false);

  const handleCreate = () => {
    onCreate({
      betAmount,
      currency,
      visibility,
      joinCode: visibility === 'private' ? joinCode.trim() : undefined,
      betAmountMustEqual: exactStake,
      maxPlayers: 2,
    });
  };

  return (
    <VStack gap={4} align='stretch'>
      <Box>
        <Text
          fontSize='xs'
          fontWeight='600'
          color='gray.500'
          textTransform='uppercase'
          letterSpacing='0.06em'
          mb={2}>
          Visibility
        </Text>
        <HStack gap={2} flexWrap='wrap'>
          <Button
            size='sm'
            flex={1}
            minW='100px'
            variant={visibility === 'public' ? 'solid' : 'outline'}
            bg={visibility === 'public' ? '#00DD25' : undefined}
            color={visibility === 'public' ? '#151832' : undefined}
            borderColor='whiteAlpha.300'
            onClick={() => setVisibility('public')}>
            Public
          </Button>
          <Button
            size='sm'
            flex={1}
            minW='100px'
            variant={visibility === 'private' ? 'solid' : 'outline'}
            bg={visibility === 'private' ? '#00DD25' : undefined}
            color={visibility === 'private' ? '#151832' : undefined}
            borderColor='whiteAlpha.300'
            onClick={() => setVisibility('private')}>
            Private
          </Button>
        </HStack>
      </Box>

      {visibility === 'private' && (
        <Box>
          <Text
            fontSize='xs'
            fontWeight='600'
            color='gray.500'
            textTransform='uppercase'
            letterSpacing='0.06em'
            mb={2}>
            Join code
          </Text>
          <HStack gap={2} align='stretch'>
            <Input
              flex={1}
              value={joinCode}
              placeholder='Generate or type'
              autoComplete='off'
              size='md'
              h='42px'
              px={3}
              bg='blackAlpha.500'
              borderWidth='1px'
              borderColor='whiteAlpha.200'
              borderRadius='md'
              color='white'
              fontSize='sm'
              _placeholder={{ color: 'whiteAlpha.400' }}
              _focus={{
                borderColor: 'rgba(0, 221, 37, 0.65)',
                boxShadow: '0 0 0 1px rgba(0, 221, 37, 0.25)',
              }}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setJoinCode(e.target.value.toUpperCase())
              }
            />
            <Button
              h='42px'
              px={4}
              variant='outline'
              borderColor='whiteAlpha.300'
              flexShrink={0}
              onClick={() => setJoinCode(genJoinCode())}>
              Generate
            </Button>
          </HStack>
          <Text fontSize='xs' color='gray.500' mt={2} lineHeight='short'>
            Share with your opponent. The server stores a hash only.
          </Text>
        </Box>
      )}

      <Box
        borderRadius='md'
        borderWidth='1px'
        borderColor='whiteAlpha.150'
        bg='blackAlpha.400'
        px={3}
        py={3}>
        <Switch
          labelDirection='right'
          checked={exactStake}
          onCheckedChange={({ checked }) => setExactStake(checked)}>
          <Text as='span' fontSize='sm' color='gray.200'>
            Exact stake only (joiners must match this amount)
          </Text>
        </Switch>
      </Box>

      <Button
        w='100%'
        size='lg'
        h='52px'
        bg='#00DD25'
        color='#151832'
        fontWeight='600'
        fontSize='md'
        loading={loading}
        disabled={
          disabled ||
          loading ||
          betAmount <= 0 ||
          (visibility === 'private' && !joinCode.trim())
        }
        onClick={handleCreate}>
        Create game
      </Button>
    </VStack>
  );
};

export default CreateTab;
