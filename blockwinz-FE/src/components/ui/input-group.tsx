import type { BoxProps, InputElementProps } from '@chakra-ui/react';
import { Group, InputElement } from '@chakra-ui/react';
import * as React from 'react';

export interface InputGroupProps extends BoxProps {
  startElementProps?: InputElementProps;
  endElementProps?: InputElementProps;
  startElement?: React.ReactNode;
  endElement?: React.ReactNode;
  children: React.ReactElement;
  startOffset?: InputElementProps['paddingStart'];
  endOffset?: InputElementProps['paddingEnd'];
}

export const InputGroup = React.forwardRef<HTMLDivElement, InputGroupProps>(
  function InputGroup(props, ref) {
    const {
      startElement,
      startElementProps,
      endElement,
      endElementProps,
      children,
      startOffset = '6px',
      endOffset = '6px',
      ...rest
    } = props;

    const startRef = React.useRef<HTMLDivElement>(null);
    const endRef = React.useRef<HTMLDivElement>(null);

    const [startWidth, setStartWidth] = React.useState(0);
    const [endWidth, setEndWidth] = React.useState(0);

    React.useEffect(() => {
      if (startRef.current) {
        setStartWidth(startRef.current.offsetWidth);
      }
      if (endRef.current) {
        setEndWidth(endRef.current.offsetWidth);
      }
    }, [startElement, endElement]);

    const child =
      React.Children.only<React.ReactElement<InputElementProps>>(children);

    return (
      <Group ref={ref} {...rest}>
        {startElement && (
          <InputElement
            ref={startRef}
            pointerEvents='none'
            {...startElementProps}>
            {startElement}
          </InputElement>
        )}

        {React.cloneElement(child, {
          ...(startElement && {
            ps: `calc(${startWidth}px + ${startOffset})`,
          }),
          ...(endElement && {
            pe: `calc(${endWidth}px + ${endOffset})`,
          }),
          ...children.props,
        })}

        {endElement && (
          <InputElement ref={endRef} placement='end' {...endElementProps}>
            {endElement}
          </InputElement>
        )}
      </Group>
    );
  },
);
