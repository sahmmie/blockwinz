import React from 'react';
import { useGameInputsContext } from '../hooks/useGameInputsContext';
import CustomInput from '@/components/CustomInput/CustomInput';
import { Box } from '@chakra-ui/react';

const BaseInputs: React.FC = () => {
  const { baseInputs, handleInputChange } = useGameInputsContext();

  return (
    <>
      <Box mt={'16px'}>
        <CustomInput
          name='clientSeed'
          w={'100%'}
          placeholder='Client Seed'
          value={baseInputs.clientSeed}
          type='text'
          border={'1px solid #CBCCD1'}
          borderRadius={'8px'}
          inputGroupProps={{
            bg: '#000A27',
          }}
          fieldProps={{
            label: 'Client Seed',
          }}
          onChange={handleInputChange}
        />
      </Box>

      <Box mt={'16px'}>
        <CustomInput
          name='serverSeed'
          w={'100%'}
          placeholder='Server Seed'
          value={baseInputs.serverSeed}
          type='text'
          border={'1px solid #CBCCD1'}
          borderRadius={'8px'}
          inputGroupProps={{
            bg: '#000A27',
          }}
          fieldProps={{
            label: 'Server Seed',
          }}
          onChange={handleInputChange}
        />
      </Box>

      <Box mt={'16px'}>
        <CustomInput
          name='nonce'
          w={'100%'}
          placeholder='EnterNonce'
          value={baseInputs.nonce.toString()}
          type='text'
          border={'1px solid #CBCCD1'}
          borderRadius={'8px'}
          inputGroupProps={{
            bg: '#000A27',
          }}
          fieldProps={{
            label: 'Nonce',
          }}
          onChange={handleInputChange}
        />
      </Box>
    </>
  );
};

export default BaseInputs;
