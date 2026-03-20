import useAuth from '@/hooks/useAuth';
import { useFavouritesInitializer } from '@/hooks/useFavourite';
import { useIsMobile, useNavbarHeight } from '@/hooks/useIsMobile';
import useModal from '@/hooks/useModal';
import { useSettingsInitializer } from '@/hooks/useSettings';
import useWalletState from '@/hooks/useWalletState';
import { CurrencyInfo } from '@/shared/types/core';
import { currencyIconMap } from '@/shared/utils/gameMaps';
import {
  Box,
  createListCollection,
  Flex,
  Image,
  ListCollection,
  Text,
} from '@chakra-ui/react';
import {
  FunctionComponent,
  memo,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import BlockwinzLogo from '@/assets/bw-icon-only.svg';
import BlockwinzLogoWhite from '@/assets/bw-white-big-icon.svg';
import SidebarIcon from '@/assets/icons/sideIcon.svg';
import WalletIcon from '@/assets/icons/wallet-line.svg';
import TestnetNoticeContent from '../TestnetNoticeContent/TestnetNoticeContent';
import { Button } from '../ui/button';
import {
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
} from '../ui/select';
import Wallet from '../Wallet/Wallet';
import AuthNav from './AuthNav';
import useAccount from '@/hooks/userAccount';
import { showLoginModal } from '@/shared/utils/authModalHandler';
import { DEFAULT_ROUNDING_DECIMALS } from '@/shared/constants/app.constant';
import DollarIcon from '@/assets/icons/dollar-icon.svg';
import React from 'react';
import { parseFloatValue } from '@/shared/utils/common';

interface NavbarProps {
  setSidebarIsCollapsed: (isCollapsed: boolean) => void;
  sidebarIsCollapsed: boolean;
}

const Navbar: FunctionComponent<NavbarProps> = ({
  setSidebarIsCollapsed,
  sidebarIsCollapsed,
}) => {
  const {
    balances,
    selectedBalance,
    setSelectedBalance,
    getWalletData,
    getTokenPrices,
    getTokenPrice,
  } = useWalletState();
  const ROUNDING_DECIMALS =
    selectedBalance?.decimals || DEFAULT_ROUNDING_DECIMALS;

  const { isAuthenticated } = useAuth();
  const { openModal } = useModal();
  const location = useLocation();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const NAVBAR_HEIGHT = useNavbarHeight();

  const navbarHeightInPx = `${NAVBAR_HEIGHT}px`;

  //TODO: Move these initializers to a more appropriate place in your app (e.g HOC component)
  const { fetchProfileData } = useAccount();
  const { setToken, token } = useAuth();

  useFavouritesInitializer();
  useSettingsInitializer();

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }
    fetchProfileData().catch(() => {
      setToken(null);
      showLoginModal();
    });
  }, [token, navigate, setToken, fetchProfileData, isAuthenticated]);
  // Ends here

  type CurrencyItem = { label: string; value: string; icon: string };
  const [currencyList, setCurrencyList] = useState<ListCollection<CurrencyItem>>(
    createListCollection<CurrencyItem>({ items: [] }),
  );

  useEffect(() => {
    setCurrencyList(currenciesToList(balances));
  }, [balances]);

  useEffect(() => {
    if (isAuthenticated) {
      getWalletData();
      getTokenPrices();
    }
  }, [isAuthenticated]);

  const openWalletModal = () => {
    openModal(<Wallet />, 'Wallet', { width: { base: '90%', md: '600px' } });
  };

  const openTestnetNoticeModal = useCallback(() => {
    openModal(<TestnetNoticeContent />, undefined, {
      width: { base: '90%', md: '400px' },
      hideHeader: true,
    });
  }, [openModal]);

  useEffect(() => {
    if (isAuthenticated) {
      openTestnetNoticeModal();
    }
  }, [isAuthenticated, openTestnetNoticeModal]);

  // Automatically open wallet modal if a valid `view` query param is present
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const viewParam = params.get('view');

    if (
      viewParam &&
      ['deposit', 'withdrawal', 'buycrypto', 'tip'].includes(viewParam)
    ) {
      openWalletModal();
    }
  }, [location.search]);

  const currenciesToList = (
    currencies: CurrencyInfo[],
  ): ListCollection<CurrencyItem> => {
    return createListCollection<CurrencyItem>({
      items: currencies.map(currency => {
        return {
          label: `${parseFloatValue(
            currency.availableBalance,
            ROUNDING_DECIMALS,
          )}`,
          value: currency.currency,
          icon: currencyIconMap[currency.currency],
        };
      }),
    });
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedCurrency = event.target.value;
    const selectedBalance = balances.find(
      balance => balance.currency === selectedCurrency,
    );
    if (selectedBalance) {
      setSelectedBalance(selectedBalance);
    }
  };

  const selectWallet = () => {
    return (
      <SelectRoot
        className='select-button'
        collection={currencyList}
        size='md'
        minWidth='160px'
        maxWidth={{ base: '160px', md: '200px' }}
        variant='outline'
        borderRadius='8px'
        multiple={false}
        onChange={handleChange}>
        <SelectTrigger>
          <Flex
            alignItems='center'
            gap='2'
            overflow={'hidden'}
            textOverflow={'clip'}
            whiteSpace={'nowrap'}>
            {selectedBalance?.icon && (
              <img
                src={selectedBalance?.icon || ''}
                alt='Currency Icon'
                style={{ width: '18px' }}
              />
            )}
            <Text fontWeight={'500'} fontSize={'16px'}>
              {parseFloatValue(
                selectedBalance?.availableBalance,
                ROUNDING_DECIMALS,
              )}
            </Text>
          </Flex>
        </SelectTrigger>
        <SelectContent
          w={'100%'}
          maxH={'300px'}
          bg={'#111111'}
          overflowY={'auto'}>
          {currencyList.items.map((currency, i) => (
            <React.Fragment key={currency.value || currency.label || i}>
              <SelectItem
                showIndicator={false}
                fontSize={'14px'}
                fontWeight={'500'}
                item={currency}
                display={'flex'}
                flexDirection={'column'}
                justifyContent={'space-between'}>
                <Box
                  display={'flex'}
                  alignItems={'center'}
                  gap={'16px'}
                  justifyContent={'space-between'}
                  w={'100%'}>
                  <Box display={'flex'} alignItems={'center'} gap={'8px'}>
                    <Image
                      src={currency.icon || ''}
                      alt='Currency Icon'
                      style={{ width: '18px', height: '18px' }}
                    />
                    {currency.value.toUpperCase()}
                  </Box>
                  <Text>{currency.label}</Text>
                </Box>
                <Box
                  display={'flex'}
                  alignItems={'center'}
                  gap={'16px'}
                  justifyContent={'space-between'}
                  w={'100%'}>
                  <Box display={'flex'} alignItems={'center'} gap={'8px'}>
                    <Image
                      src={DollarIcon}
                      alt='Currency Icon'
                      style={{ width: '20px', height: '20px' }}
                    />
                    USD
                  </Box>
                  <Text>
                    $
                    {parseFloatValue(
                      getTokenPrice(currency.value.toUpperCase()) *
                        parseFloatValue(currency.label),
                    )}
                  </Text>
                </Box>
              </SelectItem>
              {i === 0 && (
                <Box
                  key={`divider-${i}`}
                  style={{
                    width: '100%',
                    height: '1px',
                    backgroundColor: '#cbccd187',
                  }}
                />
              )}
            </React.Fragment>
          ))}
        </SelectContent>
      </SelectRoot>
    );
  };

  return (
    <>
      <Box
        height={navbarHeightInPx}
        bg={'#151832'}
        display={'flex'}
        alignItems={'center'}
        w={'100%'}
        px={{ base: '18px', md: '28px' }}>
        <Flex
          alignItems={'center'}
          justifyContent={'space-between'}
          width={'100%'}>
          <Box display={'flex'} alignItems={'center'} w={'100%'}>
            {!isMobile && (
              <Button
                cursor={'pointer'}
                unstyled
                onClick={() => setSidebarIsCollapsed(!sidebarIsCollapsed)}>
                <img
                  src={SidebarIcon}
                  alt='Sidebar icon'
                  style={{ width: '22px', height: '16px', marginRight: '26px' }}
                />
              </Button>
            )}
            <Image
              onClick={() => navigate('/')}
              src={isMobile ? BlockwinzLogo : BlockwinzLogoWhite}
              alt='Blockwinz logo'
              width={{ base: '32px', md: '170px' }}
              height={{ base: '32px', md: '30px' }}
            />
          </Box>

          {selectedBalance && isAuthenticated && (
            <Box
            mr={{ base: '16px', md: '0' }}
              w={'100%'}
              display={'flex'}
              alignItems={'center'}
              justifyContent={'center'}>
              {selectWallet()}
              <Button
                unstyled
                minW={'58px'}
                onClick={openWalletModal}
                cursor={'pointer'}
                ml={'8px'}
                height={{ base: '36px', md: '40px' }}
                display={'flex'}
                alignItems={'center'}
                justifyContent={'center'}
                bg={'#00DD25'}
                borderRadius={'6px'}
                paddingX={'8px'}>
                {!isMobile && (
                  <Text
                    color={'#151832'}
                    fontWeight={'500'}
                    lineHeight={'30px'}
                    mx={'8px'}>
                    Wallet
                  </Text>
                )}
                <Image
                  src={WalletIcon}
                  alt='Wallet icon'
                  width={{ base: '26px', md: '26px' }}
                  height={{ base: '22px', md: '24px' }}
                />
              </Button>
            </Box>
          )}

          <AuthNav />
        </Flex>
      </Box>
    </>
  );
};

export default memo(Navbar);
