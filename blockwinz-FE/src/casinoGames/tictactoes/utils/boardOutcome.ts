/**
 * Mirrors server `tictactoe-multiplayer.plugin` win/tie checks for instant local outcome UI.
 */
export function lineWinner(board: string[][]): 'X' | 'O' | null {
  const lines: string[][] = [
    ...board,
    [board[0]?.[0], board[1]?.[0], board[2]?.[0]],
    [board[0]?.[1], board[1]?.[1], board[2]?.[1]],
    [board[0]?.[2], board[1]?.[2], board[2]?.[2]],
    [board[0]?.[0], board[1]?.[1], board[2]?.[2]],
    [board[0]?.[2], board[1]?.[1], board[2]?.[0]],
  ];
  for (const line of lines) {
    const [a, b, c] = line;
    if (a && a === b && b === c && (a === 'X' || a === 'O')) {
      return a;
    }
  }
  return null;
}

export function boardFull(board: string[][]): boolean {
  return board.every((row) => row.every((c) => c !== ''));
}

export function userIdForSymbol(
  players: Array<{ userId: string; userIs: string }>,
  sym: 'X' | 'O',
): string | null {
  const p = players.find((x) => x.userIs === sym);
  return p ? String(p.userId) : null;
}
