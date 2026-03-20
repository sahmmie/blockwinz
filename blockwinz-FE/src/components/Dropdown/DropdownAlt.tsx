import { ListCollection, Select, createListCollection } from '@chakra-ui/react';
import { FunctionComponent, useEffect, useState } from 'react';
import chevronDownIcon from 'assets/icons/chevron-down-icon.svg';

interface DropdownAltProps {
  label?: string;
  placeholder: string;
  options: OptionsProps[];
  handleChange: (value: string) => void;
  selected: string | null;
}

interface OptionsProps {
  label: string;
  value: string;
}

const DropdownAlt: FunctionComponent<DropdownAltProps> = ({
  label,
  placeholder,
  options,
  handleChange,
  selected,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [optionsList, setOptionsList] = useState<
    ListCollection<OptionsProps>
  >(
    createListCollection<OptionsProps>({
      items: [],
    }),
  );

  const convertToCollection = (
    options: OptionsProps[],
  ): ListCollection<OptionsProps> => {
    return createListCollection<OptionsProps>({
      items: options.map((option: OptionsProps) => ({
        label: option.label,
        value: option.value,
      })),
    });
  };

  useEffect(() => {
    setOptionsList(
      convertToCollection(options.map((option: OptionsProps) => option)),
    );
  }, [options]);

  return (
    <Select.Root
      position={'relative'}
      w={'100%'}
      value={[selected || '']}
      onValueChange={e => handleChange(e.value[0])}
      unstyled
      onOpenChange={(details: { open: boolean }) => setIsOpen(details.open)}
      collection={optionsList}>
      <Select.HiddenSelect />
      {label && <Select.Label>{label}</Select.Label>}
      <Select.Control>
        <Select.Trigger
          mb={'8px'}
          mt={label ? '8px' : '0'}
          display={'flex'}
          alignItems={'center'}
          bg={'#151832'}
          py={'16px'}
          px={'16px'}
          borderRadius={'8px'}
          gap={'8px'}
          w={'100%'}
          justifyContent={'space-between'}>
          <Select.ValueText
            placeholder={placeholder}
            fontSize={'16px'}
            fontWeight={'500'}
            lineHeight={'28px'}></Select.ValueText>
          <Select.IndicatorGroup>
            <img
              src={chevronDownIcon}
              alt='Chevron down icon'
              style={{
                width: '24px',
                height: '24px',
                transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              }}
            />
          </Select.IndicatorGroup>
        </Select.Trigger>
      </Select.Control>
      <Select.Content
        maxHeight={'300px'}
        overflowY={'auto'}
        zIndex={9999}
        position={'absolute'}
        bg={'#111111'}
        boxShadow={'0px 4px 8px rgba(0, 0, 0, 0.25)'}
        borderRadius={'0px 0px 8px 8px'}
        w={'100%'}>
        {optionsList.items.map((option, i) => (
          <Select.Item
            _selected={{
              backgroundColor: '#50506240',
            }}
            _hover={{ backgroundColor: '#50506240' }}
            px={'12px'}
            py={'12px'}
            item={option}
            key={option.value}
            display={'flex'}
            w={'100%'}
            borderBottom={
              i !== optionsList.items.length - 1 ? '1px solid #62646b' : ''
            }>
            {option.label}
          </Select.Item>
        ))}
      </Select.Content>
    </Select.Root>
  );
};

export default DropdownAlt;
