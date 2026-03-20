export const SCL = 1
export const W = 800 * SCL
export const H = 600 * SCL

export const MIN_OR = 5 * SCL
export const MAX_OR = 10 * SCL

export const MIN_BR = 8 * SCL
export const MAX_BR = 12 * SCL

export const PT = 40 * SCL
export const getPB = (rows: number): number => (rows >= 14 ? 9 : 12) * SCL

export const MAX_O = 168
export const MAX_A = 50

export const NO_COL_FILTER = { category: 0x0000, mask: 0x0000 }
export const NO_COL_FILTER_GR = { category: 0x0000, mask: 0x0000, group: -1 }

export const COL_FILTER = { category: 0x0001, mask: 0xffffffff }
export const COL_FILTER_GR = { category: 0x0001, mask: 0xffffffff, group: -1 }

export const DEF_OBS = {
  label: 'obstacle',
  isStatic: true,
  restitution: 0.85,
  collisionFilter: COL_FILTER,
}
export const DEF_BALL: Matter.IBodyDefinition = {
  label: 'ball',
  restitution: 0.99,
  friction: 0.4,
  collisionFilter: COL_FILTER_GR,
  mass: 3 * SCL,
}

export const OBS_COLOR = '#D9D9D9'

export const SIM_SETTINGS = {
  MIN_PATHS: 1,
  MAX_PATHS: 1,
  BALLS_PER_RUN: 2000,
  BALL_SPAWN_DELAY: 1,
  QUANT_FACTOR: 50, // Controls the quantization factor for path sampling - higher values create more precise path recordings
  SAMPLE_INTERVAL: 2, // Determines how often to sample ball positions during simulation - every N frames
}

export function setAspectR(container: HTMLDivElement) {
  const parentContainer = container.parentElement
  if (parentContainer) {
    const parentWidth = parentContainer.offsetWidth
    const aspectRatio = 4 / 3
    const height = parentWidth / aspectRatio
    parentContainer.style.height = `${height}px`
  }
}

export async function delay(time: number) {
  return new Promise<void>((res) => {
    setTimeout(res, time)
  })
}

export const spacing = (rows: number): number =>
  Math.min(W / (rows + 1), (H - PT - getPB(rows)) / (rows - 1))

export const obstacleR = (rows: number): number => MAX_OR - ((rows - 8) / 8) * (MAX_OR - MIN_OR)

export const ballR = (rows: number): number => MAX_BR - ((rows - 8) / 8) * (MAX_BR - MIN_BR)

export const lastRowX = (rows: number): number => (W - (rows + 1) * spacing(rows)) / 2

export const lastRowY = (rows: number): number => PT + (rows - 1) * spacing(rows)

export function createObstaclePositions(rows: number) {
  const obsPositions = new Array<{ x: number; y: number }>((rows * (rows + 5)) / 2)
  for (let row = 0; row < rows; row++) {
    const cols = row + 3
    const rowWidth = (cols - 1) * spacing(rows)
    const startX = (W - rowWidth) / 2

    for (let col = 0; col < cols; col++) {
      obsPositions.push({
        x: Math.round(startX + col * spacing(rows)),
        y: Math.round(PT + row * spacing(rows)),
      })
    }
  }
  return obsPositions
}
