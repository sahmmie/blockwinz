import { Box } from '@chakra-ui/react';
import { FunctionComponent, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Segment from '../Segment/Segment';
import Withdrawal from './components/Withdrawal';
import Deposit from './components/Deposit';
import BuyCrypto from './components/BuyCrypto';
import Tip from './components/Tip';

interface WalletProps {}

const Wallet: FunctionComponent<WalletProps> = () => {
  const options = [
    { label: 'Deposit', value: 'deposit' },
    { label: 'Withdrawal', value: 'withdrawal' },
    { label: 'Buy crypto', value: 'buycrypto' },
    { label: 'Tip', value: 'tip' },
  ];

  const [selected, setSelected] = useState(options[0].value);
  const location = useLocation();
  const navigate = useNavigate();

  // Initialize selected based on query param
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const viewParam = params.get('view');
    if (viewParam && options.some(option => option.value === viewParam)) {
      setSelected(viewParam);
    }
  }, [location.search]);

  // Handle query param addition and cleanup
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    params.set('view', selected);
    navigate({ search: params.toString() }, { replace: true });

    return () => {
      const params = new URLSearchParams(location.search);
      params.delete('view');
      navigate({ search: params.toString() }, { replace: true });
    };
  }, [selected, location.search, navigate]);

  const getSelectedUI = () => {
    switch (selected) {
      case 'deposit':
        return <Deposit />;
      case 'withdrawal':
        return <Withdrawal />;
      case 'buycrypto':
        return <BuyCrypto />;
      case 'tip':
        return <Tip />;
      default:
        return <></>;
    }
  };

  return (
    <>
      <Box minH={'400px'}>
        <Segment
          bg={'#50506240'}
          padding='0px'
          borderRadius='0px'
          options={options}
          selected={selected}
          setSelected={setSelected}
        />
        <Box padding={{ base: '8px', md: '20px' }}>{getSelectedUI()}</Box>
      </Box>
    </>
  );
};

export default Wallet;
