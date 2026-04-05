import {
  Box,
  Button,
  HStack,
  SimpleGrid,
  Tag,
  TagLabel,
  Text,
  VStack,
  useBreakpointValue,
} from '@chakra-ui/react';
import { FunctionComponent, useEffect, useMemo, useState } from 'react';
import {
  buildBlockMap,
  getLegalWallPlacements,
  getValidPawnMoves,
  QUORIDOR_BOARD_SIZE,
  validateQuoridorMove,
  type QuoridorMove,
  type QuoridorWall,
} from '@blockwinz/quoridor-engine';
import { toaster } from '@/components/ui/toaster';
import { MpPhase } from '@/casinoGames/tictactoes/types';
import { useQuoridorGameContext } from '../context/QuoridorGameContext';
import { quoridorInvalidMoveToastCopy } from '../quoridorInvalidMoveCopy';
import QuoridorTurnTimer from './QuoridorTurnTimer';
import { motion, useReducedMotion } from 'framer-motion';

const MotionPawn = motion.create(Box);

const PAWN_SHADOW_IDLE =
  '0 4px 6px -1px rgba(0,0,0,0.18), 0 2px 4px -2px rgba(0,0,0,0.12)';

const MAX_WALL_GRID_COORD = QUORIDOR_BOARD_SIZE - 2;

/** Pixel gap between cells — wall segments sit in this gutter. */
function gutterForCellSize(cellPx: number): number {
  return Math.max(8, Math.min(14, Math.round(cellPx * 0.16)));
}

/** Click target centered on the gutter (legal wall slot); invisible UI, no yellow fill. */
function wallGutterHitRect(
  wall: QuoridorWall,
  cellPx: number,
  g: number,
): { left: number; top: number; width: number; height: number } {
  const step = cellPx + g;
  const hit = Math.max(30, Math.min(46, g + 20));
  if (wall.orientation === 'horizontal') {
    return {
      left: wall.x * step,
      top: wall.y * step + cellPx + g / 2 - hit / 2,
      width: 2 * cellPx + g,
      height: hit,
    };
  }
  return {
    left: wall.x * step + cellPx + g / 2 - hit / 2,
    top: wall.y * step,
    width: hit,
    height: 2 * cellPx + g,
  };
}

/** Solid “fence” segment for placed walls and draft (non-interactive preview). */
function wallFenceRect(
  wall: QuoridorWall,
  cellPx: number,
  g: number,
): { left: number; top: number; width: number; height: number } {
  const step = cellPx + g;
  const t = Math.max(6, Math.min(11, Math.round(g * 0.6)));
  if (wall.orientation === 'horizontal') {
    return {
      left: wall.x * step,
      top: wall.y * step + cellPx + g / 2 - t / 2,
      width: 2 * cellPx + g,
      height: t,
    };
  }
  return {
    left: wall.x * step + cellPx + g / 2 - t / 2,
    top: wall.y * step,
    width: t,
    height: 2 * cellPx + g,
  };
}

function wallsEqual(a: QuoridorWall, b: QuoridorWall): boolean {
  return (
    a.x === b.x &&
    a.y === b.y &&
    a.orientation === b.orientation
  );
}

function flipWallOrientation(w: QuoridorWall): QuoridorWall {
  return {
    x: w.x,
    y: w.y,
    orientation: w.orientation === 'horizontal' ? 'vertical' : 'horizontal',
  };
}

function isWallInLegalList(w: QuoridorWall, legal: QuoridorWall[]): boolean {
  return legal.some((l) => wallsEqual(l, w));
}

/**
 * Placed walls and draft use the original board palette. Legal wall slots in gutters are clickable (transparent targets, subtle hover). Cell taps still draft walls.
 */
