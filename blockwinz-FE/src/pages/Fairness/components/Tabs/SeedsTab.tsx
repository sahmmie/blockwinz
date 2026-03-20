import CustomInput from '@/components/CustomInput/CustomInput';
import { Button } from '@/components/ui/button';
import { Box, Text } from '@chakra-ui/react';
import { FunctionComponent, useEffect } from 'react';
import CopyIcon from '@/assets/icons/copy-icon.svg';
import { toaster } from '@/components/ui/toaster';
import { useSeedPair } from '@/hooks/useSeedPair';

interface SeedsTabProps {}

const SeedsTab: FunctionComponent<SeedsTabProps> = () => {
  const { getActiveSeedPair, activeSeedPair, rotateSeedPair, seedPairLoading } =
    useSeedPair();

  const selectTargetOnFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    event.target.select();
  };

  useEffect(() => {
    getActiveSeedPair();
  }, []);

  const copyToClipboard = (text: string) => {
    if (!text) {
      toaster.create({
        title: 'No text to copy',
        type: 'error',
      });
      return;
    }
    navigator.clipboard.writeText(text).then(
      () => {
        toaster.create({
          title: 'Copied',
          type: 'success',
        });
      },
      () => {
        toaster.create({
          title: 'Failed to Copy',
          type: 'error',
        });
      },
    );
  };

  const endElementCopyIcon = (value: string) => {
    return (
      <>
        <Button bg={'none'} onClick={() => copyToClipboard(value)}>
          <img
            src={seedPairLoading ? CopyIcon : CopyIcon}
            alt='Multiplier Icon'
            style={{ width: '20px', height: '20px' }}
          />
        </Button>
      </>
    );
  };

  return (
    <Box>
      <Box>
        <CustomInput
          w={'100%'}
          placeholder='Active Client Seed'
          value={activeSeedPair?.clientSeed}
          type='text'
          inputGroupProps={{
            bg: '#000A27',
            endElement: endElementCopyIcon(activeSeedPair?.clientSeed || ''),
          }}
          onFocus={selectTargetOnFocus}
          readOnly
          border={'1px solid #CBCCD1'}
          borderRadius={'8px'}
          fieldProps={{
            label: 'Active Client Seed',
          }}
        />
      </Box>
      <Box mt={'16px'}>
        <CustomInput
          w={'100%'}
          placeholder='Active Server Seed (hashed)'
          value={activeSeedPair?.serverSeedHashed}
          type='text'
          onFocus={selectTargetOnFocus}
          readOnly
          border={'1px solid #CBCCD1'}
          borderRadius={'8px'}
          inputGroupProps={{
            bg: '#000A27',
            endElement: endElementCopyIcon(
              activeSeedPair?.serverSeedHashed || '',
            ),
          }}
          fieldProps={{
            label: 'Active Server Seed (hashed)',
          }}
        />
      </Box>
      <Box mt={'16px'}>
        <CustomInput
          w={'100%'}
          placeholder='Total bets made with pair'
          value={activeSeedPair?.nonce}
          type='text'
          readOnly
          border={'1px solid #CBCCD1'}
          borderRadius={'8px'}
          inputGroupProps={{
            bg: '#000A27',
          }}
          fieldProps={{
            label: 'Total bets made with pair',
          }}
        />
      </Box>

      <Box mt={'32px'}>
        <Text fontSize={'20px'} fontWeight={'600'} lineHeight={'32px'}>
          Rotate Seed Pair
        </Text>

        <Box mt={'24px'}>
          <Text mb={'8px'} fontSize={'14px'}>
            New Client Seed
          </Text>
          <Box
            display={'flex'}
            gap={'16px'}
            justifyContent={'space-between'}
            alignItems={'center'}>
            <CustomInput
              w={'100%'}
              placeholder='New Client Seed'
              type='text'
              value={activeSeedPair?.futureClientSeed}
              onFocus={selectTargetOnFocus}
              readOnly
              border={'1px solid #CBCCD1'}
              borderRadius={'8px'}
              inputGroupProps={{
                bg: '#000A27',
              }}
            />
            <Button
              size={'xl'}
              bg={'#00DD25'}
              onClick={() => rotateSeedPair()}
              loading={seedPairLoading}
              disabled={seedPairLoading}>
              Rotate
            </Button>
          </Box>
        </Box>

        <Box mt={'16px'}>
          <CustomInput
            onFocus={selectTargetOnFocus}
            readOnly
            border={'1px solid #CBCCD1'}
            borderRadius={'8px'}
            value={activeSeedPair?.futureServerSeedHashed}
            type='text'
            fieldProps={{ label: 'Next Server Seed' }}
            inputGroupProps={{
              endElement: endElementCopyIcon(
                activeSeedPair?.futureServerSeedHashed || '',
              ),
            }}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default SeedsTab;
