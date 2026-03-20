import React, { useState } from 'react';
import { Box, Stack } from '@chakra-ui/react';
import { Button } from '@/components/ui/button';
import axiosInstance from '@/lib/axios';
import useModal from '@/hooks/useModal';
import { toaster } from '@/components/ui/toaster';
import CustomInput from '@/components/CustomInput/CustomInput';
import * as Yup from 'yup';
import { useValidation } from '@/hooks/useValidation';
import axios from 'axios';
import useAccount from '@/hooks/userAccount';

interface EditEmailModalProps {}

const emailSchema = Yup.object().shape({
  email: Yup.string()
    .required('Email is required')
    .email('Invalid email address'),
});

const EditEmailModal: React.FC<EditEmailModalProps> = () => {
  const { userData, fetchProfileData } = useAccount();
  const [email, setEmail] = useState(userData?.email || '');
  const [loading, setLoading] = useState(false);
  const { closeModal } = useModal();

  const { errors, validateForm, handleBlur } = useValidation({
    values: { email },
    validationSchema: emailSchema,
    validateOnChange: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = await validateForm();
    if (Object.keys(validationErrors).length) {
      return;
    }
    setLoading(true);
    try {
      await axiosInstance.patch('/authentication/change-email', { email });
      toaster.create({
        title: 'Success!',
        description: 'Your email has been updated.',
        type: 'success',
      });
      closeModal();
      await fetchProfileData();
    } catch (err: unknown) {
      let message = 'Please try again.';
      if (axios.isAxiosError(err)) {
        message = err.response?.data?.errorMessage || message;
      }
      toaster.create({
        title: 'Failed to update email.',
        description: message,
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box as='form' onSubmit={handleSubmit} px={'24px'} mb={'32px'}>
      <Stack gap={6}>
        <CustomInput
          value={email}
          onChange={e => setEmail(e.target.value)}
          w={'100%'}
          name='email'
          placeholder='Enter your email'
          type='email'
          onBlur={() => handleBlur('email')}
          fieldProps={{
            label: 'Email',
            errorText: errors.email,
          }}
          inputGroupProps={{
            bg: '#CBCCD14D',
          }}
          required
        />
        <Box display={'flex'} justifyContent={'center'} alignItems={'center'}>
          <Button
            bg={'#00DD25'}
            type='submit'
            loading={loading}
            disabled={loading || !!errors.email}
            w={'fit-content'}
            textAlign={'center'}>
            Update Email
          </Button>
        </Box>
      </Stack>
    </Box>
  );
};

export default EditEmailModal;
