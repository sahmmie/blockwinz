import { Box, Text } from '@chakra-ui/react';
import { FunctionComponent, useEffect, useState } from 'react';
import { Currency } from '@blockwinz/shared';
import BetAmount from '@/components/BetAmount/BetAmount';
import ProfitOnWin from '@/components/ProfitOnWin/ProfitOnWin';
import type {
  CreateLobbyParams,
  MultiplayerPanelTab,
  MultiplayerSessionRow,
} from './types';
import { MpPhase } from '@/casinoGames/tictactoes/types';
import ActiveMultiplayerSessionCard from './ActiveMultiplayerSessionCard';
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
  /** Set when user is in a lobby or live match (not while queued). */
  multiplayerSession: MultiplayerSessionRow | null;
  userId: string | null | undefined;
  userIs: string;
  currentTurn: string;
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
  multiplayerSession,
  userId,
  userIs,
  currentTurn,
}) => {
  const tab = activeTab;
  const [exactStakeOnly, setExactStakeOnly] = useState(false);

  const showActiveSession =
    Boolean(multiplayerSession) &&
    (mpPhase === MpPhase.Lobby || mpPhase === MpPhase.Playing);
  const showQueuedOnly = mpPhase === MpPhase.Queued;

  useEffect(() => {
    if (tab !== 'lobbies') return;
    if (showActiveSession || showQueuedOnly) return;
    void onRefreshLobbies();
    const id = window.setInterval(() => {
      void onRefreshLobbies();
    }, LOBBY_REFRESH_MS);
    return () => window.clearInterval(id);
  }, [tab, onRefreshLobbies, showActiveSession, showQueuedOnly]);

  if (showActiveSession && multiplayerSession) {
    return (
      <Box>
        <ActiveMultiplayerSessionCard
          session={multiplayerSession}
          mpPhase={mpPhase}
          userId={userId}
          userMark={userIs}
          currentTurn={currentTurn}
          roundingDecimals={roundingDecimals}
          onLeaveLobby={onLeaveLobby}
        />
      </Box>
    );
  }

  if (showQueuedOnly) {
    return (
      <Box>
        <Box
          mb={4}
          borderRadius='md'
          borderWidth='1px'
          borderColor='rgba(0, 221, 37, 0.35)'
          bg='blackAlpha.450'
          px={4}
          py={3}>
          <Text fontSize='sm' fontWeight='700' color='white' mb={1}>
            Finding a match
          </Text>
          <Text fontSize='xs' color='gray.400' lineHeight='short'>
            Hang tight — we&apos;re pairing you with another player. Use the
            search dialog to cancel. Your stake below is what you queued with.
          </Text>
        </Box>
        <Box mb={4} opacity={0.85}>
          <BetAmount
            currency={currency as Currency}
            disabled
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
      </Box>
    );
  }

  return (
    <Box>
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
