import { FunctionComponent, useEffect, useState } from 'react';
import { Box, Button, Text, Image } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { buttons, cards } from '../home-data';
import { useIsMobile } from '@/hooks/useIsMobile';

interface AuthBannerProps {
  activeButton: string;
  setActiveButton: React.Dispatch<React.SetStateAction<string>>;
}

const AuthBanner: FunctionComponent<AuthBannerProps> = ({
  activeButton,
  setActiveButton,
}) => {
  const navigate = useNavigate();
  const [activeCardIndex, setActiveCardIndex] = useState(() =>
    Math.floor(Math.random() * cards.length),
  );
  const [hasMounted, setHasMounted] = useState(false);

  // Chakra UI hook to check screen size
  const isMobile = useIsMobile(true);

  // Ensure this only renders after component mounts
  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Switch card every 2.5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCardIndex(prev => (prev + 1) % cards.length);
    }, 150000); // 2.5 mins = 150,000ms

    return () => clearInterval(interval);
  }, []);

  const handleCardAction = (actionType: string) => {
    switch (actionType) {
      case 'navigate-new-releases':
        navigate('/new-releases');
        break;
      case 'claim-bonus':
        console.log('Claim bonus clicked');
        break;
      default:
        console.log('No action');
    }
  };

  const renderCard = (card: (typeof cards)[0]) => (
    <Box position='relative' w='100%'>
      <Image
        src={card.image}
        width='100%'
        height='100%'
        borderRadius='8px'
        objectFit='cover'
      />
      <Box
        p={{ base: '16px', md: '24px' }}
        top={0}
        position='absolute'
        w='100%'
        h='100%'
        display='flex'
        flexDir='column'
        justifyContent='center'
        gap={{ base: '8px', md: '18px' }}>
        <Text
          fontSize={{ base: '18px', md: '34px' }}
          fontWeight='700'
          whiteSpace='pre-line'>
          {card.title}
        </Text>
        <Text fontSize='16px' fontWeight='500' whiteSpace='pre-line'>
          {card.description}
        </Text>
        <Button
          onClick={() => handleCardAction(card.actionType)}
          bg='#FFFFFF'
          width='fit-content'
          px='32px'
          py={{ base: '16px', md: '22px' }}
          mt='8px'>
          {card.buttonText}
        </Button>
      </Box>
    </Box>
  );

  // Prevent flicker on mobile by avoiding early render
  if (!hasMounted) return null;

  return (
    <>
      <Box
        display={{ base: 'block', md: 'flex' }}
        w='100%'
        h='100%'
        gap='18px'
        pt={{ base: '0', md: '24px' }}
        pb={{ base: '0', md: '0' }}
        px={{ base: '0', md: '16px' }}>
        {isMobile
          ? renderCard(cards[activeCardIndex])
          : cards.map((card, i) => (
              <Box key={i} w='100%'>
                {renderCard(card)}
              </Box>
            ))}
      </Box>

      <Box
        gap='12px'
        borderRadius='8px'
        bg='#000A27'
        mt='24px'
        mb='24px'
        mx='16px'
        display={{ base: 'none', md: 'flex' }}
        p='12px'>
        {buttons.map((button, i) => (
          <Button
            alignItems={'center'}
            key={'ab' + i}
            fontSize='18px'
            onClick={() => setActiveButton(button.value)}
            cursor='pointer'
            _hover={{ bg: '#CCCCCD1A' }}
            gap='8px'
            display='flex'
            unstyled
            borderRadius='4px'
            py='14px'
            px='24px'
            bg={activeButton === button.value ? '#CCCCCD1A' : 'none'}>
            <Image src={button.icon} width='24px' height='24px' />
            {button.label}
          </Button>
        ))}
      </Box>
    </>
  );
};

export default AuthBanner;
