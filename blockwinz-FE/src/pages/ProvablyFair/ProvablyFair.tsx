import { Button } from '@/components/ui/button';
import { Box, Heading, Text, VStack, Code } from '@chakra-ui/react';
import { FunctionComponent } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProvablyFairIcon from '@/assets/icons/checkmark-icon.svg';
import useModal, { ModalProps } from '@/hooks/useModal';
import Fairness from '../Fairness/Fairness';
import { patchFairnessUrlParams, PF_KEYS } from '../Fairness/fairnessUrlParams';

interface ProvablyFairProps {}

const ProvablyFair: FunctionComponent<ProvablyFairProps> = () => {
  const { openModal } = useModal();
  const [, setSearchParams] = useSearchParams();
  const openFairnessModal = () => {
    setSearchParams(
      prev =>
        patchFairnessUrlParams(prev, {
          [PF_KEYS.TAB]: 'verify',
        }),
      { replace: true },
    );
    const modalConfig: ModalProps = {
      size: 'lg',
      hideCloseButton: false,
      hideHeader: true,
      width: { base: '90%', md: '600px' },
      backgroundColor: '#000A27',
      autoCloseAfter: 0,
      left: { base: '0', md: '20' },
      backdrop: true,
      scrollBehavior: 'inside',
    };

    openModal(
      <Fairness preSelectedSegment='verify' />,
      'Fairness',
      modalConfig,
    );
  };

  return (
    <Box
      p={{ base: '16px', md: '24px' }}
      mx='auto'
      color='white'
      bg={'#151832'}
      borderRadius='8px'
      fontSize={'14px'}>
      <VStack gap={6} align='start'>
        <Heading fontSize={{ base: '2xl', md: '3xl' }} fontWeight={700}>
          Provably Fair Gaming
        </Heading>

        <Text fontSize='16px'>
          At BlockWinz, we use a provably fair system to ensure that every game
          result is transparent and verifiable. This means you don’t have to
          just trust us — you can verify the fairness of every round yourself.
        </Text>

        <Heading fontSize='xl'>🔐 How It Works</Heading>

        <Text>Each game round is determined by a combination of:</Text>
        <VStack align='start' pl={4} gap={2}>
          <Text>
            • <strong>Server Seed</strong> (kept secret until rotation)
          </Text>
          <Text>
            • <strong>Client Seed</strong> (you can set or use default)
          </Text>
          <Text>
            • <strong>Nonce</strong> (incremented per round)
          </Text>
        </VStack>

        <Text>
          The game outcome is calculated by hashing these values together using
          the SHA-256 algorithm:
        </Text>

        <Code p={4} w='100%' whiteSpace='pre-wrap' bg='gray.800'>
          hash = SHA256(serverSeed + clientSeed + nonce)
        </Code>

        <Text>
          The server seed is kept hidden while active. Once the seed pair is
          rotated, it is revealed so you can verify that previous outcomes were
          fair and unaltered.
        </Text>

        <Heading fontSize='xl'>🛠 Example</Heading>

        <Text>Suppose:</Text>
        <VStack align='start' pl={4} gap={1}>
          <Text>
            • serverSeed = <Code>3a1c9f...</Code>
          </Text>
          <Text>
            • clientSeed = <Code>my-custom-seed</Code>
          </Text>
          <Text>
            • nonce = <Code>5</Code>
          </Text>
        </VStack>

        <Text>The hash would be:</Text>
        <Code p={4} w='100%' whiteSpace='pre-wrap' bg='gray.800'>
          SHA256("3a1c9f...my-custom-seed5") = d4e65a...
        </Code>

        <Text fontSize='md'>
          You can verify this result using any SHA-256 hash generator. This
          transparency helps us prove every round is fair — with no
          manipulations.
        </Text>

        <Box w={{ base: '100%', md: 'auto' }}>
          <Button
            variant={'outline'}
            border={'1px solid #62E166'}
            color={'#FFFFFF'}
            w={'100%'}
            onClick={openFairnessModal}>
            Verify Game
            <img
              src={ProvablyFairIcon}
              alt='Provably Fair Icon'
              style={{ width: '24px', height: '24px' }}
            />
          </Button>
        </Box>

        <Text fontSize='sm' color='gray.400'>
          If you have any questions or want to learn more about our provably
          fair system, feel free to contact our support team.
        </Text>
      </VStack>
    </Box>
  );
};

export default ProvablyFair;
