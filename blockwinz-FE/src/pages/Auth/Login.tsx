import React, { useState } from 'react';
import { FunctionComponent } from 'react';
import * as Yup from 'yup';
import { useValidation } from '../../hooks/useValidation';
import axiosService from '../../lib/axios';
import useAuth from '../../hooks/useAuth';
import CustomInput from '@/components/CustomInput/CustomInput';
import { Box, Text } from '@chakra-ui/react';
import { Button } from '@/components/ui/button';
import { toaster } from '@/components/ui/toaster';
import { HttpError } from '@/shared/interfaces/http.interface';
import useModal from '@/hooks/useModal';
import { pagesT } from './Authentication';
import { AxiosError } from 'axios';

type LoginProps = {
  setActiveTab: (tab: pagesT) => void;
};

const Login: FunctionComponent<LoginProps> = ({ setActiveTab }) => {
  const [formValues, setFormValues] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { closeModal } = useModal();
  const { setToken } = useAuth();

  const validationSchema = Yup.object().shape({
    username: Yup.string().required('Username or email is required'),
    password: Yup.string().required('Password is required'),
  });

  const { errors, validateForm, handleBlur } = useValidation({
    values: formValues,
    validationSchema,
    validateOnChange: true,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const validationErrors = await validateForm();

    if (Object.keys(validationErrors).length) {
      return;
    }

    if (Object.values(errors).some(error => error)) {
      return;
    }

    setLoading(true);
    try {
      // Replace with your API call
      const response = await axiosService.post('/authentication/login', {
        username: formValues.username,
        password: formValues.password,
      });
      setToken(response.data.token);
      closeModal();
      setFormValues({ username: '', password: '' });
    } catch (error: unknown) {
      toaster.create({
        title:
          (error as AxiosError<HttpError>).response?.data.errorMessage || 'Failed to login',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ width: '100%' }}>
      <CustomInput
        w={'100%'}
        name='username'
        placeholder='Username / Email'
        onChange={handleChange}
        value={formValues.username}
        type='text'
        onBlur={() => handleBlur('username')}
        fieldProps={{
          label: 'Email / Username',
          errorText: errors.username,
        }}
        inputGroupProps={{
          bg: '#CBCCD14D',
        }}
      />
      <Box pt={'24px'}>
        <CustomInput
          onBlur={() => handleBlur('password')}
          w={'100%'}
          name='password'
          placeholder='Password'
          onChange={handleChange}
          value={formValues.password}
          type='password'
          fieldProps={{
            label: 'Password',
            errorText: errors.password,
          }}
          inputGroupProps={{
            bg: '#CBCCD14D',
          }}
        />
      </Box>

      <Box
        display={'flex'}
        mt={'16px'}
        w={'100%'}
        justifyContent={'flex-end'}
        alignItems={'center'}>
        <Button
          unstyled
          cursor={'pointer'}
          w={'fit-content'}
          _hover={{ color: '#00DD25' }}
          onClick={() => setActiveTab('resetPassword')}>
          <Text
            fontSize={'16px'}
            lineHeight={'24px'}
            fontWeight={'500'}
            textDecor={'underline'}>
            Forgot Password?
          </Text>
        </Button>
      </Box>

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
          Login
        </Button>
      </Box>
    </form>
  );
};

export default Login;
