const BOARD_SIZE = 5

const TOTAL_TILES = BOARD_SIZE * BOARD_SIZE

const BET_STATUS = {
  FINISHED: 'finished',
  CASHOUT: 'cashout',
  OPEN: 'open',
  LOST: 'lost',
  WON: 'won',
}

const DROPDOWN_OPTIONS = Array.from({ length: 24 }, (_, index) => {
  const value = (index + 1).toString()
  return { value, label: value }
})

const ALL_TILES_LOADING = Array.from({ length: TOTAL_TILES }, () => true)
const ALL_TILES_LOADED = Array.from({ length: TOTAL_TILES }, () => false)

export {
  BOARD_SIZE,
  DROPDOWN_OPTIONS,
  TOTAL_TILES,
  BET_STATUS,
  ALL_TILES_LOADING,
  ALL_TILES_LOADED,
}
