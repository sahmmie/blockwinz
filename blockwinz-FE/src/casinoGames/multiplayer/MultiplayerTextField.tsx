import { Box, Input, Text } from '@chakra-ui/react';
import { type ChangeEvent, type FunctionComponent, useCallback } from 'react';
import { InputGroup } from '@/components/ui/input-group';
import { Button } from '@/components/ui/button';
import { toaster } from '@/components/ui/toaster';
import CopyIcon from '@/assets/icons/copy-icon.svg';

type MultiplayerTextFieldProps = {
  label: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  monospace?: boolean;
  /** Renders a paste-from-clipboard control inside the field (right). */
  showPasteButton?: boolean;
};

const inputStyles = {
  size: 'md' as const,
  h: '42px',
  px: 3,
  bg: 'blackAlpha.500',
  borderWidth: '1px',
  borderColor: 'whiteAlpha.200',
  borderRadius: 'md',
  color: 'white',
  fontSize: 'sm',
  outline: 'none',
  _placeholder: { color: 'whiteAlpha.400' },
  _focus: {
    borderColor: 'rgba(0, 221, 37, 0.65)',
    boxShadow: '0 0 0 1px rgba(0, 221, 37, 0.25)',
  },
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
  showPasteButton,
}) => {
  const paste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) onChange(text.trim());
    } catch {
      toaster.create({
        title: 'Paste failed',
        description: 'Allow clipboard access or paste manually (Ctrl+V / ⌘V).',
        type: 'error',
      });
    }
  }, [onChange]);

  const pasteControl = showPasteButton ? (
    <Button
      type='button'
      variant='ghost'
      size='sm'
      h='32px'
      minW='32px'
      px={1}
      py={0}
      borderRadius='md'
      color='gray.400'
      _hover={{ color: 'white', bg: 'whiteAlpha.100' }}
      aria-label={`Paste ${label}`}
      title='Paste from clipboard'
      onClick={() => void paste()}>
      <img src={CopyIcon} alt='' width={18} height={18} aria-hidden />
    </Button>
  ) : null;

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
      {showPasteButton ? (
        <InputGroup
          w='100%'
          endOffset='4px'
          endElement={pasteControl}
          endElementProps={{ pointerEvents: 'auto' }}>
          <Input
            value={value}
            placeholder={placeholder}
            autoComplete='off'
            fontFamily={monospace ? 'ui-monospace, monospace' : undefined}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              onChange(e.target.value)
            }
            {...inputStyles}
          />
        </InputGroup>
      ) : (
        <Input
          value={value}
          placeholder={placeholder}
          autoComplete='off'
          fontFamily={monospace ? 'ui-monospace, monospace' : undefined}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            onChange(e.target.value)
          }
          {...inputStyles}
        />
      )}
      {hint ? (
        <Text fontSize='xs' color='gray.500' mt={1.5} lineHeight='short'>
          {hint}
        </Text>
      ) : null}
    </Box>
  );
};

export default MultiplayerTextField;
