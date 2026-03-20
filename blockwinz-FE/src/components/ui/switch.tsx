import { Switch as ChakraSwitch } from '@chakra-ui/react';
import * as React from 'react';

export interface SwitchProps extends ChakraSwitch.RootProps {
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  rootRef?: React.RefObject<HTMLLabelElement | null>;
  trackLabel?: { on: React.ReactNode; off: React.ReactNode };
  thumbLabel?: { on: React.ReactNode; off: React.ReactNode };
  labelDirection: 'left' | 'right';
}

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  function Switch(props, ref) {
    const {
      labelDirection,
      inputProps,
      children,
      rootRef,
      trackLabel,
      thumbLabel,
      ...rest
    } = props;

    return (
      <ChakraSwitch.Root ref={rootRef as React.LegacyRef<HTMLLabelElement>} {...rest}>
        <ChakraSwitch.HiddenInput ref={ref} {...inputProps} />
        {children != null && labelDirection === 'right' && (
          <ChakraSwitch.Label>{children}</ChakraSwitch.Label>
        )}
        <ChakraSwitch.Control>
          <ChakraSwitch.Thumb>
            {thumbLabel && (
              <ChakraSwitch.ThumbIndicator fallback={thumbLabel?.off}>
                {thumbLabel?.on}
              </ChakraSwitch.ThumbIndicator>
            )}
          </ChakraSwitch.Thumb>
          {trackLabel && (
            <ChakraSwitch.Indicator fallback={trackLabel.off}>
              {trackLabel.on}
            </ChakraSwitch.Indicator>
          )}
        </ChakraSwitch.Control>
        {children != null && labelDirection === 'left' && (
          <ChakraSwitch.Label>{children}</ChakraSwitch.Label>
        )}
      </ChakraSwitch.Root>
    );
  },
);
