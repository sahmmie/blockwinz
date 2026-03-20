import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Stack,
  Image,
  Icon,
  Flex,
} from '@chakra-ui/react';
import { FaTwitter, FaDiscord, FaTelegram } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { toaster } from '../ui/toaster';
import bwzLogo from '@/assets/bw-white-with-title.svg';
import { Link } from 'react-router-dom';
import CustomInput from '../CustomInput/CustomInput';
import { Button } from '../ui/button';
import axiosService from '@/lib/axios';
import { WAITLIST_LAUNCH_DATE } from '@/shared/constants/app.constant';

const MotionBox = motion.create(Box);

const CountdownBox = ({ value, label }: { value: number; label: string }) => (
  <Box
    bg='rgba(255, 255, 255, 0.1)'
    p={4}
    borderRadius='lg'
    minW='80px'
    textAlign='center'>
    <Text color='#00DD25' fontSize='2xl' fontWeight='bold'>
      {value}
    </Text>
    <Text color='whiteAlpha.700' fontSize='sm' textTransform='uppercase'>
      {label}
    </Text>
  </Box>
);

const Waitlist: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const launchDate = useMemo(() => {
    const envLaunchDate = WAITLIST_LAUNCH_DATE;

    if (envLaunchDate) {
      const parsedDate = new Date(envLaunchDate);
      if (!Number.isNaN(parsedDate.getTime())) {
        return parsedDate;
      }
    }

    const fallbackDate = new Date();
    fallbackDate.setMonth(fallbackDate.getMonth() + 3);
    return fallbackDate;
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const difference = launchDate.getTime() - now.getTime();

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [launchDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await axiosService.post('/authentication/waitlist', {
        email,
      });

      toaster.create({
        title: 'Success!',
        description: 'You have been added to the waitlist.',
        type: 'success',
      });
      setEmail('');
    } catch {
      toaster.create({
        title:          'Failed to join waitlist. Please try again.',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container
      minH='100vh'
      bg='#151832'
      display='flex'
      flexDirection='column'
      alignItems='center'
      justifyContent='center'
      position='relative'
      overflow='hidden'>
      {/* Background effects */}
      {[...Array(20)].map((_, i) => (
        <MotionBox
          key={i}
          position='absolute'
          w='4px'
          h='4px'
          bg='#00DD25'
          borderRadius='full'
          animate={{
            scale: [0, 1, 0],
            rotate: [0, 360],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
        />
      ))}

      <Stack gap={6} w='full' maxW='container.md' px={4} alignItems={'center'}>
        <Image src={bwzLogo} alt='Blockwinz' w='300px' />

        <Heading
          mb={12}
          fontSize='xl'
          textAlign='center'
          color='#00DD25'
          fontWeight='bold'>
          Play with excitement, win with ease.
        </Heading>

        <Text fontSize='xl' color='whiteAlpha.800' textAlign='center'>
          Join the waitlist and be the first to win.
        </Text>

        <Stack direction='row' gap={4} justify='center' w='full'>
          <CountdownBox value={timeLeft.days} label='Days' />
          <CountdownBox value={timeLeft.hours} label='Hours' />
          <CountdownBox value={timeLeft.minutes} label='Minutes' />
          <CountdownBox value={timeLeft.seconds} label='Seconds' />
        </Stack>

        <Box as='form' onSubmit={handleSubmit} w='full' maxW='400px'>
          <Stack gap={4}>
            <CustomInput
              type='email'
              placeholder='Enter your email'
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              bg='whiteAlpha.100'
              border={'1px solid #00DD25'}
              borderRadius='8px'
              color='white'
              _hover={{ borderColor: '#00DD25' }}
              _focus={{
                borderColor: '#00DD25',
                boxShadow: '0 0 0 1px #00DD25',
              }}
            />
            <Button
              type='submit'
              w='full'
              bg='#00DD25'
              color='#151832'
              _hover={{ bg: '#00ff2a' }}
              size='lg'
              loading={isSubmitting}
              disabled={isSubmitting}>
              Join Now
            </Button>
          </Stack>
        </Box>

        <Text color='whiteAlpha.800' fontSize='lg'>
          Already 100+ players signed up
        </Text>

        <Stack gap={3} alignItems='center'>
          <Text color='whiteAlpha.800' fontSize='md' fontWeight={500}>
            Want to see a demo?
          </Text>
          <Link to='https://staging.blockwinz.com' target='_blank'>
            <Button
              px={10}
              py={6}
              variant='outline'
              borderColor='#00DD25'
              color='#00DD25'
              _hover={{ bg: 'rgba(0, 221, 37, 0.1)' }}
              size='md'>
              Visit Staging Site
            </Button>
          </Link>
        </Stack>

        <Flex gap={6} mt={4}>
          <Link to={'https://twitter.com/Blockwinz_'} target={'_blank'}>
            <Icon
              size='lg'
              w={6}
              h={6}
              color='whiteAlpha.800'
              _hover={{ color: '#00DD25' }}
              cursor='pointer'>
              <FaTwitter />
            </Icon>
          </Link>
          <Link to={'https://discord.gg/dGTbVbWV'} target={'_blank'}>
            <Icon
              size='lg'
              w={6}
              h={6}
              color='whiteAlpha.800'
              _hover={{ color: '#00DD25' }}
              cursor='pointer'>
              <FaDiscord />
            </Icon>
          </Link>
          <Link to={'https://t.me/blockwinz'} target={'_blank'}>
            <Icon
              size='lg'
              w={6}
              h={6}
              color='whiteAlpha.800'
              _hover={{ color: '#00DD25' }}
              cursor='pointer'>
              <FaTelegram />
            </Icon>
          </Link>
        </Flex>
      </Stack>
    </Container>
  );
};

export default Waitlist;
