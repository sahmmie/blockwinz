import { Box, Text } from '@chakra-ui/react';
import { FunctionComponent, useCallback, useEffect, useState } from 'react';
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
import JoinLobbyConfirmModal, {
  type JoinLobbyConfirmPayload,
} from './JoinLobbyConfirmModal';

const LOBBY_REFRESH_MS = 8000;

export interface MultiplayerPanelProps {
  /** Browse list + join confirm (e.g. Quoridor, Tic Tac Toe). */
  gameTitle: string;
  /** Empty “open tables” state — rooms / lobby list (not the game icon). */
  lobbyBrowseIconSrc: string;
  /** Small badge on each browse row for this title. */
  gameListIconSrc: string;
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
  /** Return true when the join handshake succeeded (used to close the confirm modal). */
  onJoinLobby: (
    sessionId: string,
    joinCode?: string,
  ) => boolean | Promise<boolean>;
  onLeaveLobby: () => void;
  activeTab: MultiplayerPanelTab;
  onActiveTabChange: (tab: MultiplayerPanelTab) => void;
  /** Set when user is in a lobby or live match (not while queued). */
  multiplayerSession: MultiplayerSessionRow | null;
  userId: string | null | undefined;
  userIs: string;
  /** When the server sends user ids as `currentTurn` (e.g. Quoridor), pass the viewer id here. */
  turnUserId?: string | null;
  currentTurn: string;
  /** Live tic-tac-toe (etc.): forfeit control in the active session card. */
  onForfeitMatch?: () => void;
  /** Resolve session row from public list (join tab + confirm stake). */
  resolveLobbyFromPublicList: (
    sessionId: string,
  ) => Promise<MultiplayerSessionRow | null>;
  /** Host waiting in lobby: reopen “Your game is ready” (link / code / QR). */
  onShareRoomDetails?: () => void;
  leaveLobbyLoading?: boolean;
}

/**
 * Unified multiplayer controls: stake, tab bar (host / browse / join).
 * Game title lives in `GameInfo` below the board, not repeated here.
 */
const MultiplayerPanel: FunctionComponent<MultiplayerPanelProps> = ({
  gameTitle,
  lobbyBrowseIconSrc,
  gameListIconSrc,
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
  turnUserId,
  currentTurn,
  onForfeitMatch,
  resolveLobbyFromPublicList,
  onShareRoomDetails,
  leaveLobbyLoading,
}) => {
  const tab = activeTab;
  const [exactStakeOnly, setExactStakeOnly] = useState(false);
  const [joinConfirm, setJoinConfirm] = useState<JoinLobbyConfirmPayload | null>(
    null,
  );
  const [privateJoinStake, setPrivateJoinStake] = useState<{
    amount: number;
    currency: string;
  } | null>(null);
  const [privateJoinStakeLoading, setPrivateJoinStakeLoading] = useState(false);

  const showActiveSession =
    Boolean(multiplayerSession) &&
    (mpPhase === MpPhase.Lobby || mpPhase === MpPhase.Playing);
  const showQueuedOnly = mpPhase === MpPhase.Queued;

  const closeJoinModal = useCallback(() => setJoinConfirm(null), []);

  const privateSessionId =
    joinConfirm?.kind === 'private' ? joinConfirm.sessionId : null;

  useEffect(() => {
    if (!privateSessionId || !resolveLobbyFromPublicList) {
      setPrivateJoinStake(null);
      setPrivateJoinStakeLoading(false);
      return;
    }
    let cancelled = false;
    setPrivateJoinStake(null);
    setPrivateJoinStakeLoading(true);
    void (async () => {
      try {
        const row = await resolveLobbyFromPublicList(privateSessionId);
        if (cancelled) return;
        if (row) {
          setPrivateJoinStake({
            amount: Number(row.betAmount),
            currency: row.currency,
          });
        } else {
          setPrivateJoinStake(null);
        }
      } finally {
        if (!cancelled) {
          setPrivateJoinStakeLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [privateSessionId, resolveLobbyFromPublicList]);

  const handleConfirmJoin = useCallback(async () => {
    if (!joinConfirm) return;
    const sessionId =
      joinConfirm.kind === 'public'
        ? joinConfirm.lobby._id
        : joinConfirm.sessionId;
    const joinCode =
      joinConfirm.kind === 'public'
        ? undefined
        : joinConfirm.kind === 'private'
          ? joinConfirm.joinCode?.trim() || undefined
          : joinConfirm.joinCode?.trim() || undefined;
    const ok = await onJoinLobby(sessionId, joinCode);
    if (ok) {
      closeJoinModal();
    }
  }, [joinConfirm, onJoinLobby, closeJoinModal]);

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
          turnUserId={turnUserId}
          currentTurn={currentTurn}
          roundingDecimals={roundingDecimals}
          onLeaveLobby={onLeaveLobby}
          onForfeitMatch={onForfeitMatch}
          onShareRoomDetails={onShareRoomDetails}
          leaveLobbyLoading={leaveLobbyLoading}
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
      <JoinLobbyConfirmModal
        open={Boolean(joinConfirm)}
        onClose={closeJoinModal}
        payload={joinConfirm}
        gameTitle={gameTitle}
        viewerCurrency={viewerCurrency}
        viewerStake={betAmount}
        roundingDecimals={roundingDecimals}
        isSubmitting={isLoading}
        onConfirmJoin={handleConfirmJoin}
        resolvedPrivateStake={privateJoinStake}
        privateStakeLoading={privateJoinStakeLoading}
      />
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
            gameTitle={gameTitle}
            lobbyBrowseIconSrc={lobbyBrowseIconSrc}
            gameListIconSrc={gameListIconSrc}
            lobbies={publicLobbies}
            viewerCurrency={viewerCurrency}
            viewerStake={betAmount}
            isLoading={isLoading}
            onRefresh={onRefreshLobbies}
            onJoin={(lobby) =>
              setJoinConfirm({ kind: 'public', lobby })
            }
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
            resolveLobbyFromPublicList={resolveLobbyFromPublicList}
            onRequestJoin={(sessionId, code, hideJoinCodeInConfirm) =>
              setJoinConfirm({
                kind: 'private',
                sessionId,
                joinCode: code,
                hideJoinCodeInConfirm,
              })
            }
          />
        )}
      </Box>
    </Box>
  );
};

export default MultiplayerPanel;
