import {
  BetHistoryT,
  isPopulatedGame,
  SeedStatus,
  SeedT,
} from '@/pages/BetHistory/BetHistory.type';
import { Currency } from '@blockwinz/shared';
import { Box, Image, Text } from '@chakra-ui/react';
import {
  FunctionComponent,
  useEffect,
  useLayoutEffect,
  useState,
} from 'react';
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

/** API often returns `user` as an id string; list views may populate a partial user object. */
function getBettorUserId(user: BetHistoryT['user']): string | undefined {
  if (typeof user === 'string') return user;
  return user?._id;
}

const BetDetails: FunctionComponent<BetDetailsProps> = ({ betDetails }) => {
  const { userData } = useAccount();
  const { openModal } = useModal();
  const { rotateSeedPair, seedPairLoading, activeSeedPair, getActiveSeedPair } =
    useSeedPair();
  const navigate = useNavigate();

  const [isLoadingDetails, setisLoadingDetails] = useState(false);
  const [detail, setDetail] = useState<BetHistoryT>(betDetails);
  const [fairnessLoading, setFairnessLoading] = useState(false);

  const { balances } = useWalletState();

  useEffect(() => {
    setDetail(betDetails);
  }, [betDetails]);

  useLayoutEffect(() => {
    const id = betDetails.id ?? betDetails._id;
    const legacyHasSeed =
      isPopulatedGame(betDetails.gameId) &&
      betDetails.gameId.seed != null;
    const alreadyHasFairness =
      betDetails.clientSeed != null &&
      betDetails.serverSeedHash != null &&
      betDetails.nonce != null;
    if (!id || legacyHasSeed || alreadyHasFairness) {
      setFairnessLoading(false);
    } else {
      setFairnessLoading(true);
    }
  }, [
    betDetails.id,
    betDetails._id,
    betDetails.gameId,
    betDetails.clientSeed,
    betDetails.serverSeedHash,
    betDetails.nonce,
  ]);

  useEffect(() => {
    const id = betDetails.id ?? betDetails._id;
    const legacyHasSeed =
      isPopulatedGame(betDetails.gameId) &&
      betDetails.gameId.seed != null;
    const alreadyHasFairness =
      betDetails.clientSeed != null &&
      betDetails.serverSeedHash != null &&
      betDetails.nonce != null;
    if (!id || legacyHasSeed || alreadyHasFairness) {
      return;
    }
    let cancelled = false;
    axiosInstance
      .get(`/bet-history/${id}`)
      .then(res => {
        if (!cancelled) {
          setDetail(prev => ({ ...prev, ...res.data }));
        }
      })
      .catch(() => {
        /* keep summary fields; user can retry via Verify Bet */
      })
      .finally(() => {
        if (!cancelled) {
          setFairnessLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [
    betDetails.id,
    betDetails._id,
    betDetails.gameId,
    betDetails.clientSeed,
    betDetails.serverSeedHash,
    betDetails.nonce,
  ]);

  const bettorUserId = getBettorUserId(detail.user);
  const isViewingOwnBet =
    userData?._id != null &&
    bettorUserId != null &&
    userData._id === bettorUserId;

  const legacyGame = isPopulatedGame(detail.gameId) ? detail.gameId : null;
  const seedInfoFromApi: SeedT | undefined =
    detail.clientSeed != null &&
    detail.serverSeedHash != null &&
    detail.nonce != null
      ? ({
          clientSeed: detail.clientSeed,
          serverSeedHash: detail.serverSeedHash,
          serverSeed: detail.serverSeed ?? '',
          status: (detail.seedStatus as SeedStatus) ?? SeedStatus.ACTIVE,
        } as SeedT)
      : undefined;
  const seedInfo = legacyGame?.seed
    ? (legacyGame.seed as SeedT)
    : seedInfoFromApi;
  const displayNonce = detail.nonce ?? legacyGame?.nonce;

  const legacySeedPresent =
    legacyGame != null && legacyGame.seed != null;

  useEffect(() => {
    if (!isViewingOwnBet) return;
    const hasSeedFields =
      (detail.clientSeed != null &&
        detail.serverSeedHash != null &&
        detail.nonce != null) ||
      legacySeedPresent;
    if (!hasSeedFields) return;
    void getActiveSeedPair();
  }, [
    isViewingOwnBet,
    detail.id,
    detail._id,
    detail.clientSeed,
    detail.serverSeedHash,
    detail.nonce,
    legacySeedPresent,
    getActiveSeedPair,
  ]);

  const currency =
    detail.currency ?? legacyGame?.currency ?? Currency.SOL;
  const betAmount =
    detail.betAmount ?? legacyGame?.betAmount ?? 0;
  const totalWinAmount =
    detail.totalWinAmount ?? legacyGame?.totalWinAmount ?? 0;
  const multiplierLabel =
    detail.multiplier != null && !Number.isNaN(detail.multiplier)
      ? Number(detail.multiplier).toFixed(2)
      : legacyGame?.multiplier != null
        ? Number(legacyGame.multiplier).toFixed(2)
        : betAmount > 0
          ? (totalWinAmount / betAmount).toFixed(2)
          : '—';
  const placedAt = detail.createdAt ?? legacyGame?.createdAt;

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

  const refreshBetFairnessDetails = async () => {
    const id = detail.id ?? detail._id;
    if (!id) return;
    try {
      const { data } = await axiosInstance.get(`/bet-history/${id}`);
      setDetail(prev => ({ ...prev, ...data }));
    } catch {
      /* keep existing row; user can retry */
    }
  };

  const handleRotateForVerification = async () => {
    const ok = await rotateSeedPair(true);
    if (ok) await refreshBetFairnessDetails();
  };

  const getBetDetails = () => {
    if (!isViewingOwnBet) {
      openFairnessModal(detail);
    }
    setisLoadingDetails(true);
    axiosInstance
      .get(`/bet-history/${detail.id ?? detail._id}`)
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
      isViewingOwnBet &&
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
            onClick={() => void handleRotateForVerification()}
            border={'.5px solid #ECF0F1'}
            borderRadius={'8px'}>
            Rotate Pair
          </Button>
        </>
      );
    }
    if (
      seedInfo &&
      !isViewingOwnBet &&
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
              src={originalGamesInfo[detail?.gameType].image}
              alt='game'
              w={'24px'}
              h={'24px'}
            />
            <Text>
              {originalGamesInfo[detail?.gameType].name}
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
            <Text>{(detail.user as UserI).username}</Text>
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
              onClick={() => navigate(originalGamesInfo[detail?.gameType].link)}
              py={'24px'}
              px={'42px'}
              bg={'#00DD25'}
              borderRadius={'8px'}
              fontSize={'16px'}
              fontWeight={'500'}>
              Play {originalGamesInfo[detail?.gameType].name}
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
              {fairnessLoading ? (
                <Text mt={'16px'} fontSize={'14px'} color={'#939494'}>
                  Loading seed details…
                </Text>
              ) : seedInfo ? (
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
                      value={displayNonce ?? ''}
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
                    Could not load seed details for this bet. Try Verify Bet or
                    check your connection.
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
