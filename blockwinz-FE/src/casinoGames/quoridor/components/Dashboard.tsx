import { Box, Text } from '@chakra-ui/react';
import {
  FunctionComponent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useQuoridorGameContext } from '../context/QuoridorGameContext';
import { DEFAULT_ROUNDING_DECIMALS } from '@/shared/constants/app.constant';
import useWalletState from '@/hooks/useWalletState';
import MultiplayerPanel from '@/casinoGames/multiplayer/MultiplayerPanel';
import { MpPhase } from '@/casinoGames/tictactoes/types';
import HostInviteModal from '@/casinoGames/multiplayer/HostInviteModal';
import FindingMatchModal from '@/casinoGames/multiplayer/FindingMatchModal';
import NoMatchFoundModal from '@/casinoGames/multiplayer/NoMatchFoundModal';
import type { MultiplayerPanelTab } from '@/casinoGames/multiplayer/types';
import { isViewerLobbyHost } from '@/casinoGames/multiplayer/isViewerLobbyHost';
import { multiplayerGamesInfo } from '@/shared/constants/multiplayerGamesInfo.constant';
import { MultiplayerGameTypeEnum } from '@blockwinz/shared';
import { toaster } from '@/components/ui/toaster';
import LobbyBrowseIcon from '@/assets/icons/waiting-room-icon.svg';

const quoridorPanelMeta =
  multiplayerGamesInfo[MultiplayerGameTypeEnum.QuoridorGame]!;

interface DashboardProps {}

