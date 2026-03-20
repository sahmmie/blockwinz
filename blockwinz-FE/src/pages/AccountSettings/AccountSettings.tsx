import { FunctionComponent } from 'react';
import { Outlet } from 'react-router-dom';
import AccountSettingsTab from './AccountSettingsTab/AccountSettingsTab';

interface AccountSettingsProps {}

const AccountSettings: FunctionComponent<AccountSettingsProps> = () => {
  return (
    <>
      <AccountSettingsTab />
      <Outlet />
    </>
  );
};

export default AccountSettings;
