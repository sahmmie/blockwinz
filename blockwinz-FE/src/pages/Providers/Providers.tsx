import { Box, Text, VStack, SimpleGrid, Image, Heading } from '@chakra-ui/react';
import { FunctionComponent } from 'react';
import BlockwinzLogo from '@/assets/bw-dark-no-bg.png';

interface ProvidersProps {}

const Providers: FunctionComponent<ProvidersProps> = () => {
  const providers = [
    {
      id: 'blockwinz',
      name: 'Blockwinz',
      logo: BlockwinzLogo,
      description: 'The official game provider and platform creator. We develop and maintain all original games on the platform.',
      games: ['Dice', 'Limbo', 'Mines', 'Keno', 'Plinko', 'Wheel'],
      status: 'Official Provider',
      established: '2024',
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
          Game Providers
        </Heading>
        <Text fontSize='lg' textAlign='center' w='100%' color='gray.300'>
          Meet the companies and developers behind the games you love on Blockwinz.
        </Text>
      </VStack>

      {/* Providers Grid */}
      <VStack align='start' gap={6} mb={12}>
        <Heading as='h2' size='xl' color='#00DD25'>
          Our Providers
        </Heading>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6} w='100%'>
          {providers.map((provider) => (
            <Box
              key={provider.id}
              p={6}
              bg='#1A1D3A'
              borderRadius='lg'
              border='1px solid'
              borderColor='gray.700'
              _hover={{ borderColor: '#00DD25', transform: 'translateY(-2px)' }}
              transition='all 0.3s ease'
              display='flex'
              flexDirection='column'
              alignItems='center'
              textAlign='center'>
              
              {/* Provider Logo */}
              <Box mb={4}>
                <Image
                  src={provider.logo}
                  alt={`${provider.name} logo`}
                  width='80px'
                  height='80px'
                  objectFit='contain'
                />
              </Box>

              {/* Provider Info */}
              <VStack gap={3} w='100%'>
                <Heading as='h3' size='md' color='white'>
                  {provider.name}
                </Heading>
                
                <Box
                  bg='#00DD25'
                  color='#151832'
                  px={3}
                  py={1}
                  borderRadius='full'
                  fontSize='sm'
                  fontWeight='bold'>
                  {provider.status}
                </Box>

                <Text color='gray.300' fontSize='sm' lineHeight='1.5'>
                  {provider.description}
                </Text>

                <Box w='100%'>
                  <Text fontSize='sm' fontWeight='bold' color='#00DD25' mb={2}>
                    Games Provided:
                  </Text>
                  <Box display='flex' flexWrap='wrap' gap={1} justifyContent='center'>
                    {provider.games.map((game, index) => (
                      <Box
                        key={index}
                        bg='#2A2D4A'
                        px={2}
                        py={1}
                        borderRadius='md'
                        fontSize='xs'>
                        {game}
                      </Box>
                    ))}
                  </Box>
                </Box>

                <Text fontSize='xs' color='gray.400'>
                  Established: {provider.established}
                </Text>
              </VStack>
            </Box>
          ))}
        </SimpleGrid>
      </VStack>

      {/* Future Providers Section */}
      <VStack align='start' gap={6}>
        <Heading as='h2' size='xl' color='#00DD25'>
          Become a Provider
        </Heading>
        <Text>
          Are you a game developer or company interested in having your games featured on Blockwinz? 
          We're always looking for high-quality, provably fair games to add to our platform.
        </Text>
        <Box
          p={6}
          bg='#1A1D3A'
          borderRadius='lg'
          border='1px solid'
          borderColor='gray.700'
          w='100%'>
          <Text fontWeight='bold' mb={2}>
            Requirements for Game Providers:
          </Text>
          <VStack align='start' gap={2} fontSize='sm' color='gray.300'>
            <Text>• Provably fair game mechanics</Text>
            <Text>• High-quality, engaging gameplay</Text>
            <Text>• Mobile-responsive design</Text>
            <Text>• Secure and audited smart contracts</Text>
            <Text>• Compliance with platform standards</Text>
          </VStack>
          <Text mt={4} fontSize='sm' color='gray.400'>
            For partnership inquiries, contact us at: business@blockwinz.com
          </Text>
        </Box>
      </VStack>
    </Box>
  );
};

export default Providers; 