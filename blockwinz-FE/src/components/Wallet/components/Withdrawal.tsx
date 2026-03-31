import CustomInput from '@/components/CustomInput/CustomInput';
import Dropdown from '@/components/Dropdown/Dropdown';
import { Box, Text } from '@chakra-ui/react';
import { FunctionComponent, useState } from 'react';
import InfoIcon from '../../../assets/icons/info-icon.svg';
import { Button } from '@/components/ui/button';
import axiosInstance from '@/lib/axios';
import { toaster } from '@/components/ui/toaster';
import useWalletState from '@/hooks/useWalletState';
import { customAlphabet } from 'nanoid';
import { HttpError } from '@/shared/interfaces/http.interface';
import { AxiosError } from 'axios';
import { SUPPORTED_CURRENCIES } from '@/shared/constants/app.constant';
import { parseFloatValue } from '@/shared/utils/common';
import { reportClientError } from '@/shared/utils/monitoring';
import { capturePosthogEvent } from '@/shared/utils/posthog';

interface WithdrawalProps {}

interface WithdrawalFormData {
  amount: string;
  walletAddress: string;
}

const Withdrawal: FunctionComponent<WithdrawalProps> = () => {
  const options = SUPPORTED_CURRENCIES.map(c => ({
    label: c.currency.toUpperCase(),
    value: c.currency,
  }));
  const [selectedCurrency, setSelectedCurrency] = useState<string>(
    options[0].value,
  );
  const { balances, getWalletData } = useWalletState();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<WithdrawalFormData>({
    amount: '',
    walletAddress: '',
  });
  const [errors, setErrors] = useState<Partial<WithdrawalFormData>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const generateIdempotentKey = () => {
    const alphabet =
      '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz-';
    const nanoid = customAlphabet(alphabet, 16);
    return nanoid();
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<WithdrawalFormData> = {};
    const currentBalance = balances.find(b => b.currency === selectedCurrency);
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    } else if (
      currentBalance &&
      parseFloatValue(formData.amount, currentBalance.decimals) >
        currentBalance.availableBalance
    ) {
      newErrors.amount = 'Insufficient balance';
    }
    if (!formData.walletAddress) {
      newErrors.walletAddress = 'Wallet address is required';
    } else if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(formData.walletAddress)) {
      newErrors.walletAddress = 'Invalid Solana address format';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    setIsSubmitting(true);
    setSubmitError(null);
    capturePosthogEvent('withdrawal_submit_attempted', {
      currency: selectedCurrency,
    });
    try {
      await axiosInstance.put(
        '/withdrawals/request',
        {
          currency: selectedCurrency,
          amount: parseFloatValue(
            formData.amount,
            balances.find(b => b.currency === selectedCurrency)?.decimals,
          ),
          destinationAddress: formData.walletAddress,
        },
        {
          headers: {
            'withdrawal-key': generateIdempotentKey(),
          },
        },
      );
      toaster.create({
        title: 'Withdrawal Request Submitted',
        type: 'success',
      });
      capturePosthogEvent('withdrawal_submitted', {
        currency: selectedCurrency,
      });
      setFormData({
        amount: '',
        walletAddress: '',
      });
      await getWalletData();
    } catch (err) {
      const error = err as AxiosError<HttpError>;
      const message =
        error?.response?.data?.errorMessage || 'Please try again later';
      setSubmitError(message);
      reportClientError('withdrawal-submit', err, {
        currency: selectedCurrency,
      });
      toaster.create({
        title: 'Withdrawal Failed',
        description: message,
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const label = (title: string): JSX.Element => {
    return (
      <>
        <Box
          w={'100%'}
          display={'flex'}
          justifyContent={'space-between'}
          alignItems={'center'}
          color={'#D9D9D9'}
          mb={'2px'}>
          <Box fontSize={'14px'} fontWeight={'500'}>
            <Text>{title}</Text>
          </Box>
        </Box>
      </>
    );
  };

  const validateAmount = (amount: string) => {
    const amountNumber = Number(amount);
    const currentBalance = balances.find(b => b.currency === selectedCurrency);
    if (!currentBalance) {
      setFormData({ ...formData, amount: '0.0' });
    }
    if (currentBalance && amountNumber > currentBalance.availableBalance) {
      setFormData({
        ...formData,
        amount: parseFloatValue(
          currentBalance.availableBalance,
          currentBalance.decimals,
        ).toString(),
      });
    } else {
      setFormData({ ...formData, amount });
    }
  };

  const handleSetPercent = (percent: number) => {
    capturePosthogEvent('withdrawal_percent_selected', {
      currency: selectedCurrency,
      percent,
    });
    const currentBalance = balances.find(b => b.currency === selectedCurrency);
    const amount = ((currentBalance?.availableBalance || 0) * percent) / 100;
    validateAmount(
      parseFloatValue(amount, currentBalance?.decimals).toString(),
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
            labelName='label'
            keyName='value'
            placeholder='Select a currency'
            label='Currency*'
            options={options}
            selected={selectedCurrency}
            handleChange={e =>
              setSelectedCurrency(
                (e.target as unknown as { value: string }).value,
              )
            }
          />
        </Box>
      </Box>
      <Box
        pt={'24px'}
        display={'flex'}
        justifyContent={'space-between'}
        w={'100%'}
        gap={'14px'}>
        <Box w={'100%'}>
          <CustomInput
            border={'thin solid #CBCCD1'}
            borderRadius={'8px'}
            type='number'
            value={formData.amount}
            onChange={e => validateAmount(e.target.value)}
            placeholder='Enter amount to withdraw'
            fieldProps={{
              label: label('Withdrawal Amount*'),
              errorText: errors.amount,
            }}
          />
          <Box display='flex' alignItems='center' gap='8px' mt='8px' w={'100%'}>
            {([25, 50, 75, 100] as const).map(percent => (
              <Box key={percent} w={'100%'}>
                <Button
                  w={'100%'}
                  key={percent}
                  size='md'
                  onClick={() => handleSetPercent(percent)}
                  bg='rgba(78, 77, 101, 0.64)'
                  color='#FFFFFF'
                  borderRadius='8px'>
                  {percent}%
                </Button>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
      <Box pt={'24px'}>
        <CustomInput
          border={'thin solid #CBCCD1'}
          borderRadius={'8px'}
          type='text'
          value={formData.walletAddress}
          onChange={e =>
            setFormData({ ...formData, walletAddress: e.target.value })
          }
          placeholder='Enter your Solana wallet address'
          fieldProps={{
            label: label('Recipient Wallet Address*'),
            errorText: errors.walletAddress,
          }}
        />
      </Box>
      <Box display={'flex'} mt={'20px'} w={'100%'} alignItems={'center'}>
        <img
          src={InfoIcon}
          alt='Info'
          style={{ width: '18px', height: '18px' }}
        />
        <Text ml={'6px'}>
          Your withdrawal will be processed on the Solana Network
        </Text>
      </Box>
      <Box display={'flex'} mt={'8px'} w={'100%'} alignContent={'center'}>
        <img
          src={InfoIcon}
          alt='Info'
          style={{ width: '18px', height: '18px' }}
        />
        <Text ml={'6px'}>
          Withdrawal Fee:{' '}
          {balances.find(c => c.currency === selectedCurrency)?.withdrawalFee}{' '}
          {selectedCurrency.toUpperCase()}
        </Text>
      </Box>
      {submitError && (
        <Text mt={'12px'} color='red.300'>
          {submitError}
        </Text>
      )}
      <Box display={'flex'} justifyContent={'center'} mt={'24px'}>
        <Button
          loading={isSubmitting}
          onClick={handleSubmit}
          disabled={isSubmitting}
          bg={'#00DD25'}
          color={'#151832'}
          fontWeight={'500'}
          borderRadius={'6px'}
          paddingX={'64px'}
          paddingY={'22px'}
          _hover={{ opacity: 0.9 }}
          _disabled={{ opacity: 0.5, cursor: 'not-allowed' }}>
          {isSubmitting ? 'Processing...' : 'Withdraw'}
        </Button>
      </Box>
    </>
  );
};

export default Withdrawal;
