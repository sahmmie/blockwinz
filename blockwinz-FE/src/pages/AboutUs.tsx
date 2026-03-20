import {
  Box,
  Heading,
  Text,
  VStack,
  SimpleGrid,
  Flex,
  IconButton,
} from '@chakra-ui/react';
import {
  FaGamepad,
  FaShieldAlt,
  FaUsers,
  FaTrophy,
  FaRocket,
  FaHeart,
} from 'react-icons/fa';

const AboutUs = () => {
  const features = [
    {
      icon: FaGamepad,
      title: 'Provably Fair Gaming',
      description:
        'Blockwinz uses verifiable algorithms on-chain to ensure all outcomes are tamper-proof and transparent.',
    },
    {
      icon: FaShieldAlt,
      title: 'Secure & Reliable',
      description:
        'From smart contract audits to wallet-level protections, we keep your experience safe at every layer.',
    },
    {
      icon: FaUsers,
      title: 'Community Driven',
      description:
        'Led by gamers and backed by real users, our direction is guided by the people who matter most — you.',
    },
    {
      icon: FaTrophy,
      title: 'Competitive Rewards',
      description:
        'Join thrilling multiplayer battles, climb global leaderboards, and earn exclusive rewards in BWZ tokens.',
    },
    {
      icon: FaRocket,
      title: 'Innovation First',
      description:
        'We push boundaries with multiplayer-first design, real-time gameplay, and deep token integration.',
    },
    {
      icon: FaHeart,
      title: 'User Experience',
      description:
        'Enjoy a mobile-optimized interface, seamless wallet connections, and frictionless gameplay.',
    },
  ];

  return (
    <Box
      mx='auto'
      p={{ base: 4, md: 8 }}
      bg='#151832'
      borderRadius='8px'
      color='white'
      fontSize='md'
      boxShadow='0 4px 24px rgba(0,0,0,0.10)'>
      {/* Hero Section */}
      <VStack align='start' gap={8} mb={12}>
        <Heading as='h1' size='2xl' color='#00DD25' textAlign='center' w='100%'>
          About Blockwinz
        </Heading>
        <Text fontSize='lg' textAlign='center' w='100%' color='gray.300'>
          A next-gen crypto gaming platform — built for transparency,
          competition, and global connection.
        </Text>
      </VStack>

      {/* Company Overview */}
      <VStack align='start' gap={6} mb={12}>
        <Heading as='h2' size='xl' color='#00DD25'>
          Our Story
        </Heading>
        <Text>
          Blockwinz was born out of a desire to reshape online gaming through
          fairness and technology. Our founder, Ibrahim, a seasoned developer
          and blockchain enthusiast, saw an opportunity to blend provably fair
          gaming with real-time multiplayer experiences.
        </Text>
        <Text>
          Since day one, our mission has been to give players a platform they
          can trust — where every roll, bet, and tournament win is verifiable,
          secure, and exciting. Blockwinz empowers gamers with real ownership,
          transparency, and community.
        </Text>
      </VStack>

      {/* Mission & Vision */}
      <VStack align='start' gap={6} mb={12}>
        <Heading as='h2' size='xl' color='#00DD25'>
          Mission & Vision
        </Heading>
        <SimpleGrid columns={{ base: 1, md: 2 }} gap={8} w='100%'>
          <Box>
            <Heading as='h3' size='md' color='#00DD25' mb={3}>
              Our Mission
            </Heading>
            <Text>
              To create the most engaging and transparent crypto gaming
              experience, powered by blockchain technology, real-time
              multiplayer action, and a player-first economy.
            </Text>
          </Box>
          <Box>
            <Heading as='h3' size='md' color='#00DD25' mb={3}>
              Our Vision
            </Heading>
            <Text>
              To become the go-to destination for blockchain gamers — a hub of
              provably fair games, loyal communities, and sustainable rewards in
              the Web3 ecosystem.
            </Text>
          </Box>
        </SimpleGrid>
      </VStack>

      {/* Features Grid */}
      <VStack align='start' gap={6} mb={12}>
        <Heading as='h2' size='xl' color='#00DD25'>
          Why Choose Blockwinz?
        </Heading>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6} w='100%'>
          {features.map((feature, index) => (
            <Box
              key={index}
              p={6}
              bg='#1A1D3A'
              borderRadius='lg'
              border='1px solid'
              borderColor='gray.700'
              _hover={{ borderColor: '#00DD25', transform: 'translateY(-2px)' }}
              transition='all 0.3s ease'>
              <Flex align='center' mb={3}>
                <IconButton
                  as={feature.icon}
                  color='#00DD25'
                  boxSize={6}
                  mr={1}
                  variant={'ghost'}
                />
                <Heading as='h3' size='md' color='white'>
                  {feature.title}
                </Heading>
              </Flex>
              <Text color='gray.300' fontSize='sm'>
                {feature.description}
              </Text>
            </Box>
          ))}
        </SimpleGrid>
      </VStack>

      {/* Technology */}
      <VStack align='start' gap={6} mb={12}>
        <Heading as='h2' size='xl' color='#00DD25'>
          Technology & Innovation
        </Heading>
        <Text>
          From Solana blockchain integration to custom-built smart contracts,
          our tech stack is designed for performance, fairness, and scalability.
          Our provably fair system lets players verify the outcome of every game
          using cryptographic proofs.
        </Text>
        <Text>
          We also leverage real-time gameplay engines, secure wallet
          integrations, and Token-2022 standards to give players the best of
          modern crypto gaming.
        </Text>
      </VStack>

      {/* Community */}
      <VStack align='start' gap={6} mb={12}>
        <Heading as='h2' size='xl' color='#00DD25'>
          Our Community
        </Heading>
        <Text>
          We’re more than just a gaming platform — we’re a movement. Blockwinz
          is shaped by a growing global community of players, creators, and
          innovators. Whether you're here to win big, stream your skills, or
          contribute to development, you're part of the family.
        </Text>
        <Text>
          Join live tournaments, climb the leaderboards, and help us shape the
          future of decentralized gaming.
        </Text>
      </VStack>

      {/* Contact Section */}
      <VStack align='start' gap={6}>
        <Heading as='h2' size='xl' color='#00DD25'>
          Get in Touch
        </Heading>
        <Text>
          Got feedback, ideas, or collaboration proposals? We’re building
          Blockwinz with and for our community — and we’d love to hear from you.
        </Text>
        <Box
          p={6}
          bg='#1A1D3A'
          borderRadius='lg'
          border='1px solid'
          borderColor='gray.700'
          w='100%'>
          <Text fontWeight='bold' mb={2}>
            Contact Information:
          </Text>
          <Text color='gray.300'>Email: support@blockwinz.com</Text>
          <Text color='gray.300'>
            For business inquiries: business@blockwinz.com
          </Text>
        </Box>
      </VStack>
    </Box>
  );
};

export default AboutUs;
