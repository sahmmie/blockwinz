import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Box, Stack, Text, Spinner, Center } from '@chakra-ui/react';
import axiosInstance from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { AxiosError } from 'axios';
import { HttpError } from '@/shared/interfaces/http.interface';

const SuccessIcon = () => (
  <svg
    width='48'
    height='48'
    viewBox='0 0 48 48'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'>
    <circle cx='24' cy='24' r='24' fill='#00DD25' fillOpacity='0.15' />
    <path
      d='M16 24L22 30L32 20'
      stroke='#00DD25'
      strokeWidth='3'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
);

const ErrorIcon = () => (
  <svg
    width='48'
    height='48'
    viewBox='0 0 48 48'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'>
    <circle cx='24' cy='24' r='24' fill='#FF4D4F' fillOpacity='0.15' />
    <path
      d='M30 18L18 30'
      stroke='#FF4D4F'
      strokeWidth='3'
      strokeLinecap='round'
    />
    <path
      d='M18 18L30 30'
      stroke='#FF4D4F'
      strokeWidth='3'
      strokeLinecap='round'
    />
  </svg>
);

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email...');
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('Invalid or missing verification token.');
      return;
    }
    axiosInstance
      .post('/authentication/verify-email', { token })
      .then(() => {
        setStatus('success');
        setMessage('Your email has been successfully verified!');
      })
      .catch((err: AxiosError<HttpError>) => {
        setStatus('error');
        setMessage(
          err?.response?.data?.errorMessage ||
            'Email Verification Failed. \n The link may be invalid or expired.',
        );
      });
  }, [searchParams]);

  return (
    <Center minH='60vh'>
      <Box
        bg='#151832'
        borderRadius='lg'
        p={8}
        boxShadow='0 4px 24px rgba(0,0,0,0.15)'
        minW={{ base: '90vw', sm: '400px' }}
        maxW='400px'
        textAlign='center'>
        <Stack gap={6} alignItems='center'>
          {status === 'loading' && <Spinner size='xl' color='#00DD25' />}
          {status === 'success' && <SuccessIcon />}
          {status === 'error' && <ErrorIcon />}
          <Text
            color='whiteAlpha.900'
            fontSize='lg'
            fontWeight='bold'
            whiteSpace='pre-line'>
            {message}
          </Text>
          {status === 'success' && (
            <Button
              bg='#00DD25'
              color='#151832'
              _hover={{ bg: '#00ff2a' }}
              w='full'
              onClick={() => navigate('/')}
            >
              Go to Home
            </Button>
          )}
        </Stack>
      </Box>
    </Center>
  );
};

export default VerifyEmail;
