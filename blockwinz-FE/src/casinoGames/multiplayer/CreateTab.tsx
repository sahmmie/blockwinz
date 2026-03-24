import { Box, HStack, Input, Text, VStack } from '@chakra-ui/react';
import { type ChangeEvent, FunctionComponent, useState } from 'react';
import { customAlphabet } from 'nanoid';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tooltip } from '@/components/ui/tooltip';
import InfoIcon from '@/assets/icons/info-icon.svg';
import { LobbyVisibility } from '@blockwinz/shared';
import type { CreateLobbyParams } from './types';

const genJoinCode = customAlphabet(
  '23456789ABCDEFGHJKLMNPQRSTUVWXYZ',
  6,
);

interface CreateTabProps {
  betAmount: number;
  currency: string;
  disabled: boolean;
  /** Create lobby / other host actions (not quick match). */
  createLoading: boolean;
  /** In-flight Find match request (opening modal + socket ack). */
  findMatchLoading: boolean;
  exactStakeOnly: boolean;
  onExactStakeOnlyChange: (value: boolean) => void;
  onFindMatch: () => void;
  onCreate: (params: CreateLobbyParams) => void;
}

/**
 * Host flow: create a lobby, or quick match from the same tab.
 */
const CreateTab: FunctionComponent<CreateTabProps> = ({
  betAmount,
  currency,
  disabled,
  createLoading,
  findMatchLoading,
  exactStakeOnly,
  onExactStakeOnlyChange,
  onFindMatch,
  onCreate,
}) => {
  const [visibility, setVisibility] = useState<LobbyVisibility>(
    LobbyVisibility.PUBLIC,
  );
  const [joinCode, setJoinCode] = useState('');

  const handleCreate = () => {
    onCreate({
      betAmount,
      currency,
      visibility,
      joinCode:
        visibility === LobbyVisibility.PRIVATE ? joinCode.trim() : undefined,
      betAmountMustEqual: exactStakeOnly,
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
            variant={
              visibility === LobbyVisibility.PUBLIC ? 'solid' : 'outline'
            }
            bg={visibility === LobbyVisibility.PUBLIC ? '#00DD25' : undefined}
            color={
              visibility === LobbyVisibility.PUBLIC ? '#151832' : undefined
            }
            borderColor='whiteAlpha.300'
            onClick={() => setVisibility(LobbyVisibility.PUBLIC)}>
            Public
          </Button>
          <Button
            size='sm'
            flex={1}
            minW='100px'
            variant={
              visibility === LobbyVisibility.PRIVATE ? 'solid' : 'outline'
            }
            bg={visibility === LobbyVisibility.PRIVATE ? '#00DD25' : undefined}
            color={
              visibility === LobbyVisibility.PRIVATE ? '#151832' : undefined
            }
            borderColor='whiteAlpha.300'
            onClick={() => setVisibility(LobbyVisibility.PRIVATE)}>
            Private
          </Button>
        </HStack>
      </Box>

      {visibility === LobbyVisibility.PRIVATE && (
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
        display='flex'
        justifyContent='space-between'
        alignItems='center'
        gap={3}
        borderRadius='md'
        borderWidth='1px'
        borderColor='whiteAlpha.150'
        bg='blackAlpha.400'
        px={3}
        py={3}>
        <HStack gap={2} align='center' minW={0}>
          <Text as='span' fontSize='sm' color='gray.200'>
            Exact stake only
          </Text>
          <Tooltip
            content={
              <Text fontSize='sm' lineHeight='short' maxW='240px'>
                When off, you can match the same stake or lower; the table uses
                the lower amount.
              </Text>
            }
            showArrow
            openDelay={200}
            portalled
            positioning={{ placement: 'top' }}>
            <Box
              as='span'
              display='inline-flex'
              alignItems='center'
              flexShrink={0}
              cursor='help'
              lineHeight={0}
              aria-label='About exact stake only'>
              <img
                src={InfoIcon}
                alt=''
                width={16}
                height={16}
                style={{ opacity: 0.55 }}
              />
            </Box>
          </Tooltip>
        </HStack>
        <Switch
          labelDirection='right'
          checked={exactStakeOnly}
          onCheckedChange={({ checked }) =>
            onExactStakeOnlyChange(Boolean(checked))
          }
        />
      </Box>

      <Button
        w='100%'
        size='lg'
        h='52px'
        bg='#00DD25'
        color='#151832'
        fontWeight='600'
        fontSize='md'
        loading={createLoading}
        disabled={
          disabled ||
          createLoading ||
          findMatchLoading ||
          betAmount <= 0 ||
          (visibility === LobbyVisibility.PRIVATE && !joinCode.trim())
        }
        onClick={handleCreate}>
        Create game
      </Button>

      <Box
        display='flex'
        alignItems='center'
        gap={3}
        py={2}
        aria-hidden>
        <Box flex={1} h='1px' bg='whiteAlpha.200' />
        <Text fontSize='xs' color='gray.500' textTransform='uppercase'>
          Or
        </Text>
        <Box flex={1} h='1px' bg='whiteAlpha.200' />
      </Box>

      <Button
        w='100%'
        size='lg'
        h='52px'
        variant='outline'
        borderColor='whiteAlpha.400'
        color='#ECF0F1'
        fontWeight='600'
        fontSize='md'
        loading={findMatchLoading}
        disabled={disabled || createLoading || findMatchLoading}
        onClick={() => onFindMatch()}>
        Find match
      </Button>
    </VStack>
  );
};

export default CreateTab;
