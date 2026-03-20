import { TicTacToeMoveResponseDto } from '../dtos/tictactoe.dto';
import { TicTacToeMultiplier, TicTacToeStatus } from '../enums/tictactoe.enums';

const checkWinner = (board: string[][]): string | null => {
  // Check rows, columns, and diagonals for a winner
  for (let row = 0; row < 3; row++) {
    if (
      board[row][0] &&
      board[row][0] === board[row][1] &&
      board[row][1] === board[row][2]
    ) {
      return board[row][0];
    }
    if (
      board[0][row] &&
      board[0][row] === board[1][row] &&
      board[1][row] === board[2][row]
    ) {
      return board[0][row];
    }
  }
  if (
    board[0][0] &&
    board[0][0] === board[1][1] &&
    board[1][1] === board[2][2]
  ) {
    return board[0][0];
  }
  if (
    board[0][2] &&
    board[0][2] === board[1][1] &&
    board[1][1] === board[2][0]
  ) {
    return board[0][2];
  }

  // Check for a tie
  if (board.flat().every((cell) => cell !== '')) {
    return TicTacToeStatus.TIE;
  }

  return null;
};

const minimax = (
  board: string[][],
  depth: number,
  isMaximizing: boolean,
  aiIs: string,
  userIs: string,
  maxDepth: number,
): number => {
  const result = checkWinner(board);
  if (result !== null) {
    if (result === aiIs) {
      return 10 - depth; // Prefer faster wins
    } else if (result === userIs) {
      return depth - 10; // Prefer slower losses
    } else {
      return 0; // Tie
    }
  }

  if (depth >= maxDepth) {
    return 0; // Neutral score for incomplete games
  }

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let row = 0; row < 3; row++) {
      for (let column = 0; column < 3; column++) {
        if (board[row][column] === '') {
          const clonedBoard = cloneBoard(board);
          clonedBoard[row][column] = aiIs;
          const score = minimax(
            clonedBoard,
            depth + 1,
            false,
            aiIs,
            userIs,
            maxDepth,
          );
          bestScore = Math.max(score, bestScore);
        }
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let row = 0; row < 3; row++) {
      for (let column = 0; column < 3; column++) {
        if (board[row][column] === '') {
          const clonedBoard = cloneBoard(board);
          clonedBoard[row][column] = userIs;
          const score = minimax(
            clonedBoard,
            depth + 1,
            true,
            aiIs,
            userIs,
            maxDepth,
          );
          bestScore = Math.min(score, bestScore);
        }
      }
    }
    return bestScore;
  }
};

const makeRandomMove = (board: string[][]): { row: number; column: number } => {
  const emptyCells: { row: number; column: number }[] = [];

  for (let row = 0; row < 3; row++) {
    for (let column = 0; column < 3; column++) {
      if (board[row][column] === '') {
        emptyCells.push({ row, column });
      }
    }
  }

  if (emptyCells.length === 0) {
    return { row: -1, column: -1 };
  }

  const randomIndex = Math.floor(Math.random() * emptyCells.length);
  return emptyCells[randomIndex];
};

const makeStrategicMistake = (
  board: string[][],
  aiIs: string,
  userIs: string,
): { row: number; column: number } => {
  // Look for moves that don't block user wins or don't take obvious wins
  const availableMoves: { row: number; column: number; priority: number }[] =
    [];

  for (let row = 0; row < 3; row++) {
    for (let column = 0; column < 3; column++) {
      if (board[row][column] === '') {
        const clonedBoard = cloneBoard(board);
        clonedBoard[row][column] = aiIs;

        let priority = 0;

        // Check if this move wins the game (high priority to avoid)
        if (checkWinner(clonedBoard) === aiIs) {
          priority = 100;
        } else {
          // Check if this move blocks user win (medium priority to avoid)
          const testBoard = cloneBoard(board);
          testBoard[row][column] = userIs;
          if (checkWinner(testBoard) === userIs) {
            priority = 50;
          } else {
            // Regular move (low priority)
            priority = Math.random() * 10;
          }
        }

        availableMoves.push({ row, column, priority });
      }
    }
  }

  // Sort by priority (ascending - we want to avoid high priority moves)
  availableMoves.sort((a, b) => a.priority - b.priority);

  // Sometimes pick a lower priority move (strategic mistake)
  const mistakeThreshold = 0.3; // 30% chance to make a strategic mistake
  if (Math.random() < mistakeThreshold && availableMoves.length > 1) {
    // Pick from the first half of moves (lower priority = more mistakes)
    const mistakeIndex = Math.floor(
      Math.random() * Math.ceil(availableMoves.length / 2),
    );
    return availableMoves[mistakeIndex];
  }

  // Otherwise pick a random move
  return availableMoves[Math.floor(Math.random() * availableMoves.length)];
};

