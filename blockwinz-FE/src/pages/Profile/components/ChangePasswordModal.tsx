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
import { showLoginModal } from '@/shared/utils/authModalHandler';

const passwordPattern =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&-])[A-Za-z\d@$!%*?&-]{8,}$/;

const passwordSchema = Yup.object().shape({
  currentPassword: Yup.string().required('Current password is required'),
  newPassword: Yup.string()
    .required('New password is required')
    .matches(
      passwordPattern,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    )
    .min(6, 'Password must be at least 6 characters'),
  confirmPassword: Yup.string()
    .required('Confirm new password is required')
    .oneOf([Yup.ref('newPassword')], 'Passwords must match'),
});

const ChangePasswordModal: React.FC = () => {
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const { closeModal } = useModal();

  const { errors, validateForm, handleBlur } = useValidation({
    values: form,
    validationSchema: passwordSchema,
    validateOnChange: true,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = await validateForm();
    if (Object.keys(validationErrors).length) {
      return;
    }
    setLoading(true);
    try {
      await axiosInstance.patch('/authentication/change-password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      toaster.create({
        title: 'Success!',
        description: 'Your password has been updated.',
        type: 'success',
      });
      closeModal();
      showLoginModal();
    } catch (err: unknown) {
      let message = 'Please try again.';
      if (axios.isAxiosError(err)) {
        message = err.response?.data?.errorMessage || message;
      }
      toaster.create({
        title: 'Failed to update password.',
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
          value={form.currentPassword}
          onChange={handleChange}
          w={'100%'}
          name='currentPassword'
          placeholder='Current password'
          type='password'
          onBlur={() => handleBlur('currentPassword')}
          fieldProps={{
            label: 'Current Password',
            errorText: errors.currentPassword,
          }}
          inputGroupProps={{
            bg: '#CBCCD14D',
          }}
          required
        />
        <CustomInput
          value={form.newPassword}
          onChange={handleChange}
          w={'100%'}
          name='newPassword'
          placeholder='New password'
          type='password'
          onBlur={() => handleBlur('newPassword')}
          fieldProps={{
            label: 'New Password',
            errorText: errors.newPassword,
          }}
          inputGroupProps={{
            bg: '#CBCCD14D',
          }}
          required
        />
        <CustomInput
          value={form.confirmPassword}
          onChange={handleChange}
          w={'100%'}
          name='confirmPassword'
          placeholder='Confirm new password'
          type='password'
          onBlur={() => handleBlur('confirmPassword')}
          fieldProps={{
            label: 'Confirm New Password',
            errorText: errors.confirmPassword,
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
            disabled={
              loading ||
              !!errors.currentPassword ||
              !!errors.newPassword ||
              !!errors.confirmPassword
            }
            w={'fit-content'}
            textAlign={'center'}>
            Update Password
          </Button>
        </Box>
      </Stack>
    </Box>
  );
};

export default ChangePasswordModal;
