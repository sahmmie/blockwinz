import {
  BetHistoryT,
  isPopulatedGame,
  SeedStatus,
  SeedT,
} from '@/pages/BetHistory/BetHistory.type';
import { Currency } from '@/shared/enums/currency.enum';
import { Box, Image, Text } from '@chakra-ui/react';
import { FunctionComponent, useState } from 'react';
import { Button } from '../ui/button';
import TrendIcon from '@/assets/icons/trend-icon.svg';
import { currencyIconMap } from '@/shared/utils/gameMaps';
import { originalGamesInfo } from '@/shared/constants/originalGamesInfo.constant';
import { UserI } from '@/shared/interfaces/account.interface';
import BwzIcon from '@/assets/bw-icon-only.svg';
import { formatDate } from '@/shared/utils/common';
import CustomInput from '../CustomInput/CustomInput';
import useAccount from '@/hooks/userAccount';
import { Link, useNavigate } from 'react-router-dom';
import { useSeedPair } from '@/hooks/useSeedPair';
import useModal, { ModalProps } from '@/hooks/useModal';
import Fairness from '@/pages/Fairness/Fairness';
import axiosInstance from '@/lib/axios';
import { toaster } from '../ui/toaster';
import { DEFAULT_ROUNDING_DECIMALS } from '@/shared/constants/app.constant';
import useWalletState from '@/hooks/useWalletState';

interface BetDetailsProps {
  betDetails: BetHistoryT;
}

