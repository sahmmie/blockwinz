import { ProgressCircle } from '@chakra-ui/react';
import { FunctionComponent } from 'react';

interface ProgressSpinnerProps {}

const ProgressSpinner: FunctionComponent<ProgressSpinnerProps> = () => {
  return (
    <>
      <ProgressCircle.Root value={null} size='sm'>
        <ProgressCircle.Circle>
          <ProgressCircle.Track />
          <ProgressCircle.Range />
        </ProgressCircle.Circle>
      </ProgressCircle.Root>
    </>
  );
};

export default ProgressSpinner;
