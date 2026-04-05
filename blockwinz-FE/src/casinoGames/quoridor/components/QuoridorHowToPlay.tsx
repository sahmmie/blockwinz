import {
  Box,
  Heading,
  HStack,
  SimpleGrid,
  Text,
  VStack,
} from '@chakra-ui/react';
import {
  buildBlockMap,
  QUORIDOR_BOARD_SIZE,
  type QuoridorWall,
} from '@blockwinz/quoridor-engine';
import { FunctionComponent, useId, useMemo } from 'react';

const SIZE = QUORIDOR_BOARD_SIZE;

type PawnSpec = { x: number; y: number; variant: 'primary' | 'secondary' };

type ArrowSpec = {
  from: { x: number; y: number };
  to: { x: number; y: number };
};

function gutterForCellSize(cellPx: number): number {
  return Math.max(4, Math.min(10, Math.round(cellPx * 0.16)));
}

function cellCenter(
  x: number,
  y: number,
  cellPx: number,
  g: number,
): { cx: number; cy: number } {
  const step = cellPx + g;
  return { cx: x * step + cellPx / 2, cy: y * step + cellPx / 2 };
}

type MiniQuoridorDiagramProps = {
  cellPx?: number;
  walls: QuoridorWall[];
  pawns: PawnSpec[];
  highlightCells?: { x: number; y: number }[];
  /** Row indices (0 = top) tinted as the green pawn’s goal row (far side). */
  goalTintRowsPrimary?: number[];
  /** Row indices tinted as the purple pawn’s goal row (near top). */
  goalTintRowsSecondary?: number[];
  arrows?: ArrowSpec[];
  caption?: string;
  'aria-label': string;
};

/**
 * Read-only Quoridor grid for tutorial figures (matches live board wall/pawn styling).
 */
const MiniQuoridorDiagram: FunctionComponent<MiniQuoridorDiagramProps> = ({
  cellPx = 26,
  walls,
  pawns,
  highlightCells = [],
  goalTintRowsPrimary = [],
  goalTintRowsSecondary = [],
  arrows = [],
  caption,
  'aria-label': ariaLabel,
}) => {
  const arrowMarkerId = useId().replace(/:/g, '');
  const g = gutterForCellSize(cellPx);
  const blockMap = useMemo(() => buildBlockMap(walls), [walls]);
  const gridPx = SIZE * cellPx + (SIZE - 1) * g;

  const highlightSet = useMemo(
    () => new Set(highlightCells.map((c) => `${c.x},${c.y}`)),
    [highlightCells],
  );
  const goalPrimary = useMemo(
    () => new Set(goalTintRowsPrimary),
    [goalTintRowsPrimary],
  );
  const goalSecondary = useMemo(
    () => new Set(goalTintRowsSecondary),
    [goalTintRowsSecondary],
  );

  return (
    <VStack align='stretch' gap={2} w='100%'>
      <Box
        role='img'
        aria-label={ariaLabel}
        position='relative'
        w={`${gridPx}px`}
        maxW='100%'
        mx='auto'>
        {arrows.length > 0 ? (
          <svg
            width={gridPx}
            height={gridPx}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              pointerEvents: 'none',
              zIndex: 1,
            }}
            aria-hidden>
            <defs>
              <marker
                id={arrowMarkerId}
                markerWidth='8'
                markerHeight='8'
                refX='6'
                refY='4'
                orient='auto'>
                <path d='M0,0 L8,4 L0,8 L2,4 Z' fill='rgba(252, 211, 77, 0.95)' />
              </marker>
            </defs>
            {arrows.map((a, i) => {
              const p1 = cellCenter(a.from.x, a.from.y, cellPx, g);
              const p2 = cellCenter(a.to.x, a.to.y, cellPx, g);
              const dx = p2.cx - p1.cx;
              const dy = p2.cy - p1.cy;
              const len = Math.hypot(dx, dy) || 1;
              const shrink = Math.min(cellPx * 0.35, len * 0.2);
              const x1 = p1.cx + (dx / len) * shrink;
              const y1 = p1.cy + (dy / len) * shrink;
              const x2 = p2.cx - (dx / len) * shrink;
              const y2 = p2.cy - (dy / len) * shrink;
              return (
                <line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke='rgba(252, 211, 77, 0.95)'
                  strokeWidth={2.5}
                  markerEnd={`url(#${arrowMarkerId})`}
                />
              );
            })}
          </svg>
        ) : null}
        <SimpleGrid
          columns={SIZE}
          gap={`${g}px`}
          w={`${gridPx}px`}
          maxW='100%'
          mx='auto'>
          {Array.from({ length: SIZE * SIZE }, (_, i) => {
            const x = i % SIZE;
            const y = Math.floor(i / SIZE);
            const key = `${x},${y}`;
            const isHi = highlightSet.has(key);
            const pawn = pawns.find((p) => p.x === x && p.y === y);
            const tintP = goalPrimary.has(y);
            const tintS = goalSecondary.has(y);
            return (
              <Box
                key={key}
                w={`${cellPx}px`}
                h={`${cellPx}px`}
                bg={
                  isHi
                    ? 'green.900'
                    : tintP
                      ? 'rgba(0, 221, 37, 0.12)'
                      : tintS
                        ? 'rgba(107, 92, 230, 0.14)'
                        : 'gray.800'
                }
                borderWidth='1px'
                borderTopWidth={blockMap.up[y]?.[x] ? '4px' : '1px'}
                borderBottomWidth={blockMap.down[y]?.[x] ? '4px' : '1px'}
                borderLeftWidth={blockMap.left[y]?.[x] ? '4px' : '1px'}
                borderRightWidth={blockMap.right[y]?.[x] ? '4px' : '1px'}
                borderColor={
                  blockMap.up[y]?.[x] ||
                  blockMap.down[y]?.[x] ||
                  blockMap.left[y]?.[x] ||
                  blockMap.right[y]?.[x]
                    ? 'orange.400'
                    : 'whiteAlpha.200'
                }
                display='flex'
                alignItems='center'
                justifyContent='center'>
                {pawn ? (
                  <Box
                    w='68%'
                    h='68%'
                    borderRadius='full'
                    bg={pawn.variant === 'primary' ? '#00DD25' : '#6B5CE6'}
                    boxShadow='md'
                  />
                ) : null}
              </Box>
            );
          })}
        </SimpleGrid>
      </Box>
      {caption ? (
        <Text fontSize='xs' color='gray.400' textAlign='center' px={1}>
          {caption}
        </Text>
      ) : null}
    </VStack>
  );
};

