/* eslint-disable @typescript-eslint/no-explicit-any */
import CustomInput from '@/components/CustomInput/CustomInput';
import Dropdown from '@/components/Dropdown/Dropdown';
import { Button } from '@/components/ui/button';
import { Box, Text } from '@chakra-ui/react';
import { FunctionComponent, useCallback, useEffect, useState } from 'react';
import CopyIcon from '../../../assets/icons/copy-icon.svg';
import InfoIcon from '../../../assets/icons/info-icon.svg';
import {
  DEFAULT_CURRENCY,
  SUPPORTED_CURRENCIES,
} from '@/shared/constants/app.constant';
import { toaster } from '@/components/ui/toaster';
import axiosInstance from '@/lib/axios';
import { HttpResponse } from '@/shared/interfaces/http.interface';
import { WalletInfo } from '@/shared/types/core';
import { Link } from 'react-router-dom';
import useModal from '@/hooks/useModal';
import useWalletState from '@/hooks/useWalletState';
import { reportClientError } from '@/shared/utils/monitoring';
import { capturePosthogEvent } from '@/shared/utils/posthog';

interface DepsoitProps {}

const Deposit: FunctionComponent<DepsoitProps> = () => {
  const { closeModal } = useModal();
  const [depositAddresses, setDepositAddresses] = useState<WalletInfo[]>([]);
  const [availableNetworks, setAvailableNetworks] = useState<string[]>([]);
  const supportedCurrencies = SUPPORTED_CURRENCIES.map(c => ({
    ...c,
    currency: c.currency.toUpperCase(),
  }));
  const [selectedCurrency, setSelectedCurrency] = useState<string>(
    supportedCurrencies.find(c => c.currency === DEFAULT_CURRENCY.toUpperCase())
      ?.currency || supportedCurrencies[0].currency,
  );
  const [depositAddress, setDepositAddress] = useState<string>('');
  const [addressLoadError, setAddressLoadError] = useState<string | null>(null);
  const { getWalletData, isFetchingForceBalances } = useWalletState();

  const getWalletAddress = async () => {
    axiosInstance
      .get('/wallet/getAddress')
      .then((response: HttpResponse<WalletInfo[]>) => {
        setAddressLoadError(null);
        setDepositAddresses(response.data);
        capturePosthogEvent('deposit_address_viewed', {
          walletCount: response.data.length,
        });
      })
      .catch(() => {
        setAddressLoadError('Unable to load your deposit address right now.');
        reportClientError('deposit-address', 'Failed to get wallet address');
        toaster.create({
          title: 'Failed to get wallet address',
          type: 'error',
        });
      });
  };

  useEffect(() => {
    getWalletAddress();
  }, []);

  const mapSelectedCurrencyToNetwork = useCallback(
    (currency: string): string[] => {
      const selectedCurrencyData = supportedCurrencies.find(
        c => c.currency === currency,
      );
      if (!selectedCurrencyData) {
        return [];
      }
      return selectedCurrencyData.network;
    },
    [supportedCurrencies],
  );

  useEffect(() => {
    setAvailableNetworks(mapSelectedCurrencyToNetwork(selectedCurrency));
    setDepositAddress(
      depositAddresses.find(d => d.currency === selectedCurrency.toLowerCase())
        ?.address || '',
    );
  }, [
    availableNetworks,
    depositAddresses,
    mapSelectedCurrencyToNetwork,
    selectedCurrency,
  ]);

  const selectTargetOnFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    event.target.select();
  };

  const copyToClipboard = () => {
    if (!depositAddress) {
      return;
    }
    navigator.clipboard.writeText(depositAddress).then(
      () => {
        capturePosthogEvent('deposit_address_copied', {
          currency: selectedCurrency,
        });
        // Optional: Display success feedback (e.g., toast or UI update)
        toaster.create({
          title: 'Address Copied',
          type: 'success',
        });
      },
      () => {
        toaster.create({
          title: 'Failed to copy address',
          type: 'error',
        });
      },
    );
  };

  const label = (): JSX.Element => {
    return (
      <>
        <Box
          w={'100%'}
          display={'flex'}
          justifyContent={'space-between'}
          alignItems={'center'}
          color={'#D9D9D9'}
          mb={'2px'}>
          <Box fontSize={'16px'} fontWeight={'600'} lineHeight={'24px'}>
            <Text>Address</Text>
          </Box>
        </Box>
      </>
    );
  };

  const endElement = () => {
    return (
      <>
        <Button bg={'none'} onClick={copyToClipboard}>
          <img
            src={CopyIcon}
            alt='Multiplier Icon'
            style={{ width: '20px', height: '20px' }}
          />
        </Button>
      </>
    );
  };

  return (
    <>
      <Box
        w={'100%'}
        display={'flex'}
        justifyContent={'space-between'}
        gap={'14px'}>
        <Box w={'100%'}>
          <Dropdown
            labelName='currency'
            keyName='currency'
            placeholder='Select a currency'
            label='Currency'
            options={supportedCurrencies}
            selected={selectedCurrency}
            handleChange={e => setSelectedCurrency((e.target as any).value)}
          />
        </Box>
      </Box>
      <Box pt={'24px'}>
        {addressLoadError && (
          <Box mb={'12px'}>
            <Text color='red.300' fontSize='14px'>
              {addressLoadError}
            </Text>
            <Button mt='8px' variant='outline' onClick={getWalletAddress}>
              Retry Address Load
            </Button>
          </Box>
        )}
        <CustomInput
          onFocus={selectTargetOnFocus}
          readOnly
          border={'thin solid #CBCCD1'}
          borderRadius={'8px'}
          type='text'
          value={depositAddress}
          fieldProps={{ label: label(), errorText: null }}
          inputGroupProps={{
            endElement: endElement(),
          }}
        />
        <Box mt={'16px'} display='flex' alignItems='center' gap='8px'>
          <Text fontSize='14px' color='#888'>
            Deposit taking too long?
          </Text>
          <Button
            variant='outline'
            onClick={() => {
              capturePosthogEvent('wallet_balance_refresh_requested', {
                source: 'deposit',
              });
              void getWalletData(true);
            }}
            loading={isFetchingForceBalances}
            disabled={isFetchingForceBalances}>
            Refresh Balance
          </Button>
        </Box>
      </Box>
      <Box display={'flex'} mt={'16px'} w={'100%'}>
        <img
          src={InfoIcon}
          alt='Info'
          style={{ width: '20px', height: '20px' }}
        />
        <Text ml={'6px'}>
          Only {DEFAULT_CURRENCY} deposits are currently supported
        </Text>
      </Box>

      <Box
        textAlign={'center'}
        mt={'28px'}
        fontSize={'16px'}
        fontWeight={'600'}
        lineHeight={'24px'}
        textDecoration={'underline'}>
        <Link onClick={closeModal} to='/transactions'>
          Deposit History
        </Link>
      </Box>
    </>
  );
};

export default Deposit;
