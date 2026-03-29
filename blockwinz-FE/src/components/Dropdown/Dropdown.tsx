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

/** Chakra Select bridges to `target.value` for existing callers (wallet, mines, coinflip). */
export type DropdownChangeEvent = { target: { value: string } };

interface DropdownProps extends OptionProps {
  label?: string;
  placeholder?: string;
  options: any[];
  handleChange?: (e: DropdownChangeEvent) => void;
  selected: string | null;
  selectTriggerProps?: any;
  className?: string;
  readOnly?: boolean;
  /** When true, the select cannot be opened or changed (e.g. during an active game round). */
  disabled?: boolean;
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
  disabled = false,
}) => {
  const [dataList, setDataList] = useState<ListCollection>(
    createListCollection({
      items: [{ icon: null, label: 'Deposit', value: 'Deposit' }],
    }),
  );

  const selectedStr = selected != null ? String(selected) : '';
  const selectedOption = dataList.items.find(
    option => String(option.value) === selectedStr,
  );

  const convertToCollection = (list: unknown[]): ListCollection => {
    return createListCollection({
      items: list.map((option: any) => ({
        label: option[labelName],
        value: String(option[keyName]),
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

  const selectValue =
    selectedStr !== '' ? [selectedStr] : ([] as string[]);

  return (
    <SelectRoot
      {...(readOnly ? { readOnly: true } : {})}
      disabled={disabled}
      className={className}
      collection={dataList}
      size='lg'
      width='100%'
      variant='outline'
      borderRadius='8px'
      multiple={false}
      value={selectValue}
      onValueChange={details => {
        const raw = details.value?.[0];
        if (raw === undefined || !handleChange) return;
        handleChange({ target: { value: String(raw) } });
      }}>
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
