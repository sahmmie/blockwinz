import { Box, HStack } from '@chakra-ui/react';
import { FunctionComponent, useEffect, useState } from 'react';
import { Currency } from '@blockwinz/shared';
import { Button } from '@/components/ui/button';
import BetAmount from '@/components/BetAmount/BetAmount';
import ProfitOnWin from '@/components/ProfitOnWin/ProfitOnWin';
import type {
  CreateLobbyParams,
  MultiplayerPanelTab,
  MultiplayerSessionRow,
} from './types';
import { MpPhase } from '@/casinoGames/tictactoes/types';
import LobbyTab from './LobbyTab';
import CreateTab from './CreateTab';
import JoinCodeTab from './JoinCodeTab';
import { MultiplayerTabBar } from './MultiplayerTabBar';

const LOBBY_REFRESH_MS = 8000;

export interface MultiplayerPanelProps {
  betAmount: number;
  betAmountErrors: { betAmount?: string };
  profitOnWin: number;
  roundingDecimals: number;
  currency: string;
  betDisabled: boolean;
  onBetAmountChange: (value: number) => void;
  mpPhase: MpPhase;
  publicLobbies: MultiplayerSessionRow[];
  isLoading: boolean;
  /** True while Find match is awaiting the initial quickMatch socket response (spinner on that button only). */
  quickMatchRequestPending: boolean;
  viewerCurrency: string;
  onQuickMatch: (opts: { betAmountMustEqual: boolean }) => void;
  onCreateLobby: (params: CreateLobbyParams) => void;
  onRefreshLobbies: () => void;
  onJoinLobby: (sessionId: string, joinCode?: string) => void;
  onLeaveLobby: () => void;
  activeTab: MultiplayerPanelTab;
  onActiveTabChange: (tab: MultiplayerPanelTab) => void;
}

/**
 * Unified multiplayer controls: stake, tab bar (host / browse / join).
 * Game title lives in `GameInfo` below the board, not repeated here.
 */
const MultiplayerPanel: FunctionComponent<MultiplayerPanelProps> = ({
  betAmount,
  betAmountErrors,
  profitOnWin,
  roundingDecimals,
  currency,
  betDisabled,
  onBetAmountChange,
  mpPhase,
  publicLobbies,
  isLoading,
  quickMatchRequestPending,
  viewerCurrency,
  onQuickMatch,
  onCreateLobby,
  onRefreshLobbies,
  onJoinLobby,
  onLeaveLobby,
  activeTab,
  onActiveTabChange,
}) => {
  const tab = activeTab;
  const [exactStakeOnly, setExactStakeOnly] = useState(false);

  useEffect(() => {
    if (tab !== 'lobbies') return;
    void onRefreshLobbies();
    const id = window.setInterval(() => {
      void onRefreshLobbies();
    }, LOBBY_REFRESH_MS);
    return () => window.clearInterval(id);
  }, [tab, onRefreshLobbies]);

  return (
    <Box>
      <HStack justify='space-between' align='center' mb={2}>
        {mpPhase === MpPhase.Lobby && (
          <Button
            size='sm'
            variant='outline'
            borderColor='whiteAlpha.400'
            color='gray.300'
            flexShrink={0}
            onClick={() => onLeaveLobby()}>
            Leave lobby
          </Button>
        )}
      </HStack>
      <Box mb={4}>
        <BetAmount
          currency={currency as Currency}
          disabled={betDisabled}
          value={parseFloat(betAmount.toFixed(roundingDecimals))}
          onChange={onBetAmountChange}
          error={betAmountErrors.betAmount}
        />
        <Box mt={3}>
          <ProfitOnWin
            value={profitOnWin.toFixed(roundingDecimals)}
            currency={currency as Currency}
          />
        </Box>
      </Box>

      <MultiplayerTabBar value={tab} onChange={onActiveTabChange} />

      <Box pt={4} minH='140px'>
        {tab === 'lobbies' && (
          <LobbyTab
            lobbies={publicLobbies}
            viewerCurrency={viewerCurrency}
            viewerStake={betAmount}
            isLoading={isLoading}
            onRefresh={onRefreshLobbies}
            onJoin={(id) => onJoinLobby(id)}
          />
        )}
        {tab === 'create' && (
          <CreateTab
            betAmount={betAmount}
            currency={currency}
            disabled={betDisabled || !!betAmountErrors.betAmount}
            createLoading={isLoading}
            findMatchLoading={quickMatchRequestPending}
            exactStakeOnly={exactStakeOnly}
            onExactStakeOnlyChange={setExactStakeOnly}
            onFindMatch={() =>
              onQuickMatch({ betAmountMustEqual: exactStakeOnly })
            }
            onCreate={onCreateLobby}
          />
        )}
        {tab === 'join' && (
          <JoinCodeTab
            disabled={betDisabled}
            loading={isLoading}
            onJoin={(sessionId, code) => onJoinLobby(sessionId, code)}
          />
        )}
      </Box>
    </Box>
  );
};

export default MultiplayerPanel;
