import { Box, HStack, Text, VStack } from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { FunctionComponent } from 'react';
import { CloseButton } from '@/components/ui/close-button';
import {
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from '@/components/ui/dialog';

const pulseRing = keyframes`
  0% { transform: scale(0.88); opacity: 0.35; }
  50% { transform: scale(1); opacity: 0.85; }
  100% { transform: scale(0.88); opacity: 0.35; }
`;

const pulseRingOuter = keyframes`
  0% { transform: scale(0.95); opacity: 0.2; }
  50% { transform: scale(1.05); opacity: 0.45; }
  100% { transform: scale(0.95); opacity: 0.2; }
`;

const dotBounce = keyframes`
  0%, 80%, 100% { transform: translateY(0); opacity: 0.35; }
  40% { transform: translateY(-7px); opacity: 1; }
`;

const shimmer = keyframes`
  0% { background-position: 0% 50%; }
  100% { background-position: 200% 50%; }
`;

export interface FindingMatchModalProps {
  open: boolean;
  /** While true, user can cancel search (× / Esc). Hide controls once a match is resolving. */
  canCancel: boolean;
  /** Dequeue, reset matchmaking state, and close (parent should set `open` false). */
  onCancelSearch: () => void;
  /** Display stake, e.g. "0.05 SOL" */
  formattedStake: string;
  /** Mirrors "Exact stake only" — affects copy in the modal. */
  exactStakeOnly: boolean;
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <HStack justify='space-between' align='flex-start' gap={4} py={2}>
      <Text
        fontSize='xs'
        fontWeight='600'
        color='gray.500'
        textTransform='uppercase'
        letterSpacing='0.05em'
        flexShrink={0}>
        {label}
      </Text>
      <Text
        fontSize='sm'
        color='gray.100'
        textAlign='right'
        lineHeight='short'
        fontWeight='500'>
        {value}
      </Text>
    </HStack>
  );
}

/**
 * Shown while quick match is searching; closes from parent on timeout or when a session is ready.
 */
const FindingMatchModal: FunctionComponent<FindingMatchModalProps> = ({
  open,
  canCancel,
  onCancelSearch,
  formattedStake,
  exactStakeOnly,
}) => {
  const modeDescription = exactStakeOnly
    ? 'Only opponents with the same stake.'
    : 'You may pair with the same stake or lower; the table uses the lower amount.';

  return (
    <DialogRoot
      open={open}
      closeOnInteractOutside={false}
      closeOnEscape={false}
      onEscapeKeyDown={(e) => {
        if (!canCancel) return;
        e.preventDefault();
        onCancelSearch();
      }}
      placement='center'
      lazyMount
      size='md'>
      <DialogContent
        position='relative'
        maxW='min(100vw - 24px, 400px)'
        p={0}
        overflow='hidden'
        bg='linear-gradient(165deg, #1a1f42 0%, #151832 45%, #12152e 100%)'
        borderWidth='1px'
        borderColor='whiteAlpha.200'
        boxShadow='0 0 0 1px rgba(0, 221, 37, 0.12), 0 20px 50px rgba(0, 0, 0, 0.45)'>
        {canCancel && (
          <CloseButton
            position='absolute'
            top={2}
            insetEnd={2}
            zIndex={2}
            size='sm'
            color='gray.400'
            _hover={{ bg: 'whiteAlpha.100', color: 'white' }}
            aria-label='Cancel search'
            onClick={() => onCancelSearch()}
          />
        )}
        <Box
          h='3px'
          w='100%'
          bgGradient='linear(to-r, transparent, #00DD25, #00FF6A, #00DD25, transparent)'
          backgroundSize='200% 100%'
          animation={`${shimmer} 3.5s ease-in-out infinite`}
        />
        <DialogHeader
          pb={0}
          pt={6}
          px={6}
          display='block'
          width='100%'>
          <VStack gap={3} align='stretch' width='100%'>
            <Box width='100%'>
              <DialogTitle
                fontSize='xl'
                fontWeight='700'
                color='white'
                textAlign='center'
                letterSpacing='-0.02em'
                display='block'
                width='100%'>
                Finding a match
              </DialogTitle>
            </Box>
            <Box width='100%'>
              <Text
                id='finding-match-modal-subtitle'
                fontSize='sm'
                color='gray.400'
                textAlign='center'
                lineHeight='tall'
                display='block'
                width='100%'>
                Looking for an opponent on the same game and currency. This
                usually takes a few seconds.
              </Text>
            </Box>
          </VStack>
        </DialogHeader>
        <DialogBody px={6} pb={7} pt={5}>
          <VStack gap={6} align='stretch'>
            <Box
              borderRadius='lg'
              borderWidth='1px'
              borderColor='whiteAlpha.150'
              bg='blackAlpha.400'
              px={4}
              py={1}>
              <DetailRow label='Your stake' value={formattedStake} />
              <Box h='1px' bg='whiteAlpha.100' mx={-1} />
              <DetailRow
                label='Match rules'
                value={exactStakeOnly ? 'Exact stake only' : 'Flexible stake'}
              />
              <Text fontSize='xs' color='gray.500' lineHeight='short' pb={2} pt={0}>
                {modeDescription}
              </Text>
            </Box>

            <Box
              position='relative'
              w='88px'
              h='88px'
              mx='auto'
              display='flex'
              alignItems='center'
              justifyContent='center'>
              <Box
                position='absolute'
                inset='-8px'
                borderRadius='full'
                borderWidth='2px'
                borderColor='#00DD25'
                opacity={0.25}
                animation={`${pulseRingOuter} 2.2s ease-in-out infinite`}
              />
              <Box
                position='absolute'
                inset={0}
                borderRadius='full'
                borderWidth='3px'
                borderColor='#00DD25'
                animation={`${pulseRing} 1.5s ease-in-out infinite`}
              />
              <Box
                w='40px'
                h='40px'
                borderRadius='full'
                bg='linear-gradient(145deg, #00FF6A 0%, #00DD25 100%)'
                boxShadow='0 0 24px rgba(0, 221, 37, 0.45)'
              />
            </Box>

            <VStack gap={2}>
              <Text fontSize='sm' color='gray.300' textAlign='center' lineHeight='tall'>
                Hold tight — we&apos;ll drop you in as soon as someone is available.
              </Text>
              <HStack gap={1.5} justify='center' h='26px' aria-hidden>
                {[0, 1, 2].map((i) => (
                  <Box
                    key={i}
                    w='7px'
                    h='7px'
                    borderRadius='full'
                    bg='#00DD25'
                    animation={`${dotBounce} 1s ease-in-out ${i * 0.14}s infinite`}
                  />
                ))}
              </HStack>
            </VStack>
          </VStack>
        </DialogBody>
      </DialogContent>
    </DialogRoot>
  );
};

export default FindingMatchModal;