const QuoridorBoard: FunctionComponent = () => {
  const reduceMotion = useReducedMotion();
  const cellPx =
    useBreakpointValue({ base: 28, sm: 38, md: 46, lg: 56 }) ?? 36;
  const gutterPx = gutterForCellSize(cellPx);
  const { displayGame, state, actions, opponentLabel } = useQuoridorGameContext();

  const [pawnPhase, setPawnPhase] = useState<'idle' | 'selected'>('idle');
  const [pendingPawnTo, setPendingPawnTo] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [draftWall, setDraftWall] = useState<QuoridorWall | null>(null);
  const [lastWallCell, setLastWallCell] = useState<{
    cx: number;
    cy: number;
  } | null>(null);

  const game = displayGame;
  const blockMap = useMemo(
    () => (game ? buildBlockMap(game.walls) : null),
    [game],
  );

  const myTurn =
    state.mpPhase === MpPhase.Playing &&
    state.activeGameId &&
    state.quoridorGame?.currentTurn &&
    state.userId &&
    String(state.quoridorGame.currentTurn) === String(state.userId);

  const hotseatTurn =
    !state.activeGameId &&
    state.mpPhase === MpPhase.Idle &&
    game &&
    (game.currentTurnUserId === 'hotseat-south' ||
      game.currentTurnUserId === 'hotseat-north');

  const canInteract =
    (myTurn || hotseatTurn) && game && !game.winnerUserId;

  const viewerPawnUserId = useMemo(() => {
    if (!game) return null;
    const playerIds = game.players.map((p) => p.userId);
    const isHotseatGame = playerIds.every(
      (id) => id === 'hotseat-south' || id === 'hotseat-north',
    );

    if (isHotseatGame && hotseatTurn) {
      return game.currentTurnUserId;
    }

    if (state.userId && playerIds.includes(state.userId)) {
      return state.userId;
    }

    return game.currentTurnUserId;
  }, [game, hotseatTurn, state.userId]);

  const actingUserId = useMemo(() => {
    if (!game) return '';
    if (
      hotseatTurn &&
      game.players.every(
        (p) => p.userId === 'hotseat-south' || p.userId === 'hotseat-north',
      )
    ) {
      return game.currentTurnUserId;
    }
    return state.userId ?? game.currentTurnUserId ?? '';
  }, [game, hotseatTurn, state.userId]);

  const selfPos = useMemo(() => {
    if (!game || !viewerPawnUserId) return null;
    return game.players.find((p) => p.userId === viewerPawnUserId) ?? null;
  }, [game, viewerPawnUserId]);

  const oppPos = useMemo(() => {
    if (!game || !selfPos) return null;
    return game.players.find((p) => p.userId !== selfPos.userId) ?? null;
  }, [game, selfPos]);

  const legalWalls = useMemo(() => {
    if (!game || !canInteract || !actingUserId) return [];
    return getLegalWallPlacements(game, actingUserId);
  }, [game, canInteract, actingUserId]);

  const validPawnTargets = useMemo(() => {
    if (!game || !blockMap || !selfPos || !oppPos || !canInteract) return [];
    if (pawnPhase !== 'selected') return [];
    return getValidPawnMoves(selfPos.position, oppPos.position, blockMap);
  }, [game, blockMap, selfPos, oppPos, pawnPhase, canInteract]);

  const legalWallKeys = useMemo(
    () =>
      new Set(
        legalWalls.map((w) => `${w.orientation}-${w.x}-${w.y}`),
      ),
    [legalWalls],
  );

  /** In-bounds gutter slots that are not legal placements — tappable to show why. */
  const illegalGutterWalls = useMemo(() => {
    if (!game || !canInteract || !actingUserId) return [];
    if ((selfPos?.wallsRemaining ?? 0) <= 0) return [];
    const out: QuoridorWall[] = [];
    for (let x = 0; x <= MAX_WALL_GRID_COORD; x++) {
      for (let y = 0; y <= MAX_WALL_GRID_COORD; y++) {
        for (const orientation of ['horizontal', 'vertical'] as const) {
          const key = `${orientation}-${x}-${y}`;
          if (legalWallKeys.has(key)) continue;
          out.push({ x, y, orientation });
        }
      }
    }
    return out;
  }, [game, canInteract, actingUserId, legalWallKeys, selfPos?.wallsRemaining]);

  const explainWallRejection = (wall: QuoridorWall) => {
    if (!game || !actingUserId) return;
    const v = validateQuoridorMove(game, actingUserId, {
      kind: 'wall',
      wall,
    });
    if (v !== true) {
      const { title, description } = quoridorInvalidMoveToastCopy(v);
      toaster.create({ title, description, type: 'error' });
    }
  };

  const pendingMove = useMemo((): QuoridorMove | null => {
    if (draftWall) {
      return isWallInLegalList(draftWall, legalWalls)
        ? { kind: 'wall', wall: draftWall }
        : null;
    }
    if (pendingPawnTo) {
      return { kind: 'pawn', to: pendingPawnTo };
    }
    return null;
  }, [draftWall, legalWalls, pendingPawnTo]);

  const canSend = useMemo(() => {
    if (!pendingMove || !game || !actingUserId) return false;
    return validateQuoridorMove(game, actingUserId, pendingMove) === true;
  }, [pendingMove, game, actingUserId]);

  const resetDrafts = () => {
    setPawnPhase('idle');
    setPendingPawnTo(null);
    setDraftWall(null);
    setLastWallCell(null);
  };

  const handleCancel = () => {
    resetDrafts();
  };

  const handleSendMove = () => {
    if (!pendingMove || !canSend) return;
    actions.submitQuoridorMoveWithRules(pendingMove);
    resetDrafts();
  };

  useEffect(() => {
    if (!canInteract) {
      setPawnPhase('idle');
      setPendingPawnTo(null);
      setDraftWall(null);
      setLastWallCell(null);
    }
  }, [canInteract]);

  const hasSomethingToCancel =
    pawnPhase === 'selected' ||
    pendingPawnTo !== null ||
    draftWall !== null;

  const handleGutterWallClick = (w: QuoridorWall) => {
    if (!canInteract || (selfPos?.wallsRemaining ?? 0) <= 0) return;
    setPawnPhase('idle');
    setPendingPawnTo(null);
    setLastWallCell(null);
    if (
      draftWall &&
      draftWall.x === w.x &&
      draftWall.y === w.y &&
      wallsEqual(draftWall, w)
    ) {
      const flipped = flipWallOrientation(draftWall);
      if (isWallInLegalList(flipped, legalWalls)) {
        setDraftWall(flipped);
      } else {
        explainWallRejection(flipped);
      }
      return;
    }
    if (draftWall && draftWall.x === w.x && draftWall.y === w.y) {
      if (isWallInLegalList(w, legalWalls)) {
        setDraftWall(w);
      } else {
        explainWallRejection(w);
      }
      return;
    }
    setDraftWall(w);
  };

  const applyWallCellDraft = (cx: number, cy: number) => {
    const wx = Math.min(Math.max(cx, 0), 7);
    const wy = Math.min(Math.max(cy, 0), 7);
    const h: QuoridorWall = { x: wx, y: wy, orientation: 'horizontal' };
    const v: QuoridorWall = { x: wx, y: wy, orientation: 'vertical' };

    if (
      lastWallCell &&
      lastWallCell.cx === cx &&
      lastWallCell.cy === cy &&
      draftWall &&
      draftWall.x === wx &&
      draftWall.y === wy
    ) {
      const flipped = flipWallOrientation(draftWall);
      if (isWallInLegalList(flipped, legalWalls)) {
        setDraftWall(flipped);
      } else {
        explainWallRejection(flipped);
      }
      return;
    }

    setLastWallCell({ cx, cy });
    if (isWallInLegalList(h, legalWalls)) {
      setDraftWall(h);
    } else if (isWallInLegalList(v, legalWalls)) {
      setDraftWall(v);
    } else if (game && actingUserId) {
      const vh = validateQuoridorMove(game, actingUserId, {
        kind: 'wall',
        wall: h,
      });
      const vv = validateQuoridorMove(game, actingUserId, {
        kind: 'wall',
        wall: v,
      });
      const reason =
        vh !== true ? vh : vv !== true ? vv : 'Illegal wall placement';
      const { title, description } = quoridorInvalidMoveToastCopy(reason);
      toaster.create({ title, description, type: 'error' });
    }
  };

  const handleCellClick = (
    x: number,
    y: number,
    pawnHere: boolean,
    isSelf: boolean,
  ) => {
    if (!canInteract) return;

    if (isSelf && pawnHere) {
      setDraftWall(null);
      setLastWallCell(null);
      setPawnPhase('selected');
      setPendingPawnTo(null);
      return;
    }

    if (pawnPhase === 'selected') {
      const isTarget = validPawnTargets.some((t) => t.x === x && t.y === y);
      if (isTarget) {
        setPendingPawnTo({ x, y });
        setDraftWall(null);
        setLastWallCell(null);
        return;
      }
    }

    if (pawnHere && !isSelf) {
      return;
    }

    if ((selfPos?.wallsRemaining ?? 0) > 0) {
      setPawnPhase('idle');
      setPendingPawnTo(null);
      applyWallCellDraft(x, y);
    }
  };

  if (!game || !blockMap) {
    return (
      <Box px={4} py={8} textAlign='center' w='100%'>
        <Text color='gray.400' fontSize='sm'>
          {state.mpPhase === MpPhase.Lobby
            ? 'Waiting for the match to start…'
            : 'Loading board…'}
        </Text>
      </Box>
    );
  }

  const size = QUORIDOR_BOARD_SIZE;
  const gridPx = size * cellPx + (size - 1) * gutterPx;

  const draftWallLegal =
    draftWall && isWallInLegalList(draftWall, legalWalls);

  const draftFence = draftWall ? wallFenceRect(draftWall, cellPx, gutterPx) : null;

  const showWallStock = (selfPos?.wallsRemaining ?? 0) > 0;

  const showActionBar =
    canInteract && (hasSomethingToCancel || canSend);

  const showToolbarRow = showWallStock || showActionBar;

  const isHotseatGame =
    !!game &&
    game.players.every(
      (p) => p.userId === 'hotseat-south' || p.userId === 'hotseat-north',
    );

  const howToPlayBody =
    'Tap your pawn, then a highlighted square, then Send move when it appears. ' +
    'For a wall, tap a gap between cells (you can hover for feedback) or tap a square; ' +
    'tap again on the same square to flip horizontal/vertical when the rules allow. ' +
    'Tapping a gap that is not allowed explains why. Cancel and Send only show when ' +
    'there is something to clear or submit.';

  return (
    <VStack
      align='center'
      gap={4}
      w='100%'
      maxW='100%'
      mx='auto'
      px={{ base: 0, sm: 1 }}>
      <QuoridorTurnTimer
        turnDeadlineAt={state.turnDeadlineAt}
        mpPhase={state.mpPhase ?? MpPhase.Idle}
        show={Boolean(state.activeGameId && state.mpPhase === MpPhase.Playing)}
      />
      {showToolbarRow ? (
        <HStack
          w='100%'
          maxW='100%'
          justify='center'
          align='center'
          flexWrap='wrap'
          gap={{ base: 3, sm: 4, md: 5 }}
          rowGap={3}>
          {showWallStock ? (
            <Tag.Root
              borderRadius='lg'
              borderWidth='1px'
              borderColor='rgba(252, 211, 77, 0.4)'
              bg='rgba(252, 211, 77, 0.12)'
              px={3}
              py={2}
              minW='5.5rem'
              flexShrink={0}>
              <VStack gap={1} align='center'>
                <TagLabel
                  fontSize='10px'
                  fontWeight='semibold'
                  color='gray.400'
                  textTransform='uppercase'
                  letterSpacing='0.08em'
                  lineHeight='1'>
                  Walls left
                </TagLabel>
                <TagLabel
                  fontSize='xl'
                  fontWeight='bold'
                  color='#fde68a'
                  fontVariantNumeric='tabular-nums'
                  lineHeight='1.1'>
                  {selfPos!.wallsRemaining}
                </TagLabel>
              </VStack>
            </Tag.Root>
          ) : null}
          {showActionBar ? (
            <>
              {hasSomethingToCancel ? (
                <Button
                  size='sm'
                  variant='outline'
                  colorPalette='gray'
                  minW='6.5rem'
                  flexShrink={0}
                  onClick={handleCancel}>
                  Cancel
                </Button>
              ) : null}
              {canSend ? (
                <Button
                  size='sm'
                  colorPalette='green'
                  minW='6.5rem'
                  flexShrink={0}
                  onClick={handleSendMove}>
                  Send move
                </Button>
              ) : null}
            </>
          ) : null}
        </HStack>
      ) : null}

      {legalWalls.length === 0 &&
      canInteract &&
      (selfPos?.wallsRemaining ?? 0) > 0 ? (
        <Text fontSize='xs' color='orange.300' textAlign='center' px={2}>
          No legal wall placements from this position.
        </Text>
      ) : null}

      <Box
        w='100%'
        maxW='100%'
        overflowX='auto'
        overflowY='visible'
        display='flex'
        justifyContent='center'
        style={{ WebkitOverflowScrolling: 'touch' }}>
        <Box position='relative' w={`${gridPx}px`} flexShrink={0} mx='auto'>
        {game.walls.map((w, i) => {
          const r = wallFenceRect(w, cellPx, gutterPx);
          return (
            <Box
              key={`fence-${w.orientation}-${w.x}-${w.y}-${i}`}
              position='absolute'
              left={`${Math.round(r.left)}px`}
              top={`${Math.round(r.top)}px`}
              w={`${Math.round(r.width)}px`}
              h={`${Math.round(r.height)}px`}
              zIndex={1}
              pointerEvents='auto'
              borderRadius='sm'
              bg='#78350f'
              borderWidth='1px'
              borderColor='#fcd34d'
              boxShadow='inset 0 1px 0 rgba(255,255,255,0.2), 0 0 0 1px rgba(0,0,0,0.35)'
              cursor='default'
              transition='filter 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease'
              _hover={{
                filter: 'brightness(1.2)',
                boxShadow:
                  'inset 0 1px 0 rgba(255,255,255,0.28), 0 0 0 1px rgba(0,0,0,0.35), 0 0 14px rgba(252, 211, 77, 0.55)',
                borderColor: '#fde68a',
              }}
            />
          );
        })}

        {draftFence ? (
          <Box
            position='absolute'
            left={`${Math.round(draftFence.left)}px`}
            top={`${Math.round(draftFence.top)}px`}
            w={`${Math.round(draftFence.width)}px`}
            h={`${Math.round(draftFence.height)}px`}
            zIndex={3}
            pointerEvents='auto'
            borderRadius='sm'
            cursor='pointer'
            transition='filter 0.15s ease, box-shadow 0.15s ease'
            bg={
              draftWallLegal
                ? 'rgba(52, 211, 153, 0.55)'
                : 'rgba(248, 113, 113, 0.5)'
            }
            borderWidth='2px'
            borderColor={draftWallLegal ? 'green.300' : 'red.400'}
            _hover={{
              filter: 'brightness(1.12)',
              boxShadow: draftWallLegal
                ? '0 0 12px rgba(52, 211, 153, 0.55)'
                : '0 0 12px rgba(248, 113, 113, 0.45)',
            }}
          />
        ) : null}

        <SimpleGrid
          position='relative'
          zIndex={2}
          columns={size}
          gap={`${gutterPx}px`}
          w={`${gridPx}px`}
          pointerEvents='none'>
          {Array.from({ length: size * size }, (_, i) => {
            const x = i % size;
            const y = Math.floor(i / size);
            const isTarget =
              pawnPhase === 'selected' &&
              validPawnTargets.some((t) => t.x === x && t.y === y);
            const isPendingDest =
              pendingPawnTo && pendingPawnTo.x === x && pendingPawnTo.y === y;
            const piece = game.players.find(
              (p) => p.position.x === x && p.position.y === y,
            );
            const pawnHere = Boolean(piece);
            const isSelf = Boolean(
              piece &&
                viewerPawnUserId &&
                piece.userId === viewerPawnUserId,
            );
            const isTurnPawn =
              Boolean(piece) &&
              !game.winnerUserId &&
              String(piece!.userId) === String(game.currentTurnUserId);
            const turnGlowLo = isSelf
              ? '0 2px 8px rgba(0,0,0,0.28), 0 0 0 rgba(0,221,37,0)'
              : '0 2px 8px rgba(0,0,0,0.28), 0 0 0 rgba(107,92,230,0)';
            const turnGlowHi = isSelf
              ? '0 3px 10px rgba(0,0,0,0.2), 0 0 14px rgba(0,221,37,0.38)'
              : '0 3px 10px rgba(0,0,0,0.2), 0 0 14px rgba(107,92,230,0.42)';
            return (
              <Box
                key={`${x}-${y}`}
                w={`${cellPx}px`}
                h={`${cellPx}px`}
                pointerEvents='auto'
                bg={
                  isPendingDest
                    ? 'yellow.900'
                    : isTarget
                      ? 'green.900'
                      : 'gray.800'
                }
                outline={isPendingDest ? '2px solid' : undefined}
                outlineColor={isPendingDest ? 'yellow.400' : undefined}
                outlineOffset={isPendingDest ? '-2px' : undefined}
                borderWidth='1px'
                borderColor='whiteAlpha.200'
                display='flex'
                alignItems='center'
                justifyContent='center'
                cursor={
                  canInteract &&
                  (isSelf ||
                    (pawnPhase === 'selected' && isTarget) ||
                    (!isSelf && (selfPos?.wallsRemaining ?? 0) > 0))
                    ? 'pointer'
                    : 'default'
                }
                onClick={() => handleCellClick(x, y, pawnHere, Boolean(isSelf))}
                _hover={
                  canInteract &&
                  (isSelf ||
                    (pawnPhase === 'selected' && isTarget) ||
                    (!isSelf && (selfPos?.wallsRemaining ?? 0) > 0))
                    ? {
                        bg: isPendingDest
                          ? 'yellow.800'
                          : isTarget
                            ? 'green.800'
                            : 'gray.700',
                      }
                    : undefined
                }>
                {pawnHere ? (
                  <MotionPawn
                    role={isSelf ? 'button' : undefined}
                    aria-pressed={
                      isSelf ? pawnPhase === 'selected' : undefined
                    }
                    aria-label={
                      isSelf
                        ? pawnPhase === 'selected'
                          ? 'Your pawn, selected'
                          : 'Your pawn, tap to show moves'
                        : undefined
                    }
                    w='70%'
                    h='70%'
                    borderRadius='full'
                    bg={isSelf ? '#00DD25' : '#6B5CE6'}
                    initial={false}
                    animate={
                      isTurnPawn
                        ? reduceMotion
                          ? {
                              y: 0,
                              scale: 1,
                              boxShadow: turnGlowHi,
                            }
                          : {
                              y: [0, -2.5, 0],
                              scale: [1, 1.018, 1],
                              boxShadow: [
                                turnGlowLo,
                                turnGlowHi,
                                turnGlowLo,
                              ],
                            }
                        : {
                            y: 0,
                            scale: 1,
                            boxShadow: PAWN_SHADOW_IDLE,
                          }
                    }
                    transition={
                      isTurnPawn && !reduceMotion
                        ? {
                            duration: 2.25,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          }
                        : { duration: 0.25 }
                    }
                    onClick={(e) => {
                      if (!isSelf || !canInteract) return;
                      e.stopPropagation();
                      setDraftWall(null);
                      setLastWallCell(null);
                      setPawnPhase('selected');
                      setPendingPawnTo(null);
                    }}
                  />
                ) : null}
              </Box>
            );
          })}
        </SimpleGrid>

        {canInteract &&
        pawnPhase !== 'selected' &&
        (selfPos?.wallsRemaining ?? 0) > 0
          ? illegalGutterWalls.map((w, i) => {
              const r = wallGutterHitRect(w, cellPx, gutterPx);
              return (
                <Box
                  key={`gutter-miss-${w.orientation}-${w.x}-${w.y}-${i}`}
                  position='absolute'
                  left={`${Math.round(r.left)}px`}
                  top={`${Math.round(r.top)}px`}
                  w={`${Math.round(r.width)}px`}
                  h={`${Math.round(r.height)}px`}
                  zIndex={4}
                  borderRadius='sm'
                  cursor='pointer'
                  bg='transparent'
                  transition='background 0.15s ease, box-shadow 0.15s ease, outline 0.15s ease'
                  _hover={{
                    bg: 'rgba(148, 163, 184, 0.22)',
                    boxShadow: '0 0 10px rgba(148, 163, 184, 0.35)',
                    outline: '1px solid',
                    outlineColor: 'rgba(203, 213, 225, 0.55)',
                    outlineOffset: '0px',
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    explainWallRejection(w);
                  }}
                  aria-label={`Wall slot not available: ${w.orientation} at ${w.x}, ${w.y}. Tap for reason.`}
                />
              );
            })
          : null}
        {canInteract &&
        pawnPhase !== 'selected' &&
        (selfPos?.wallsRemaining ?? 0) > 0 &&
        legalWalls.length > 0
          ? legalWalls.map((w, i) => {
              const r = wallGutterHitRect(w, cellPx, gutterPx);
              const isDraft = draftWall && wallsEqual(draftWall, w);
              return (
                <Box
                  key={`gutter-hit-${w.orientation}-${w.x}-${w.y}-${i}`}
                  position='absolute'
                  left={`${Math.round(r.left)}px`}
                  top={`${Math.round(r.top)}px`}
                  w={`${Math.round(r.width)}px`}
                  h={`${Math.round(r.height)}px`}
                  zIndex={5}
                  borderRadius='sm'
                  cursor='pointer'
                  bg='transparent'
                  transition='background 0.15s ease, box-shadow 0.15s ease, outline 0.15s ease'
                  _hover={{
                    bg: 'rgba(252, 211, 77, 0.28)',
                    boxShadow: '0 0 14px rgba(252, 211, 77, 0.45)',
                    outline: '2px solid',
                    outlineColor: 'rgba(253, 224, 71, 0.85)',
                    outlineOffset: '0px',
                  }}
                  outline={isDraft ? '1px solid' : undefined}
                  outlineColor={isDraft ? 'whiteAlpha.700' : undefined}
                  outlineOffset='0px'
                  onClick={(e) => {
                    e.stopPropagation();
                    handleGutterWallClick(w);
                  }}
                  aria-label={`Wall slot ${w.orientation} at ${w.x},${w.y}`}
                />
              );
            })
          : null}
        </Box>
      </Box>

      {hotseatTurn && !game.winnerUserId ? null : (
        <VStack gap={1.5} align='center' px={2} maxW='md' mx='auto'>
          {state.mpPhase === MpPhase.Lobby ? (
            <Text fontSize='xs' color='gray.500' textAlign='center'>
              Your pawn is the bright marker; the other marks the open seat (preview
              until someone joins).
            </Text>
          ) : game.winnerUserId ? (
            <>
              <Text
                fontSize='sm'
                fontWeight='semibold'
                color='gray.200'
                textAlign='center'>
                {isHotseatGame ? (
                  game.winnerUserId === 'hotseat-south' ? (
                    <>Bottom player won this game.</>
                  ) : (
                    <>Top player won this game.</>
                  )
                ) : state.userId &&
                  String(game.winnerUserId) === String(state.userId) ? (
                  <>You won.</>
                ) : (
                  <>{opponentLabel} won.</>
                )}
              </Text>
              <Text fontSize='xs' color='gray.500' textAlign='center'>
                Start another match from the panel when you are ready.
              </Text>
            </>
          ) : state.mpPhase === MpPhase.Playing && state.activeGameId ? (
            <>
              <Text
                fontSize='sm'
                fontWeight='semibold'
                color='gray.200'
                textAlign='center'>
                {myTurn ? (
                  <>Your turn — move your pawn or place a wall.</>
                ) : (
                  <>Waiting for {opponentLabel}&apos;s turn.</>
                )}
              </Text>
              {myTurn ? (
                <Text fontSize='xs' color='gray.500' textAlign='center'>
                  {howToPlayBody}
                </Text>
              ) : (
                <Text fontSize='xs' color='gray.500' textAlign='center'>
                  The board updates when they submit their move.
                </Text>
              )}
            </>
          ) : (
            <Text fontSize='xs' color='gray.500' textAlign='center'>
              {howToPlayBody}
            </Text>
          )}
        </VStack>
      )}
    </VStack>
  );
};

export default QuoridorBoard;
