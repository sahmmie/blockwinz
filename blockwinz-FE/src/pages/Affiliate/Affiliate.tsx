import { Box, Text, VStack, SimpleGrid, Heading, Button } from '@chakra-ui/react';
import { FunctionComponent } from 'react';
import { FaUsers, FaChartLine, FaGift, FaHandshake } from 'react-icons/fa';

interface AffiliateProps {}

const Affiliate: FunctionComponent<AffiliateProps> = () => {
  const affiliates: Array<{ id: string; name: string; logo: string; description: string; status: string }> = []; // Currently no affiliates

  const benefits = [
    {
      icon: FaUsers,
      title: 'Large Player Base',
      description: 'Access to our growing community of crypto gaming enthusiasts.',
    },
    {
      icon: FaChartLine,
      title: 'High Conversion Rates',
      description: 'Proven track record of converting visitors into active players.',
    },
    {
      icon: FaGift,
      title: 'Competitive Commissions',
      description: 'Earn up to 40% commission on player deposits and losses.',
    },
    {
      icon: FaHandshake,
      title: 'Long-term Partnership',
      description: 'Build lasting relationships with recurring revenue opportunities.',
    },
  ];

  const commissionTiers = [
    {
      tier: 'Bronze',
      requirement: '0-10 players',
      commission: '25%',
      color: '#CD7F32',
    },
    {
      tier: 'Silver',
      requirement: '11-50 players',
      commission: '30%',
      color: '#C0C0C0',
    },
    {
      tier: 'Gold',
      requirement: '51-100 players',
      commission: '35%',
      color: '#FFD700',
    },
    {
      tier: 'Platinum',
      requirement: '100+ players',
      commission: '40%',
      color: '#E5E4E2',
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
      
      {/* Header Section */}
      <VStack align='start' gap={8} mb={12}>
        <Heading as='h1' size='2xl' color='#00DD25' textAlign='center' w='100%'>
          Affiliate Program
        </Heading>
        <Text fontSize='lg' textAlign='center' w='100%' color='gray.300'>
          Join our affiliate program and earn commissions by promoting Blockwinz to your audience.
        </Text>
      </VStack>

      {/* Current Affiliates Section */}
      <VStack align='start' gap={6} mb={12}>
        <Heading as='h2' size='xl' color='#00DD25'>
          Our Affiliate Partners
        </Heading>
        {affiliates.length > 0 ? (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6} w='100%'>
            {affiliates.map((affiliate) => (
              <Box
                key={affiliate.id}
                p={6}
                bg='#1A1D3A'
                borderRadius='lg'
                border='1px solid'
                borderColor='gray.700'
                _hover={{ borderColor: '#00DD25', transform: 'translateY(-2px)' }}
                transition='all 0.3s ease'>
                {/* Affiliate content would go here */}
              </Box>
            ))}
          </SimpleGrid>
        ) : (
          <Box
            p={8}
            bg='#1A1D3A'
            borderRadius='lg'
            border='1px solid'
            borderColor='gray.700'
            w='100%'
            textAlign='center'>
            <Text fontSize='lg' color='gray.400' mb={4}>
              We're currently building our affiliate network.
            </Text>
            <Text color='gray.300'>
              Be among the first to join our affiliate program and start earning commissions!
            </Text>
          </Box>
        )}
      </VStack>

      {/* Commission Tiers */}
      <VStack align='start' gap={6} mb={12}>
        <Heading as='h2' size='xl' color='#00DD25'>
          Commission Tiers
        </Heading>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={4} w='100%'>
          {commissionTiers.map((tier, index) => (
            <Box
              key={index}
              p={6}
              bg='#1A1D3A'
              borderRadius='lg'
              border='1px solid'
              borderColor='gray.700'
              textAlign='center'
              _hover={{ borderColor: tier.color, transform: 'translateY(-2px)' }}
              transition='all 0.3s ease'>
              <Text fontSize='2xl' fontWeight='bold' color={tier.color} mb={2}>
                {tier.tier}
              </Text>
              <Text fontSize='lg' fontWeight='bold' color='white' mb={1}>
                {tier.commission}
              </Text>
              <Text fontSize='sm' color='gray.300'>
                {tier.requirement}
              </Text>
            </Box>
          ))}
        </SimpleGrid>
      </VStack>

      {/* Benefits Section */}
      <VStack align='start' gap={6} mb={12}>
        <Heading as='h2' size='xl' color='#00DD25'>
          Why Partner With Us?
        </Heading>
        <SimpleGrid columns={{ base: 1, md: 2 }} gap={6} w='100%'>
          {benefits.map((benefit, index) => (
            <Box
              key={index}
              p={6}
              bg='#1A1D3A'
              borderRadius='lg'
              border='1px solid'
              borderColor='gray.700'
              _hover={{ borderColor: '#00DD25', transform: 'translateY(-2px)' }}
              transition='all 0.3s ease'>
              <Box display='flex' alignItems='center' mb={3}>
                <Box
                  as={benefit.icon}
                  color='#00DD25'
                  boxSize={6}
                  mr={3}
                />
                <Heading as='h3' size='md' color='white'>
                  {benefit.title}
                </Heading>
              </Box>
              <Text color='gray.300' fontSize='sm'>
                {benefit.description}
              </Text>
            </Box>
          ))}
        </SimpleGrid>
      </VStack>

      {/* How It Works */}
      <VStack align='start' gap={6} mb={12}>
        <Heading as='h2' size='xl' color='#00DD25'>
          How It Works
        </Heading>
        <SimpleGrid columns={{ base: 1, md: 3 }} gap={6} w='100%'>
          <Box
            p={6}
            bg='#1A1D3A'
            borderRadius='lg'
            border='1px solid'
            borderColor='gray.700'
            textAlign='center'>
            <Text fontSize='3xl' fontWeight='bold' color='#00DD25' mb={2}>
              1
            </Text>
            <Heading as='h3' size='md' color='white' mb={2}>
              Sign Up
            </Heading>
            <Text color='gray.300' fontSize='sm'>
              Register for our affiliate program and get your unique referral link.
            </Text>
          </Box>
          <Box
            p={6}
            bg='#1A1D3A'
            borderRadius='lg'
            border='1px solid'
            borderColor='gray.700'
            textAlign='center'>
            <Text fontSize='3xl' fontWeight='bold' color='#00DD25' mb={2}>
              2
            </Text>
            <Heading as='h3' size='md' color='white' mb={2}>
              Promote
            </Heading>
            <Text color='gray.300' fontSize='sm'>
              Share your link with your audience and drive traffic to Blockwinz.
            </Text>
          </Box>
          <Box
            p={6}
            bg='#1A1D3A'
            borderRadius='lg'
            border='1px solid'
            borderColor='gray.700'
            textAlign='center'>
            <Text fontSize='3xl' fontWeight='bold' color='#00DD25' mb={2}>
              3
            </Text>
            <Heading as='h3' size='md' color='white' mb={2}>
              Earn
            </Heading>
            <Text color='gray.300' fontSize='sm'>
              Earn commissions on every deposit and loss from your referred players.
            </Text>
          </Box>
        </SimpleGrid>
      </VStack>

      {/* CTA Section */}
      <VStack align='start' gap={6}>
        <Heading as='h2' size='xl' color='#00DD25'>
          Ready to Start Earning?
        </Heading>
        <Text>
          Join our affiliate program today and start earning commissions from our growing player base. 
          We provide all the tools and support you need to succeed.
        </Text>
        <Box
          p={6}
          bg='#1A1D3A'
          borderRadius='lg'
          border='1px solid'
          borderColor='gray.700'
          w='100%'>
          <Text fontWeight='bold' mb={4}>
            What We Provide:
          </Text>
          <VStack align='start' gap={2} fontSize='sm' color='gray.300' mb={4}>
            <Text>• Unique tracking links and banners</Text>
            <Text>• Real-time analytics dashboard</Text>
            <Text>• Marketing materials and support</Text>
            <Text>• Weekly commission payouts</Text>
            <Text>• Dedicated affiliate manager</Text>
          </VStack>
          <Text fontSize='sm' color='gray.400'>
            For affiliate program inquiries, contact us at: affiliate@blockwinz.com
          </Text>
        </Box>
        <Box w='100%' textAlign='center'>
          <Button
            bg='#00DD25'
            color='#151832'
            size='lg'
            px={8}
            py={4}
            fontSize='lg'
            fontWeight='bold'
            _hover={{ bg: '#00ff2a' }}
            onClick={() => window.open('mailto:affiliate@blockwinz.com?subject=Affiliate Program Inquiry', '_blank')}>
            Apply Now
          </Button>
        </Box>
      </VStack>
    </Box>
  );
};

export default Affiliate; 