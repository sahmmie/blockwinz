import { Box } from '@chakra-ui/react';
import { FunctionComponent } from 'react';
import { useTictactoeGameContext } from '../context/TictactoeGameContext';
import { DEFAULT_ROUNDING_DECIMALS } from '@/shared/constants/app.constant';
import useWalletState from '@/hooks/useWalletState';
import MultiplayerPanel from '@/casinoGames/multiplayer/MultiplayerPanel';
interface DashboardProps {}

const Dashboard: FunctionComponent<DashboardProps> = () => {
  const { state, actions } = useTictactoeGameContext();

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
  } = state;
  const { balances } = useWalletState();

  const ROUNDING_DECIMALS =
    balances.find((c) => c.currency === currency)?.decimals ||
    DEFAULT_ROUNDING_DECIMALS;

  const { handleBetAmountChange } = actions;

  const showBetButton = !isActiveGame() || hasEnded();
  const betDisabled = isLoading || !showBetButton;

  return (
    <>
      <Box
        pt={{ base: '0px', md: '16px' }}
        pl={'16px'}
        pr={'20px'}
        pb={{ base: '38px', md: '16px' }}>
        <MultiplayerPanel
          betAmount={betAmount}
          betAmountErrors={betAmountErrors}
          profitOnWin={profitOnWin}
          roundingDecimals={ROUNDING_DECIMALS}
          currency={currency}
          betDisabled={betDisabled}
          onBetAmountChange={handleBetAmountChange}
          mpPhase={mpPhase ?? 'idle'}
          matchQueued={matchQueued ?? false}
          publicLobbies={publicLobbies ?? []}
          isLoading={isLoading || isLoadingStart}
          viewerCurrency={currency}
          onQuickMatch={() => void actions.quickMatch()}
          onCreateLobby={(params) => void actions.createLobby(params)}
          onRefreshLobbies={() => void actions.refreshPublicLobbies()}
          onJoinLobby={(id, code) => void actions.joinLobbyById(id, code)}
          onLeaveLobby={() => void actions.leavePendingLobby()}
        />
      </Box>
    </>
  );
};

export default Dashboard;
