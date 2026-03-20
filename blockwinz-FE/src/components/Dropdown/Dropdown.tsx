/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  createListCollection,
  Flex,
  ListCollection,
  Text,
} from '@chakra-ui/react';
import { FunctionComponent, useEffect, useState } from 'react';
import {
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
} from '../ui/select';

interface DropdownProps extends OptionProps {
  label?: string;
  placeholder?: string;
  options: any[];
  handleChange?: (value: React.FormEvent<HTMLDivElement>) => void;
  selected: string | null;
  selectTriggerProps?: any;
  className?: string;
  readOnly?: boolean;
}

interface OptionProps {
  keyName: string;
  labelName: string;
  icon?: string;
}

const Dropdown: FunctionComponent<DropdownProps> = ({
  options,
  keyName,
  labelName,
  handleChange,
  icon,
  selected,
  label,
  placeholder,
  selectTriggerProps,
  className,
  readOnly = false,
}) => {
  const [dataList, setDataList] = useState<ListCollection>(
    createListCollection({
      items: [{ icon: null, label: 'Deposit', value: 'Deposit' }],
    }),
  );

  const selectedOption = dataList.items.find(
    option => option.value === selected,
  );

  const convertToCollection = (list: unknown[]): ListCollection => {
    return createListCollection({
      items: list.map((option: any) => ({
        label: option[labelName],
        value: option[keyName],
        icon: icon ? option[icon] : null,
      })),
    });
  };

  const convertToCollectionFromArrayOfStrings = (
    list: string[],
  ): ListCollection => {
    return createListCollection({
      items: list.map((option: string) => ({
        label: option,
        value: option,
        icon: icon ? option : null,
      })),
    });
  };

  useEffect(() => {
    if (!Array.isArray(options)) return;

    if (options.length === 0 || typeof options[0] === 'string') {
      setDataList(convertToCollectionFromArrayOfStrings(options));
    } else {
      setDataList(convertToCollection(options));
    }
  }, [options]);

  return (
    <SelectRoot
      readOnly={readOnly}
      className={className}
      collection={dataList}
      size='lg'
      width='100%'
      variant='outline'
      borderRadius='8px'
      multiple={false}
      onChange={handleChange}>
      <SelectLabel fontSize={'14px'} fontWeight={'500'}>
        {label}
      </SelectLabel>
      <SelectTrigger {...selectTriggerProps}>
        {selectedOption && (
          <Flex alignItems='center' gap='2'>
            {selectedOption?.icon && (
              <img
                src={selectedOption?.icon}
                alt='Currency Icon'
                style={{ width: '22px', height: '22px' }}
              />
            )}
            <Text fontWeight={'500'} fontSize={'14px'}>
              {selectedOption[labelName] || selectedOption.label}
            </Text>
          </Flex>
        )}
        {!selectedOption && <SelectValueText placeholder={placeholder} />}
      </SelectTrigger>
      <SelectContent zIndex={9991} bg={'#111111'}>
        {dataList.items.map((option, index) => (
          <SelectItem item={option} key={option.value + index}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </SelectRoot>
  );
};

export default Dropdown;
