import React from 'react';
import winButtonImage from 'assets/icons/gold-coin-icon.svg';
import { Box, ButtonProps, Text } from '@chakra-ui/react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/useIsMobile';

interface GameButtonProps extends Omit<ButtonProps, 'children'> {
  number: number;
  isSelected?: boolean;
  buttonType?: 'default' | 'win' | 'loss';
  disabled?: boolean;
  isInteractive?: boolean;
}

export const GameButton: React.FC<GameButtonProps> = ({
  number,
  isSelected,
  buttonType = 'default',
  disabled = false,
  isInteractive = true,
  ...props
}) => {
  const isMobile = useIsMobile();
  const getButtonStyles = () => {
    if (disabled) {
      return {
        bg: '#545463',
        _hover: { bg: '#545463' },
        _active: { bg: '#545463' },
      };
    }

    switch (buttonType) {
      case 'win':
        return {
          bg: '#545463',
          _hover: { bg: isInteractive ? '#000A27' : '#545463' },
          _active: { bg: isInteractive ? '#000A27' : '#545463' },
          position: 'relative',
          overflow: 'hidden',
          padding: '0',
        };
      case 'loss':
        return {
          bg: '#000A27',
          _hover: { bg: '#000A27' },
          _active: { bg: '#000A27' },
          color: '#EB001B',
        };
      default:
        return {
          bg: isSelected ? '#00DD25' : '#545463',
          boxShadow: `0px ${isMobile ? '4px' : '6px'} 0px 0px ${
            isSelected ? '#00DD2559' : '#54546399'
          }`,
          _hover: isInteractive
            ? {
                border: '2px solid #00DD25',
                boxShadow: '0px 10px 0px 0px #00DD254D',
              }
            : {},
          _active: isInteractive
            ? {
                bg: isSelected ? '#00DD25' : '#545463',
                transform: 'scale(0.95)',
              }
            : {},
          transition: 'background 0.2s ease, transform 0.2s ease',
        };
    }
  };

  const getTextStyles = () => {
    if (disabled) {
      return {
        color: '#000A27',
      };
    }

    switch (buttonType) {
      case 'win':
        return {
          color: '#FFFFFF',
          position: 'relative',
          zIndex: 1,
        };
      case 'loss':
        return {
          color: '#EB001B',
        };
      default:
        return {
          color: isSelected ? '#FFFFFF' : '#FFFFFF',
          transition: 'color 0.2s',
        };
    }
  };

  return (
    <Button
      width='100%'
      height='100%'
      borderRadius='md'
      aspectRatio='1'
      {...getButtonStyles()}
      {...props}
      disabled={disabled}>
      {buttonType === 'win' && (
        <Box position='absolute' inset='0'>
          <img
            src={winButtonImage}
            width='100%'
            height='100%'
            style={{ objectFit: 'cover' }}
          />
        </Box>
      )}
      <Text
        data-keno-button-text
        fontSize='clamp(1rem, 2vw, 2rem)'
        fontWeight='700'
        lineHeight='1'
        {...getTextStyles()}>
        {number}
      </Text>
    </Button>
  );
};
