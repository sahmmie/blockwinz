import { FunctionComponent } from 'react';
import { HStack } from '@chakra-ui/react';
import {
  RadioCardItem,
  RadioCardLabel,
  RadioCardRoot,
} from '@/components/ui/radio-card';
import { RiskLevel } from '../../casinoGames/tictactoes/types';

interface RiskLevelProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  risks: { value: string; title: string }[];
  defaultValue?: string;
}

const RiskLevelCard: FunctionComponent<RiskLevelProps> = ({
  value,
  onChange,
  disabled,
  risks,
  defaultValue,
}) => {
  return (
    <RadioCardRoot
      colorPalette={'gray'}
      orientation='horizontal'
      align='center'
      justify='center'
      w={'100%'}
      value={value.toString()}
      disabled={disabled}
      onChange={e =>
        onChange((e.target as unknown as { value: RiskLevel }).value)
      }
      defaultValue={defaultValue}>
      <RadioCardLabel
        fontSize={'16px'}
        fontWeight={'500'}
        lineHeight={'26px'}
        mb={'4px'}>
        Risk level
      </RadioCardLabel>
      <HStack align='stretch'>
        {risks.map(item => (
          <RadioCardItem
            borderRadius={'8px'}
            border={'none'}
            bg={'#4A445A99'}
            label={item.title}
            indicator={true}
            key={item.value}
            value={item.value}
          />
        ))}
      </HStack>
    </RadioCardRoot>
  );
};

export default RiskLevelCard;
