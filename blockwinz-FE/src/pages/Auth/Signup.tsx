/* eslint-disable no-useless-escape */
import CustomInput from '@/components/CustomInput/CustomInput';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Field } from '@/components/ui/field';
import { toaster } from '@/components/ui/toaster';
import { HttpError } from '@/shared/interfaces/http.interface';
import { Box, Text } from '@chakra-ui/react';
import React, { FunctionComponent, useState } from 'react';
import * as Yup from 'yup';
import useAuth from '../../hooks/useAuth';
import { useValidation } from '../../hooks/useValidation';
import axiosService from '../../lib/axios';
import useModal from '@/hooks/useModal';
import { AxiosError } from 'axios';

const Signup: FunctionComponent = () => {
  const passwordPattern =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&\-])[A-Za-z\d@$!%*?&\-]{8,}$/;
  const [formValues, setFormValues] = useState({
    username: '',
    password: '',
    email: '',
    userAccounts: ['user'],
    confirmPassword: '',
    termsAndConditions: false,
  });
  const [loading, setLoading] = useState(false);
  const { closeModal } = useModal();
  const { setToken } = useAuth();

  const validationSchema = Yup.object().shape({
    username: Yup.string()
      .required('Username is required')
      .min(4, 'Username must be at least 4 characters')
      .max(20, 'Username must be at most 20 characters')
      .matches(
        /^[a-zA-Z0-9_]+$/,
        'Username can only contain letters, numbers and underscores',
      ),
    email: Yup.string()
      .required(' email is required')
      .email('Invalid email address'),
    password: Yup.string()
      .required('Password is required')
      .matches(
        passwordPattern,
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      )
      .min(6, 'Password must be at least 6 characters'),
    confirmPassword: Yup.string()
      .required('Confirm Password is required')
      .oneOf([Yup.ref('password'), ''], 'Passwords must match'),
    termsAndConditions: Yup.boolean().isTrue(
      'You must agree to the terms and conditions',
    ),
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

  const handleCheckboxChange = (e: React.FormEvent<HTMLLabelElement>) => {
    const { name, checked } = e.target as HTMLInputElement;
    setFormValues(prev => ({ ...prev, [name]: checked }));
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
      const response = await axiosService.post('/authentication/registration', {
        username: formValues.username,
        password: formValues.password,
        email: formValues.email,
        userAccounts: formValues.userAccounts,
      });
      setToken(response.data.token);
      closeModal();
      setFormValues({
        username: '',
        password: '',
        email: '',
        userAccounts: ['user'],
        confirmPassword: '',
        termsAndConditions: false,
      });
    } catch (error: unknown) {
      toaster.create({
        title:
          (error as AxiosError<HttpError>).response?.data.errorMessage ||
          'Failed to login',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ width: '100%' }}>
      <Box>
        {' '}
        <CustomInput
          autoComplete='username'
          w={'100%'}
          name='username'
          placeholder='Username'
          onChange={handleChange}
          value={formValues.username}
          type='text'
          onBlur={() => handleBlur('username')}
          fieldProps={{
            label: 'Username',
            errorText: errors.username,
          }}
          inputGroupProps={{
            bg: '#CBCCD14D',
          }}
        />
      </Box>
      <Box mt={'24px'}>
        <CustomInput
          w={'100%'}
          autoComplete='email'
          name='email'
          placeholder='Email'
          onChange={handleChange}
          value={formValues.email}
          type='text'
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
      <Box pt={'24px'}>
        <CustomInput
          autoComplete='off'
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

      <Box pt={'24px'}>
        <CustomInput
          autoComplete='off'
          onBlur={() => handleBlur('password')}
          w={'100%'}
          name='confirmPassword'
          placeholder='Confirm Password'
          onChange={handleChange}
          value={formValues.confirmPassword}
          type='password'
          fieldProps={{
            label: 'Confirm Password',
            errorText: errors.confirmPassword,
          }}
          inputGroupProps={{
            bg: '#CBCCD14D',
          }}
        />
      </Box>

      <Box display={'flex'} mt={'24px'} w={'100%'} alignItems={'center'}>
        <Box cursor={'pointer'} w={'fit-content'} _hover={{ color: '#00DD25' }}>
          <Field errorText={errors.termsAndConditions} className='input-group'>
            <Checkbox
              name='termsAndConditions'
              checked={formValues.termsAndConditions}
              onChange={handleCheckboxChange}>
              <Text fontSize={'16px'} lineHeight={'28px'} fontWeight={'500'}>
                I agree to the terms & conditions and privacy policy
              </Text>
            </Checkbox>
          </Field>
        </Box>
      </Box>

      <Box mt={'46px'}>
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
          Sign Up
        </Button>
      </Box>
    </form>
  );
};

export default Signup;
