import { Box, Text } from '@chakra-ui/react';
import { FunctionComponent } from 'react';
import { Button } from '@/components/ui/button';

interface QuickMatchTabProps {
  disabled: boolean;
  loading: boolean;
  matchQueued: boolean;
  onFindMatch: () => void;
}

/**
 * Default tab: explicit stake + Find Match CTA (calls `quickMatch`).
 */
const QuickMatchTab: FunctionComponent<QuickMatchTabProps> = ({
  disabled,
  loading,
  matchQueued,
  onFindMatch,
}) => {
  return (
    <Box>
      <Box
        borderRadius='md'
        borderWidth='1px'
        borderColor='whiteAlpha.150'
        bg='blackAlpha.400'
        px={3}
        py={3}
        mb={4}>
        <Text fontSize='sm' color='gray.300' lineHeight='tall'>
          You will be matched with a player at{' '}
          <Text as='span' color='white' fontWeight='600'>
            this stake
          </Text>
          . Queue is fast—stay on this page.
        </Text>
      </Box>
      {matchQueued && (
        <Text fontSize='sm' color='#00DD25' fontWeight='600' mb={3}>
          Searching for an opponent…
        </Text>
      )}
      <Button
        w='100%'
        size='xl'
        bg='#00DD25'
        color='#151832'
        fontSize='18px'
        fontWeight='600'
        h='52px'
        loading={loading}
        disabled={disabled || loading}
        onClick={() => onFindMatch()}>
        Find match
      </Button>
    </Box>
  );
};

export default QuickMatchTab;
