import { Box } from '@chakra-ui/react';
import {
  FunctionComponent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useTictactoeGameContext } from '../context/TictactoeGameContext';
import { DEFAULT_ROUNDING_DECIMALS } from '@/shared/constants/app.constant';
import useWalletState from '@/hooks/useWalletState';
import MultiplayerPanel from '@/casinoGames/multiplayer/MultiplayerPanel';
import { MpPhase } from '../types';
import HostInviteModal from '@/casinoGames/multiplayer/HostInviteModal';
import FindingMatchModal from '@/casinoGames/multiplayer/FindingMatchModal';
import NoMatchFoundModal from '@/casinoGames/multiplayer/NoMatchFoundModal';
import type { MultiplayerPanelTab } from '@/casinoGames/multiplayer/types';
import { toaster } from '@/components/ui/toaster';

interface DashboardProps {}

const Dashboard: FunctionComponent<DashboardProps> = () => {
  const { state, actions } = useTictactoeGameContext();
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
    quickMatchNoMatchOpen,
  } = state;
  const { balances } = useWalletState();

  const ROUNDING_DECIMALS =
    balances.find((c) => c.currency === currency)?.decimals ||
    DEFAULT_ROUNDING_DECIMALS;

  const {
    handleBetAmountChange,
    dismissHostInvite,
    dismissQuickMatchNoMatch,
    refreshPublicLobbies,
    cancelQuickMatchSearch,
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

  return (
    <>
      <HostInviteModal
        open={Boolean(hostInvite)}
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
        <MultiplayerPanel
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
          onJoinLobby={(id, code) => void actions.joinLobbyById(id, code)}
          onLeaveLobby={() => void actions.leavePendingLobby()}
          activeTab={panelTab}
          onActiveTabChange={setPanelTab}
        />
      </Box>
    </>
  );
};

export default Dashboard;
