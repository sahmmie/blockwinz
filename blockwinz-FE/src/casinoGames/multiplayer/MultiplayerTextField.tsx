import { Box, Input, Text } from '@chakra-ui/react';
import { type ChangeEvent, type FunctionComponent } from 'react';

type MultiplayerTextFieldProps = {
  label: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  monospace?: boolean;
};

/**
 * Consistent text field styling for multiplayer forms (dark panel).
 */
const MultiplayerTextField: FunctionComponent<MultiplayerTextFieldProps> = ({
  label,
  hint,
  value,
  onChange,
  placeholder,
  monospace,
}) => {
  return (
    <Box mb={3}>
      <Text
        fontSize='xs'
        fontWeight='600'
        color='gray.400'
        textTransform='uppercase'
        letterSpacing='0.06em'
        mb={1.5}>
        {label}
      </Text>
      <Input
        value={value}
        placeholder={placeholder}
        autoComplete='off'
        size='md'
        h='42px'
        px={3}
        bg='blackAlpha.500'
        borderWidth='1px'
        borderColor='whiteAlpha.200'
        borderRadius='md'
        color='white'
        fontSize='sm'
        fontFamily={monospace ? 'ui-monospace, monospace' : undefined}
        outline='none'
        _placeholder={{ color: 'whiteAlpha.400' }}
        _focus={{
          borderColor: 'rgba(0, 221, 37, 0.65)',
          boxShadow: '0 0 0 1px rgba(0, 221, 37, 0.25)',
        }}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
      />
      {hint ? (
        <Text fontSize='xs' color='gray.500' mt={1.5} lineHeight='short'>
          {hint}
        </Text>
      ) : null}
    </Box>
  );
};

export default MultiplayerTextField;
