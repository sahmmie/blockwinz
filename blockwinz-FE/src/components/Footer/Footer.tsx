import {
  Box,
  Flex,
  Text,
  Stack,
  IconButton,
  HStack,
  Image,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { SiTelegram, SiDiscord, SiX, SiInstagram } from 'react-icons/si';
import { IconType } from 'react-icons/lib';
import BlockwinzLogoWhite from '@/assets/bw-white-big-icon.svg';

const Footer = () => {
  const socials: { icon: IconType; link: string }[] = [
    {
      icon: SiTelegram,
      link: 'https://t.me/blockwinz',
    },
    {
      icon: SiDiscord,
      link: 'https://discord.gg/dGTbVbWV',
    },
    {
      icon: SiX,
      link: 'https://x.com/blockwinz_',
    },
    {
      icon: SiInstagram,
      link: 'https://instagram.com/blockwinz',
    },
  ];
  return (
    <Box bg='#151832' w='100%' px={6} pt={10} pb={5}>
      <Flex
        direction={{ base: 'column', md: 'row' }}
        align='flex-start'
        justify='space-between'
        maxW='1200px'
        mx='auto'
        gap={10}>
        {/* Logo and description */}
        <Box flex='1'>
          <Image src={BlockwinzLogoWhite} w={{ base: '100%', md: '260px' }} h={{ base: '42px', md: '45px' }} />
          <Text mt={2} fontSize='sm' color='gray.400'>
            Play with excitement. Win with ease.
          </Text>
        </Box>

        {/* Navigation Links */}
        <Stack gap={2}>
          <Text fontWeight='bold' color='white'>
            Company
          </Text>
          <RouterLink
            to='/about'
            style={{ color: 'inherit', textDecoration: 'none' }}>
            <Text _hover={{ color: '#00DD25' }}>About Us</Text>
          </RouterLink>

          <RouterLink
            to='/privacy'
            style={{ color: 'inherit', textDecoration: 'none' }}>
            <Text _hover={{ color: '#00DD25' }}>Privacy Policy</Text>
          </RouterLink>
          <RouterLink
            to='/providers'
            style={{ color: 'inherit', textDecoration: 'none' }}>
            <Text _hover={{ color: '#00DD25' }}>Providers</Text>
          </RouterLink>
          <RouterLink
            to='/affiliate'
            style={{ color: 'inherit', textDecoration: 'none' }}>
            <Text _hover={{ color: '#00DD25' }}>Affiliate</Text>
          </RouterLink>
        </Stack>

        <Stack gap={2}>
          <Text fontWeight='bold' color='white'>
            Support
          </Text>
          <a
            href='mailto:support@blockwinz.com?subject=Help Center Inquiry'
            style={{ color: 'inherit', textDecoration: 'none' }}>
            <Text _hover={{ color: '#00DD25' }}>Help Center</Text>
          </a>
          <a
            href='mailto:support@blockwinz.com?subject=Contact Us'
            style={{ color: 'inherit', textDecoration: 'none' }}>
            <Text _hover={{ color: '#00DD25' }}>Contact Us</Text>
          </a>
          <a
            href='mailto:support@blockwinz.com?subject=Security Inquiry'
            style={{ color: 'inherit', textDecoration: 'none' }}>
            <Text _hover={{ color: '#00DD25' }}>Security</Text>
          </a>
          <RouterLink
            to='/terms'
            style={{ color: 'inherit', textDecoration: 'none' }}>
            <Text _hover={{ color: '#00DD25' }}>Terms of Service</Text>
          </RouterLink>
        </Stack>

        {/* Social media */}
        <Box>
          <Text fontWeight='bold' color='white' mb={2}>
            Follow Us
          </Text>
          <HStack gap={0}>
            {socials.map((social, index) => (
              <IconButton
                onClick={() => window.open(social.link, '_blank')}
                boxSize={6}
                key={index}
                as={social.icon}
                variant='ghost'
                color='gray.300'
                _hover={{ color: '#00DD25', bg: 'transparent' }}></IconButton>
            ))}
          </HStack>
        </Box>
      </Flex>

      {/* Bottom line */}
      <Box mt={10} textAlign={{base:'left',md:'center'}} fontSize='sm' color='gray.500' mb={{ base: '60px', md: '0' }}>
        &copy; {new Date().getFullYear()} Blockwinz. All rights reserved.
      </Box>
    </Box>
  );
};

export default Footer;
