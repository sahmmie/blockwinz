import { Stack, Text } from '@chakra-ui/react';
import { FunctionComponent } from 'react';
import { Link } from 'react-router-dom';

interface TestnetNoticeContentProps {}

const TestnetNoticeContent: FunctionComponent<TestnetNoticeContentProps> = () => {
  return (
    <Stack gap={4} p={6}>
      <Text fontWeight='bold' fontSize='xl'>
        🎉  Welcome to Blockwinz!
      </Text>
      <Text>
        You're currently playing on the <strong>Solana Testnet</strong> for the
        next few days.
      </Text>
      <Text _hover={{ color: '#00DD25' }}>
        💰{' '}
        <Link
          to='https://bwzfunding.netlify.app/'
          target='_blank'
          rel='noopener noreferrer'>
          <span style={{ textDecoration: 'underline' }}>
            Get free test tokens
          </span>{' '}
        </Link>
      </Text>
      <Text>🎮 Play all games risk-free</Text>
      <Link
        target='_blank'
        rel='noopener noreferrer'
        to='https://discord.gg/dGTbVbWV'>
        <Text _hover={{ color: '#00DD25' }}>
          🐛{' '}
          <span style={{ textDecoration: 'underline' }}>
            Found a bug? Report it in our Discord!
          </span>{' '}
        </Text>
      </Link>
    </Stack>
  );
};

export default TestnetNoticeContent;