const calculateBestMove = (
  board: string[][],
  aiIs: string,
  userIs: string,
  maxDepth: number,
): { row: number; column: number } => {
  let bestScore = -Infinity;
  let move = { row: -1, column: -1 };

  for (let row = 0; row < 3; row++) {
    for (let column = 0; column < 3; column++) {
      if (board[row][column] === '') {
        const clonedBoard = cloneBoard(board);
        clonedBoard[row][column] = aiIs;
        const score = minimax(clonedBoard, 0, false, aiIs, userIs, maxDepth);
        if (score > bestScore) {
          bestScore = score;
          move = { row, column };
        }
      }
    }
  }

  return move;
};

// Helper function to create a deep copy of the board
export const cloneBoard = (board: string[][]): string[][] => {
  return board.map((row) => [...row]);
};

export const generateEmptyBoard = (): string[][] => {
  return [
    ['', '', ''],
    ['', '', ''],
    ['', '', ''],
  ];
};

export const getGameStatus = (
  board: string[][],
  aiIs: string,
  userIs: string,
): TicTacToeStatus => {
  const result = checkWinner(board);

  if (result === aiIs) return TicTacToeStatus.LOSE; // AI wins
  if (result === userIs) return TicTacToeStatus.WIN; // Human wins
  if (result === TicTacToeStatus.TIE) return TicTacToeStatus.TIE; // Game is tied
  return TicTacToeStatus.IN_PROGRESS; // No winner yet
};

export const makeAIMove = (
  board: string[][],
  aiIs: string,
  userIs: string,
  difficulty: TicTacToeMultiplier,
): TicTacToeMoveResponseDto => {
  let move: { row: number; column: number };

  // Casino logic: Define win rates for each difficulty
  const winRates = {
    [TicTacToeMultiplier.LOW]: 0.15, // User wins 15% of the time
    [TicTacToeMultiplier.MEDIUM]: 0.05, // User wins 5% of the time
    [TicTacToeMultiplier.HIGH]: 0.01, // User wins 1% of the time
  };

  const userWinRate = winRates[difficulty] || 0.01;
  const randomValue = Math.random();

  // Determine AI behavior based on difficulty and randomness
  if (difficulty === TicTacToeMultiplier.LOW) {
    if (randomValue < userWinRate) {
      // Let user win: Make strategic mistakes
      move = makeStrategicMistake(board, aiIs, userIs);
    } else if (randomValue < userWinRate + 0.3) {
      // Play randomly (more draws/closer games)
      move = makeRandomMove(board);
    } else {
      // Play optimally but with limited depth
      move = calculateBestMove(board, aiIs, userIs, 2);
    }
  } else if (difficulty === TicTacToeMultiplier.MEDIUM) {
    if (randomValue < userWinRate) {
      // Let user win: Make subtle mistakes
      move = makeStrategicMistake(board, aiIs, userIs);
    } else if (randomValue < userWinRate + 0.2) {
      // Play with medium depth (more draws possible)
      move = calculateBestMove(board, aiIs, userIs, 4);
    } else {
      // Play optimally with good depth
      move = calculateBestMove(board, aiIs, userIs, 6);
    }
  } else {
    // HIGH difficulty
    if (randomValue < userWinRate) {
      // Very rarely let user win
      move = makeStrategicMistake(board, aiIs, userIs);
    } else {
      // Play optimally (nearly unbeatable)
      move = calculateBestMove(board, aiIs, userIs, Infinity);
    }
  }

  // Fallback to random move if no move was selected
  if (move.row === -1 || move.column === -1) {
    move = makeRandomMove(board);
  }

  // Apply the move to the board
  if (move.row !== -1 && move.column !== -1) {
    board[move.row][move.column] = aiIs;
  }

  const betResultStatus = getGameStatus(board, aiIs, userIs);
  return { board, move, betResultStatus, currentTurn: userIs };
};
