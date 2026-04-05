/**
 * Maps engine `validateQuoridorMove` strings to plain-language toast copy.
 * Keep keys in sync with `@blockwinz/quoridor-engine` / server rejection reasons.
 */
export function quoridorInvalidMoveToastCopy(reason: string): {
  title: string;
  description: string;
} {
  const map: Record<string, { title: string; description: string }> = {
    'Wall blocks all paths for a player': {
      title: 'Cannot completely block a player',
      description:
        'A wall cannot trap anyone—each player must always have a way to reach their goal row.',
    },
    'Wall overlaps an existing wall': {
      title: 'Wall crosses an existing one',
      description:
        'That line overlaps or touches a wall already on the board. Try a different gap.',
    },
    'No walls remaining': {
      title: 'No walls left',
      description:
        'You have used all your walls for this game. Move your pawn instead.',
    },
    'Wall out of bounds': {
      title: 'Wall off the board',
      description: 'Place walls only along the gaps inside the playing grid.',
    },
    'Illegal pawn move': {
      title: 'That pawn move is not allowed',
      description:
        'Move only to a highlighted square, following Quoridor jump rules.',
    },
    'Move out of bounds': {
      title: 'Off the board',
      description: 'Pawns must stay on the 9×9 grid.',
    },
    'Game already finished': {
      title: 'Game is over',
      description: 'This match has already ended.',
    },
    'Not a player in this session': {
      title: 'Not in this game',
      description: 'You are not part of this match.',
    },
    'Not your turn': {
      title: 'Not your turn',
      description: 'Wait for your opponent to finish their move.',
    },
    'Game is not in progress': {
      title: 'Game is not active',
      description: 'This match is not accepting moves right now.',
    },
    'Invalid move payload': {
      title: 'Move could not be read',
      description: 'Something went wrong sending that move. Try again.',
    },
    'Illegal wall placement': {
      title: 'Wall not allowed there',
      description: 'That spot breaks the rules—try another gap or orientation.',
    },
  };

  return (
    map[reason] ?? {
      title: 'Move not allowed',
      description: reason,
    }
  );
}