const Dashboard: FunctionComponent<DashboardProps> = () => {
  const { state, actions } = useQuoridorGameContext();
  const [findingMatchOpen, setFindingMatchOpen] = useState(false);
  const [findingMatchExactStake, setFindingMatchExactStake] = useState(true);
  const [quickMatchPending, setQuickMatchPending] = useState(false);
  const [panelTab, setPanelTab] = useState<MultiplayerPanelTab>('create');
  const lastQuickMatchOptsRef = useRef({ betAmountMustEqual: false });

  const {
    betAmount,
    betAmountErrors,
    isLoading,
    profitOnWin,
    isActiveGame,
    hasEnded,
    isLoadingStart,
    currency,
    matchQueued,
    mpPhase,
    publicLobbies,
    hostInvite,
    showHostInviteModal,
    quickMatchNoMatchOpen,
    multiplayerSession,
    userId,
    userIs,
    currentTurn,
    leaveLobbyPending,
  } = state;
  const { balances } = useWalletState();

  const ROUNDING_DECIMALS =
    balances.find((c) => c.currency === currency)?.decimals ||
    DEFAULT_ROUNDING_DECIMALS;

  const {
    handleBetAmountChange,
    dismissHostInvite,
    reopenHostInviteModal,
    dismissQuickMatchNoMatch,
    refreshPublicLobbies,
    cancelQuickMatchSearch,
    forfeitMatch,
    resolveLobbyFromPublicList,
  } = actions;

  const closeFindingMatchModalOnly = useCallback(() => {
    setFindingMatchOpen(false);
    setFindingMatchExactStake(true);
  }, []);

  const handleFindingMatchCancel = useCallback(() => {
    void cancelQuickMatchSearch();
    closeFindingMatchModalOnly();
  }, [cancelQuickMatchSearch, closeFindingMatchModalOnly]);

  const handleQuickMatch = useCallback(
    (opts: { betAmountMustEqual: boolean }) => {
      if (!currency) {
        toaster.create({
          title: 'Wallet not ready',
          description: 'Select a currency, then try Find match again.',
          type: 'error',
        });
        return;
      }
      if (!betAmount || betAmount <= 0) {
        toaster.create({
          title: 'Set a stake first',
          description:
            'Enter a stake amount greater than zero above, then tap Find match.',
          type: 'error',
        });
        return;
      }
      lastQuickMatchOptsRef.current = opts;
      setFindingMatchExactStake(opts.betAmountMustEqual);
      setFindingMatchOpen(true);
      setQuickMatchPending(true);
      void actions
        .quickMatch(opts.betAmountMustEqual)
        .finally(() => setQuickMatchPending(false));
    },
    [actions, betAmount, currency],
  );

  useEffect(() => {
    if (!findingMatchOpen || quickMatchPending) return;
    if (isLoading || isLoadingStart) return;
    if (matchQueued || mpPhase === MpPhase.Queued) return;
    closeFindingMatchModalOnly();
  }, [
    findingMatchOpen,
    quickMatchPending,
    isLoading,
    isLoadingStart,
    matchQueued,
    mpPhase,
    closeFindingMatchModalOnly,
  ]);

  const handleNoMatchTryAgain = useCallback(() => {
    dismissQuickMatchNoMatch();
    handleQuickMatch(lastQuickMatchOptsRef.current);
  }, [dismissQuickMatchNoMatch, handleQuickMatch]);

  const handleNoMatchBrowseLobbies = useCallback(() => {
    dismissQuickMatchNoMatch();
    setPanelTab('lobbies');
    void refreshPublicLobbies();
  }, [dismissQuickMatchNoMatch, refreshPublicLobbies]);

  const showBetButton = !isActiveGame() || hasEnded();
  const betDisabled =
    isLoading || quickMatchPending || !showBetButton;

  const canShareRoomDetails =
    mpPhase === MpPhase.Lobby &&
    Boolean(hostInvite) &&
    isViewerLobbyHost(userId, multiplayerSession);

  const isHostInLobby =
    mpPhase === MpPhase.Lobby &&
    isViewerLobbyHost(userId, multiplayerSession);

  return (
    <>
      <HostInviteModal
        open={Boolean(showHostInviteModal)}
        onClose={() => dismissHostInvite()}
        invite={hostInvite ?? null}
      />
      <FindingMatchModal
        open={findingMatchOpen}
        canCancel={
          quickMatchPending ||
          matchQueued ||
          mpPhase === MpPhase.Queued
        }
        onCancelSearch={handleFindingMatchCancel}
        formattedStake={`${parseFloat(betAmount.toFixed(ROUNDING_DECIMALS))} ${currency.toUpperCase()}`}
        exactStakeOnly={findingMatchExactStake}
      />
      <NoMatchFoundModal
        open={Boolean(quickMatchNoMatchOpen)}
        onOpenChange={(open) => {
          if (!open) dismissQuickMatchNoMatch();
        }}
        onTryAgain={handleNoMatchTryAgain}
        onBrowseLobbies={handleNoMatchBrowseLobbies}
      />
      <Box
        pt={{ base: '0px', md: '16px' }}
        pl={'16px'}
        pr={'20px'}
        pb={{ base: '38px', md: '32px' }}>
        {isHostInLobby ? (
          <Box
            mb={3}
            borderRadius='md'
            borderWidth='1px'
            borderColor='whiteAlpha.200'
            bg='blackAlpha.400'
            px={3}
            py={2.5}>
            <Text fontSize='xs' color='gray.300' lineHeight='tall'>
              Waiting for an opponent. Use{' '}
              <Text as='span' fontWeight='700' color='gray.100'>
                Share room details
              </Text>{' '}
              below to send your link or code. The board shows standard start
              positions until both players are seated; sides are finalized when
              the match goes live.
            </Text>
          </Box>
        ) : null}
        <MultiplayerPanel
          gameTitle={quoridorPanelMeta.name}
          lobbyBrowseIconSrc={LobbyBrowseIcon}
          gameListIconSrc={quoridorPanelMeta.icon}
          betAmount={betAmount}
          betAmountErrors={betAmountErrors}
          profitOnWin={profitOnWin}
          roundingDecimals={ROUNDING_DECIMALS}
          currency={currency}
          betDisabled={betDisabled}
          onBetAmountChange={handleBetAmountChange}
          mpPhase={mpPhase ?? MpPhase.Idle}
          publicLobbies={publicLobbies ?? []}
          isLoading={isLoading || isLoadingStart}
          quickMatchRequestPending={quickMatchPending}
          viewerCurrency={currency}
          onQuickMatch={handleQuickMatch}
          onCreateLobby={(params) => void actions.createLobby(params)}
          onRefreshLobbies={() => void actions.refreshPublicLobbies()}
          onJoinLobby={async (id, code) =>
            (await actions.joinLobbyById(id, code)) === true
          }
          onLeaveLobby={() => void actions.leavePendingLobby()}
          activeTab={panelTab}
          onActiveTabChange={setPanelTab}
          multiplayerSession={multiplayerSession ?? null}
          userId={userId}
          userIs={userIs}
          turnUserId={userId}
          currentTurn={currentTurn}
          onForfeitMatch={() => void forfeitMatch()}
          resolveLobbyFromPublicList={resolveLobbyFromPublicList}
          onShareRoomDetails={
            canShareRoomDetails ? () => reopenHostInviteModal() : undefined
          }
          leaveLobbyLoading={leaveLobbyPending}
        />
      </Box>
    </>
  );
};

export default Dashboard;
