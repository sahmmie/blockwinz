import { FunctionComponent } from 'react';
import { Button } from '../ui/button';
import { ConditionalValue } from '@chakra-ui/react';

interface BetButtonProps {
  loading: boolean;
  disabled: boolean;
  onClick: () => void;
  w?: string;
  size?: ConditionalValue<
    'xl' | 'sm' | 'md' | 'lg' | '2xl' | '2xs' | 'xs' | undefined
  >;
  bg?: string;
  fontSize?: string;
  fontWeight?: string;
}

const BetButton: FunctionComponent<BetButtonProps> = ({
  loading,
  disabled,
  onClick,
  w = '100%',
  size = 'xl',
  bg = '#00DD25',
  fontSize = '20px',
  fontWeight = '500',
}) => {
  return (
    <>
      <Button
        disabled={disabled || loading}
        loading={loading}
        onClick={onClick}
        w={w}
        size={size}
        bg={bg}
        fontSize={fontSize}
        fontWeight={fontWeight}>
        Bet
      </Button>
    </>
  );
};

export default BetButton;
