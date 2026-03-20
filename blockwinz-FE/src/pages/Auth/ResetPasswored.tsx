import CustomInput from '@/components/CustomInput/CustomInput';
import { Button } from '@/components/ui/button';
import { toaster } from '@/components/ui/toaster';
import useModal from '@/hooks/useModal';
import { useValidation } from '@/hooks/useValidation';
import axiosService from '@/lib/axios';
import { HttpError } from '@/shared/interfaces/http.interface';
import { Box } from '@chakra-ui/react';
import { FunctionComponent, useState } from 'react';
import * as Yup from 'yup';
import { pagesT } from './Authentication';
import { AxiosError } from 'axios';

interface ResetPasswordProps {
  setActiveTab: (tab: pagesT) => void;
}

const ResetPassword: FunctionComponent<ResetPasswordProps> = ({
  setActiveTab,
}) => {
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [formValues, setFormValues] = useState({
    email: '',
    otp: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const { closeModal } = useModal();

  const emailValidationSchema = Yup.object().shape({
    email: Yup.string()
      .required('Email is required')
      .email('Invalid email address'),
  });

  const resetValidationSchema = Yup.object().shape({
    otp: Yup.string()
      .required('OTP is required')
      .length(6, 'OTP must be 6 characters'),
    password: Yup.string()
      .required('Password is required')
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&\-])[A-Za-z\d@$!%*?&\-]{8,}$/,
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      )
      .min(8, 'Password must be at least 8 characters'),
    confirmPassword: Yup.string()
      .required('Confirm password is required')
      .oneOf([Yup.ref('password')], 'Passwords must match'),
  });

  const { errors, validateForm, handleBlur } = useValidation({
    values: formValues,
    validationSchema:
      step === 'email' ? emailValidationSchema : resetValidationSchema,
    validateOnChange: true,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues(prev => ({ ...prev, [name]: value }));
  };

  const handleSendOTP = async () => {
    try {
      await axiosService.post('/authentication/password-reset/request', {
        email: formValues.email,
      });
      setStep('otp');
      toaster.create({
        title: 'OTP sent successfully',
        type: 'success',
      });
    } catch (error: unknown) {
      toaster.create({
        title:
          (error as AxiosError<HttpError>).response?.data?.errorMessage ||
          'Failed to send OTP',
        type: 'error',
      });
    }
  };

  const handleResetPassword = async () => {
    try {
      await axiosService.post('/authentication/password-reset/verify', {
        email: formValues.email,
        otp: formValues.otp,
        newPassword: formValues.password,
      });
      toaster.create({
        title: 'Password reset successfully',
        type: 'success',
      });
      closeModal();
      setActiveTab('login');
    } catch (error: unknown) {
      toaster.create({
        title:
          (error as AxiosError<HttpError>).response?.data?.errorMessage ||
          'Failed to reset password',
        type: 'error',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const validationErrors = await validateForm();
    if (Object.keys(validationErrors).length) return;

    setLoading(true);
    try {
      if (step === 'email') {
        await handleSendOTP();
      } else {
        await handleResetPassword();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ width: '100%' }}>
      {step === 'email' ? (
        <Box>
          <CustomInput
            w={'100%'}
            name='email'
            placeholder='Email'
            onChange={handleChange}
            value={formValues.email}
            type='email'
            onBlur={() => handleBlur('email')}
            fieldProps={{
              label: 'Email',
              errorText: errors.email,
            }}
            inputGroupProps={{
              bg: '#CBCCD14D',
            }}
          />
        </Box>
      ) : (
        <>
          <Box>
            <CustomInput
              w={'100%'}
              name='otp'
              placeholder='Enter OTP'
              onChange={handleChange}
              value={formValues.otp}
              type='text'
              onBlur={() => handleBlur('otp')}
              fieldProps={{
                label: 'OTP',
                errorText: errors.otp,
              }}
              inputGroupProps={{
                bg: '#CBCCD14D',
              }}
            />
          </Box>
          <Box mt={'24px'}>
            <CustomInput
              w={'100%'}
              name='password'
              placeholder='New Password'
              onChange={handleChange}
              value={formValues.password}
              type='password'
              onBlur={() => handleBlur('password')}
              fieldProps={{
                label: 'New Password',
                errorText: errors.password,
              }}
              inputGroupProps={{
                bg: '#CBCCD14D',
              }}
            />
          </Box>
          <Box mt={'24px'}>
            <CustomInput
              w={'100%'}
              name='confirmPassword'
              placeholder='Confirm New Password'
              onChange={handleChange}
              value={formValues.confirmPassword}
              type='password'
              onBlur={() => handleBlur('confirmPassword')}
              fieldProps={{
                label: 'Confirm New Password',
                errorText: errors.confirmPassword,
              }}
              inputGroupProps={{
                bg: '#CBCCD14D',
              }}
            />
          </Box>
        </>
      )}

      <Box mt={'36px'}>
        <Button
          loading={loading}
          type='submit'
          disabled={loading || Object.values(errors).some(error => error)}
          w={'100%'}
          size={'xl'}
          lineHeight={'30px'}
          bg={'#00DD25'}
          fontSize={'20px'}
          fontWeight={'500'}>
          {step === 'email' ? 'Send OTP' : 'Reset Password'}
        </Button>
      </Box>
    </form>
  );
};

export default ResetPassword;