function SectionTitle({ children }: { children: string }) {
  return (
    <Heading
      as='h2'
      fontSize='md'
      fontWeight='700'
      color='white'
      mt={4}
      mb={1}>
      {children}
    </Heading>
  );
}

/**
 * Visual “How to play” content for the Quoridor game info dialog.
 */
const QuoridorHowToPlay: FunctionComponent = () => {
  return (
    <VStack align='stretch' gap={0} pb={1}>
      <Text fontSize='sm' color='gray.300' lineHeight='tall' mb={2}>
        Classic 9×9 Quoridor: reach the far row before your opponent, or block
        their shortest paths with walls — without trapping anyone completely.
      </Text>

      <SectionTitle>Goal</SectionTitle>
      <Text fontSize='sm' color='gray.200' lineHeight='tall' mb={2}>
        Be the first to move your pawn onto any square of the row opposite your
        starting edge.         Green starts at the top; purple at the bottom. Each player tries to
        reach the opposite edge (tinted rows).
      </Text>
      <MiniQuoridorDiagram
        cellPx={24}
        walls={[]}
        pawns={[
          { x: 4, y: 0, variant: 'primary' },
          { x: 4, y: 8, variant: 'secondary' },
        ]}
        goalTintRowsPrimary={[8]}
        goalTintRowsSecondary={[0]}
        aria-label='Nine by nine board: green pawn on top row, purple on bottom row. Bottom row tinted green goal for green; top row tinted purple goal for purple.'
      />

      <SectionTitle>Move</SectionTitle>
      <Text fontSize='sm' color='gray.200' lineHeight='tall' mb={2}>
        On your turn, either move one step orthogonally into an empty square, or
        place a wall (if you have any left). The example shows a legal step
        down into the highlighted square.
      </Text>
      <MiniQuoridorDiagram
        cellPx={24}
        walls={[]}
        pawns={[{ x: 4, y: 3, variant: 'primary' }]}
        highlightCells={[{ x: 4, y: 4 }]}
        arrows={[{ from: { x: 4, y: 3 }, to: { x: 4, y: 4 } }]}
        aria-label='Green pawn moves one square down; destination square is highlighted with an arrow.'
      />

      <SectionTitle>Jump straight</SectionTitle>
      <Text fontSize='sm' color='gray.200' lineHeight='tall' mb={2}>
        If the opponent is directly in front of you and the square beyond them
        is empty, you may jump straight over them.
      </Text>
      <MiniQuoridorDiagram
        cellPx={24}
        walls={[]}
        pawns={[
          { x: 4, y: 5, variant: 'primary' },
          { x: 4, y: 4, variant: 'secondary' },
        ]}
        highlightCells={[{ x: 4, y: 3 }]}
        arrows={[{ from: { x: 4, y: 5 }, to: { x: 4, y: 3 } }]}
        aria-label='Green pawn jumps over purple pawn directly ahead to the empty square beyond.'
      />

      <SectionTitle>Jump diagonally (side by side)</SectionTitle>
      <Text fontSize='sm' color='gray.200' lineHeight='tall' mb={2}>
        When you are beside your opponent, you may jump to a diagonal square
        &quot;behind&quot; them if that square is free — for example landing
        behind them when a straight jump is blocked.
      </Text>
      <MiniQuoridorDiagram
        cellPx={24}
        walls={[
          { x: 3, y: 3, orientation: 'horizontal' },
          { x: 4, y: 3, orientation: 'horizontal' },
        ]}
        pawns={[
          { x: 3, y: 4, variant: 'primary' },
          { x: 4, y: 4, variant: 'secondary' },
        ]}
        highlightCells={[{ x: 5, y: 3 }]}
        arrows={[{ from: { x: 3, y: 4 }, to: { x: 5, y: 3 } }]}
        caption='Walls above block a straight jump north; the diagonal landing behind is legal.'
        aria-label='Green and purple pawns side by side; walls block jumping straight north; arrow shows diagonal jump behind the purple pawn.'
      />

      <SectionTitle>Walls</SectionTitle>
      <Text fontSize='sm' color='gray.200' lineHeight='tall' mb={2}>
        Each player starts with ten walls. A wall always spans two adjacent
        cells; tap a highlighted wall slot on the real board to place one.
      </Text>
      <MiniQuoridorDiagram
        cellPx={24}
        walls={[{ x: 3, y: 4, orientation: 'vertical' }]}
        pawns={[
          { x: 2, y: 4, variant: 'primary' },
          { x: 6, y: 4, variant: 'secondary' },
        ]}
        aria-label='Vertical wall segment between two columns of cells, spanning two rows.'
      />

      <SectionTitle>Path rule</SectionTitle>
      <Text fontSize='sm' color='gray.200' lineHeight='tall' mb={2}>
        You may not place a wall that leaves either player with no path at all
        to their goal row. Both pawns must always have some route to the
        opposite side.
      </Text>
      <HStack
        align='flex-start'
        gap={4}
        flexWrap='wrap'
        justify='center'
        w='100%'>
        <Box flex='1' minW='200px' maxW='280px'>
          <Text fontSize='xs' color='green.300' fontWeight='600' mb={1}>
            Allowed
          </Text>
          <MiniQuoridorDiagram
            cellPx={20}
            walls={[{ x: 3, y: 3, orientation: 'vertical' }]}
            pawns={[
              { x: 2, y: 6, variant: 'primary' },
              { x: 6, y: 2, variant: 'secondary' },
            ]}
            caption='A wall that narrows the board but still leaves routes for both players.'
            aria-label='Board with one vertical wall; both pawns still have open paths toward opposite edges.'
          />
        </Box>
        <Box flex='1' minW='200px' maxW='280px'>
          <Text fontSize='xs' color='red.300' fontWeight='600' mb={1}>
            Not allowed
          </Text>
          <Text fontSize='xs' color='gray.400' lineHeight='short' mb={2}>
            Any placement that fully disconnects a pawn from its goal row is
            rejected by the game.
          </Text>
          <Box
            borderWidth='1px'
            borderColor='whiteAlpha.200'
            borderRadius='md'
            p={3}
            bg='blackAlpha.400'
            role='img'
            aria-label='Illustration: a wall barrier with a red X meaning this full blockade would be illegal.'>
            <Text fontSize='sm' color='gray.300' textAlign='center'>
              The app blocks illegal walls — you&apos;ll only see valid slots
              highlighted when placing.
            </Text>
          </Box>
        </Box>
      </HStack>

      <SectionTitle>Multiplayer</SectionTitle>
      <Text fontSize='sm' color='gray.200' lineHeight='tall'>
        Use the sidebar to host a room, browse open lobbies, or join with a
        code. When it is not your turn, wait for your opponent; on your turn,
        legal pawn moves and wall slots are highlighted on the board, same as in
        these diagrams.
      </Text>
    </VStack>
  );
};

export default QuoridorHowToPlay;
