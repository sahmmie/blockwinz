import BetAmount from '@/components/BetAmount/BetAmount';
import ProfitOnWin from '@/components/ProfitOnWin/ProfitOnWin';
import { Box, Button, Text, VStack } from '@chakra-ui/react';
import { FunctionComponent } from 'react';
import { useTictactoeGameContext } from '../context/TictactoeGameContext';
import { DEFAULT_ROUNDING_DECIMALS } from '@/shared/constants/app.constant';
import useWalletState from '@/hooks/useWalletState';
import BetButton from '@/components/BetButton/BetButton';

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
    isAnimating,
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

  const { handleOnBet, handleBetAmountChange } = actions;

  const showBetButton = !isActiveGame() || hasEnded();

  const renderBetButton = () => {
    return (
      showBetButton && (
        <BetButton
          disabled={isLoading || !!betAmountErrors.betAmount}
          loading={isLoading || isAnimating || isLoadingStart}
          onClick={() => handleOnBet()}
        />
      )
    );
  };

  return (
    <>
      <Box pt={{ base: '0px', md: '26px' }} pl={'16px'} pr={'20px'}>
        {matchQueued && (
          <Text fontSize='sm' color='gray.400' mb={2}>
            Finding an opponent…
          </Text>
        )}
        {mpPhase === 'lobby' && (
          <Button
            size='sm'
            variant='outline'
            mb={3}
            onClick={() => actions.leavePendingLobby()}>
            Leave lobby
          </Button>
        )}
        <VStack align='stretch' gap={2} mb={4}>
          <Button
            size='sm'
            variant='surface'
            onClick={() => void actions.hostPublicLobby()}>
            Host public lobby
          </Button>
          <Button
            size='sm'
            variant='ghost'
            onClick={() => void actions.refreshPublicLobbies()}>
            Refresh public lobbies
          </Button>
          {publicLobbies?.map((lobby) => (
            <Button
              key={lobby._id}
              size='xs'
              variant='outline'
              onClick={() => void actions.joinLobbyById(lobby._id)}>
              Join — {lobby.betAmount} {lobby.currency} ({lobby.players?.length ?? 0}/
              2)
            </Button>
          ))}
        </VStack>
        <Box mt={'26px'} mb={'24px'} display={{ base: 'block', md: 'none' }}>
          {renderBetButton()}
        </Box>
        <Box>
          <BetAmount
            currency={currency}
            disabled={isLoading || !showBetButton}
            value={parseFloat(betAmount.toFixed(ROUNDING_DECIMALS))}
            onChange={(e) => handleBetAmountChange(e)}
            error={betAmountErrors.betAmount}
          />
        </Box>
        <Box mt={'24px'}>
          <ProfitOnWin
            value={profitOnWin.toFixed(ROUNDING_DECIMALS)}
            currency={currency}
          />
        </Box>

        <Box
          mt={'38px'}
          mb={{ base: '38px', md: '0px' }}
          display={{ base: 'none', md: 'block' }}>
          {renderBetButton()}
        </Box>
      </Box>
    </>
  );
};

export default Dashboard;
