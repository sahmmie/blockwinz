import { FunctionComponent } from 'react';
import AccountIcon from '@/assets/icons/account-icon.svg';
import { Box, Popover, Portal } from '@chakra-ui/react';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';
import { useSettingsStore } from '@/hooks/useSettings';

interface SettingsPopoverProps {}

const SettingsPopover: FunctionComponent<SettingsPopoverProps> = () => {
  const { settings, updatePlayerSettings, isLoading } = useSettingsStore();
  const renderSettings = () => {
    return (
      <>
        <Box mt={'16px'}>
          <Switch
            disabled={isLoading}
            labelDirection='right'
            checked={settings.isMuted}
            onCheckedChange={({ checked }) =>
              updatePlayerSettings({ isMuted: checked })
            }>
            Mute Sound
          </Switch>
        </Box>
        <Box mb={'16px'}>
          <Switch
            disabled={isLoading}
            labelDirection='right'
            checked={settings.isTurbo}
            onCheckedChange={({ checked }) =>
              updatePlayerSettings({ isTurbo: checked })
            }>
            Turbo Mode
          </Switch>
        </Box>
      </>
    );
  };

  return (
    <>
      <Popover.Root positioning={{ placement: 'top-start' }} size={'xs'}>
        <Popover.Trigger asChild>
          <Button p={'unset'} bg={'unset'}>
            <img
              src={AccountIcon}
              alt={'settings-icon'}
              style={{ width: '24px', height: '24px' }}
            />
          </Button>
        </Popover.Trigger>
        <Portal>
          <Popover.Positioner>
            <Popover.Content
              css={{ '--popover-bg': '#000A27' }}
              w='200px'
              minH={'100px'}
              borderRadius='8px'>
              <Popover.Arrow bg={'#000A27'}>
                <Popover.ArrowTip bg={'#000A27'} />
              </Popover.Arrow>
              <Popover.Body
                gap={'28px'}
                display={'flex'}
                flexDirection={'column'}
                justifyContent={'center'}
                alignItems={'center'}
                w={'200px'}
                width={'100%'}>
                {renderSettings()}
              </Popover.Body>
            </Popover.Content>
          </Popover.Positioner>
        </Portal>
      </Popover.Root>
    </>
  );
};

export default SettingsPopover;
