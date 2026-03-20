import { Input, InputProps } from '@chakra-ui/react';
import { FunctionComponent } from 'react';
import { Field, FieldProps } from '../ui/field';
import { InputGroup, InputGroupProps } from '../ui/input-group';

export interface CustomInputProps extends InputProps {
  fieldProps?: FieldProps;
  inputGroupProps?: Partial<InputGroupProps>;
  customInputStyle?: React.CSSProperties;
}

const CustomInput: FunctionComponent<CustomInputProps> = ({
  fieldProps,
  inputGroupProps,
  customInputStyle,
  ...rest
}) => {
  const { label, errorText } = fieldProps || {};
  const { startElement, endElement, bg, h, w, borderRadius } =
    inputGroupProps || {};
  return (
    <>
      <Field
        invalid={!!errorText}
        label={label}
        errorText={errorText}
        className='input-group'>
        <InputGroup
          w={w || '100%'}
          border={rest.border}
          borderColor={rest.borderColor}
          borderRadius={rest.borderRadius}
          borderWidth={rest.borderWidth}
          startElement={startElement}
          endElement={endElement}>
          <Input
            className={startElement ? 'input-icon' : ''}
            {...rest}
            style={customInputStyle}
            outlineColor={errorText ? '#F43B51' : '#ffffff'}
            borderRadius={borderRadius || '8px'}
            h={h || '58px'}
            bg={bg || '#000A27'}
            border={'none'}
          />
        </InputGroup>
      </Field>
    </>
  );
};

export default CustomInput;
