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
import QuickMatchTab from './QuickMatchTab';
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
  mpPhase: string;
  matchQueued: boolean;
  publicLobbies: MultiplayerSessionRow[];
  isLoading: boolean;
  viewerCurrency: string;
  onQuickMatch: () => void;
  onCreateLobby: (params: CreateLobbyParams) => void;
  onRefreshLobbies: () => void;
  onJoinLobby: (sessionId: string, joinCode?: string) => void;
  onLeaveLobby: () => void;
}

/**
 * Unified multiplayer controls: stake, tab bar (host / browse / invite / match).
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
  matchQueued,
  publicLobbies,
  isLoading,
  viewerCurrency,
  onQuickMatch,
  onCreateLobby,
  onRefreshLobbies,
  onJoinLobby,
  onLeaveLobby,
}) => {
  const [tab, setTab] = useState<MultiplayerPanelTab>('create');

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
        {mpPhase === 'lobby' && (
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

      <MultiplayerTabBar value={tab} onChange={setTab} />

      <Box pt={4} minH='140px'>
        {tab === 'quick' && (
          <QuickMatchTab
            disabled={betDisabled || !!betAmountErrors.betAmount}
            loading={isLoading}
            matchQueued={matchQueued}
            onFindMatch={onQuickMatch}
          />
        )}
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
            loading={isLoading}
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
