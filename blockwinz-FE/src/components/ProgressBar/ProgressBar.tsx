import { Progress } from '@chakra-ui/react';
import { FunctionComponent } from 'react';

interface ProgressBarProps {
  props?: Progress.RootProps;
  rangeColor?: string;
  trackColor?: string;
}

const ProgressBar: FunctionComponent<ProgressBarProps> = ({
  props,
  rangeColor = 'bg.default',
  trackColor = 'bg.default',
}) => {
  return (
    <>
      <Progress.Root
        variant='subtle'
        size={'md'}
        shape={'full'}
        w={'100%'}
        {...props}>
        <Progress.Track bg={trackColor}>
          <Progress.Range bg={rangeColor} />
        </Progress.Track>
      </Progress.Root>
    </>
  );
};

export default ProgressBar;