const BetDetails: FunctionComponent<BetDetailsProps> = ({ betDetails }) => {
  const { userData } = useAccount();
  const { openModal } = useModal();
  const { rotateSeedPair, seedPairLoading, activeSeedPair } = useSeedPair();
  const navigate = useNavigate();

  const [isLoadingDetails, setisLoadingDetails] = useState(false);

  const { balances } = useWalletState();

  const legacyGame = isPopulatedGame(betDetails.gameId)
    ? betDetails.gameId
    : null;
  const seedInfo = legacyGame?.seed
    ? (legacyGame.seed as SeedT)
    : undefined;
  const currency =
    betDetails.currency ?? legacyGame?.currency ?? Currency.SOL;
  const betAmount =
    betDetails.betAmount ?? legacyGame?.betAmount ?? 0;
  const totalWinAmount =
    betDetails.totalWinAmount ?? legacyGame?.totalWinAmount ?? 0;
  const multiplierLabel =
    betDetails.multiplier != null && !Number.isNaN(betDetails.multiplier)
      ? Number(betDetails.multiplier).toFixed(2)
      : legacyGame?.multiplier != null
        ? Number(legacyGame.multiplier).toFixed(2)
        : betAmount > 0
          ? (totalWinAmount / betAmount).toFixed(2)
          : '—';
  const placedAt = betDetails.createdAt ?? legacyGame?.createdAt;

  const openFairnessModal = (betHistory: BetHistoryT) => {
    const modalConfig: ModalProps = {
      size: 'lg',
      hideCloseButton: false,
      hideHeader: true,
      width: { base: '90%', md: '600px' },
      backgroundColor: '#000A27',
      autoCloseAfter: 0,
      left: { base: '0', md: '20' },
      backdrop: true,
      scrollBehavior: 'inside',
    };

    openModal(
      <Fairness preSelectedSegment='verify' betHistory={betHistory} />,
      'Fairness',
      modalConfig,
    );
  };

  const getBetDetails = () => {
    if (userData?._id !== (betDetails.user as UserI)._id) {
      openFairnessModal(betDetails);
    }
    setisLoadingDetails(true);
    axiosInstance
      .get(`/bet-history/${betDetails.id ?? betDetails._id}`)
      .then(response => {
        openFairnessModal(response.data);
        setisLoadingDetails(false);
      })
      .catch(() => {
        toaster.create({
          title: 'Failed to get bet details',
          type: 'error',
        });
        setisLoadingDetails(false);
      });
  };

  const getRotateButtonText = (): JSX.Element => {
    if (
      seedInfo &&
      userData?._id === (betDetails.user as UserI)._id &&
      seedInfo.serverSeedHash === activeSeedPair?.serverSeedHashed
    ) {
      return (
        <>
          <Text fontSize={'16px'} fontWeight={'500'} color={'#ECF0F1'}>
            You must rotate your seed pair to verify this bet
          </Text>
          <Button
            loading={seedPairLoading}
            disabled={seedPairLoading}
            cursor={'pointer'}
            as={'button'}
            mt={'18px'}
            px={'64px'}
            py={'16px'}
            unstyled
            onClick={() => rotateSeedPair(true)}
            border={'.5px solid #ECF0F1'}
            borderRadius={'8px'}>
            Rotate Pair
          </Button>
        </>
      );
    }
    if (
      seedInfo &&
      userData?._id !== (betDetails.user as UserI)._id &&
      seedInfo.status === SeedStatus.ACTIVE
    ) {
      return (
        <>
          <Text fontSize={'16px'} fontWeight={'500'} color={'#ECF0F1'}>
            The Bettor must rotate their seed pair to verify this bet
          </Text>
          {verifyButtonText(true)}
        </>
      );
    }
    return verifyButtonText();
  };

  const verifyButtonText = (disbaled = false): JSX.Element => {
    return (
      <Button
        onClick={getBetDetails}
        disabled={disbaled || isLoadingDetails}
        _disabled={{ cursor: 'not-allowed' }}
        loading={isLoadingDetails}
        cursor={'pointer'}
        as={'button'}
        mt={'18px'}
        px={'64px'}
        py={'16px'}
        unstyled
        border={'.5px solid #ECF0F1'}
        borderRadius={'8px'}>
        Verify Bet
      </Button>
    );
  };

  return (
    <>
      <Box
        mb={'28px'}
        display={'flex'}
        justifyContent={'center'}
        w={'100%'}
        minH={'400px'}
        bg={'#000A27'}
        borderRadius={'8px'}
        px={'8px'}>
        <Box maxW={{ base: '100%', md: '600px' }} w={'100%'}>
          <Box
            fontSize={'16px'}
            fontWeight={'500'}
            pt={'24px'}
            pb={'24px'}
            display={'flex'}
            justifyContent={'center'}
            alignItems={'center'}
            gap={'10px'}>
            <Image
              src={originalGamesInfo[betDetails?.gameType].image}
              alt='game'
              w={'24px'}
              h={'24px'}
            />
            <Text>
              {originalGamesInfo[betDetails?.gameType].name}
              {seedInfo?.clientSeed != null
                ? `: ${seedInfo.clientSeed}`
                : ''}
            </Text>
          </Box>
          <Box
            fontSize={'16px'}
            display={'flex'}
            justifyContent={'center'}
            alignItems={'center'}
            gap={'10px'}>
            <Text>Placed by</Text>
            <Image
              src={BwzIcon}
              alt='game'
              w={'24px'}
              h={'24px'}
              borderRadius={'full'}
            />
            <Text>{(betDetails.user as UserI).username}</Text>
          </Box>
          <Box
            pt={'18px'}
            fontSize={'16px'}
            display={'flex'}
            justifyContent={'center'}
            alignItems={'center'}>
            <Text>On {formatDate(placedAt)}</Text>
          </Box>
          <Box
            p={'16px'}
            mt={'18px'}
            fontSize={'16px'}
            display={'flex'}
            bg={'#151832'}
            borderRadius={'8px'}>
            <Box
              borderRight={'1px solid #ECF0F1'}
              w={'100%'}
              textAlign={'center'}>
              <Text fontWeight={'600'}>Bet</Text>
              <Box
                mt={'12px'}
                display={'flex'}
                alignItems={'center'}
                gap={'8px'}
                justifyContent={'center'}>
                <Image
                  src={currencyIconMap[currency]}
                  alt='game'
                  w={'18px'}
                  h={'18px'}
                />
                <Text fontWeight={'500'}>
                  {betAmount.toFixed(
                    balances.find(c => c.currency === currency)?.decimals ||
                      DEFAULT_ROUNDING_DECIMALS,
                  )}
                </Text>
              </Box>
            </Box>
            <Box
              borderRight={'1px solid #ECF0F1'}
              w={'100%'}
              textAlign={'center'}>
              <Text fontWeight={'600'}>Multiplier</Text>
              <Box
                mt={'12px'}
                display={'flex'}
                alignItems={'center'}
                gap={'8px'}
                justifyContent={'center'}>
                <Image src={TrendIcon} alt='Multiplier' w={'18px'} />
                <Text fontWeight={'500'}>{multiplierLabel}</Text>
              </Box>
            </Box>
            <Box w={'100%'} textAlign={'center'}>
              <Text fontWeight={'600'}>Payout</Text>
              <Box
                mt={'12px'}
                display={'flex'}
                alignItems={'center'}
                gap={'8px'}
                justifyContent={'center'}>
                <Image
                  src={currencyIconMap[currency]}
                  alt='game'
                  w={'18px'}
                  h={'18px'}
                />
                <Text fontWeight={'500'}>
                  {totalWinAmount.toFixed(
                    balances.find(c => c.currency === currency)?.decimals ||
                      DEFAULT_ROUNDING_DECIMALS,
                  )}
                </Text>
              </Box>
            </Box>
          </Box>
          <Box my={'28px'} textAlign={'center'}>
            <Button
              onClick={() => navigate(originalGamesInfo[betDetails?.gameType].link)}
              py={'24px'}
              px={'42px'}
              bg={'#00DD25'}
              borderRadius={'8px'}
              fontSize={'16px'}
              fontWeight={'500'}>
              Play {originalGamesInfo[betDetails?.gameType].name}
            </Button>
          </Box>
          <Box
            p={'16px'}
            bg={'#151832'}
            borderRadius={'8px'}
            border={'.5px solid #ECF0F1'}>
            <Text fontSize={'18px'} fontWeight={'500'}>
              Provably fair
            </Text>

            <Box>
              {seedInfo && legacyGame ? (
                <>
                  <Box
                    gap={'16px'}
                    mt={'16px'}
                    display={'flex'}
                    justifyContent={'space-between'}
                    alignItems={'center'}>
                    <CustomInput
                      name='clientSeed'
                      w={'100%'}
                      placeholder='Client Seed'
                      value={seedInfo.clientSeed}
                      type='text'
                      border={'1px solid #CBCCD1'}
                      borderRadius={'8px'}
                      inputGroupProps={{
                        bg: '#000A27',
                      }}
                      fieldProps={{
                        label: 'Client Seed',
                      }}
                      readOnly={true}
                    />
                    <CustomInput
                      name='nonce'
                      w={'100%'}
                      placeholder='Nonce'
                      value={legacyGame.nonce}
                      type='text'
                      border={'1px solid #CBCCD1'}
                      borderRadius={'8px'}
                      inputGroupProps={{
                        bg: '#000A27',
                      }}
                      fieldProps={{
                        label: 'Nonce',
                      }}
                      readOnly={true}
                    />
                  </Box>

                  <Box mt={'16px'}>
                    <CustomInput
                      name='serverSeed'
                      w={'100%'}
                      placeholder='Server Seed Hashed'
                      value={seedInfo.serverSeedHash}
                      type='text'
                      border={'1px solid #CBCCD1'}
                      borderRadius={'8px'}
                      inputGroupProps={{
                        bg: '#000A27',
                      }}
                      fieldProps={{
                        label: 'Server Seed (Hashed)',
                      }}
                      readOnly={true}
                    />
                  </Box>

                  <Box mt={'16px'} textAlign={'center'}>
                    {getRotateButtonText()}
                  </Box>
                </>
              ) : (
                <>
                  <Text mt={'16px'} fontSize={'14px'} color={'#939494'}>
                    Seed details are not included in this summary. Use Verify
                    Bet to open fairness tools when available.
                  </Text>
                  <Box mt={'16px'} textAlign={'center'}>
                    {verifyButtonText()}
                  </Box>
                </>
              )}
              <Box
                mt={'24px'}
                textAlign={'center'}
                fontSize={'16px'}
                fontWeight={'600'}>
                <Link
                  to={'/provably-fair'}
                  target='_blank'
                  style={{ color: '#ECF0F1', textDecoration: 'underline' }}>
                  More information on provably fair
                </Link>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default BetDetails;
