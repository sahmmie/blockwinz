import * as _ from 'lodash'
import { HOUSE_EDGE, MINES_GAME_TILES_COUNT } from '../constants/validation'
import { plinkoMuls } from '../../casinoGames/plinko/plinkoMuls'
import { wheelMuls } from '../../casinoGames/wheel/wheelMuls'
import {
  BaseFairLogicGenerateForGameDto,
  FairLogicByteGeneratorDto,
  FairLogicBytesToFloatsDto,
  FairLogicGenerateFloatsDto,
  GenerateFairLogicResultCoinFlipDto,
  GenerateFairLogicResultMinesDto,
  GenerateFairLogicResultPlinkoDto,
  GenerateFairLogicResultWheelDto,
} from '../types/core'
import { getCoinFlipPayoutMultiplier } from '@/casinoGames/coinflip/utils/payoutMultiplier'

/* <---------------------- Create HMAC using the Web Crypto API --------------------------> */
async function createHmac(key: string, message: string): Promise<Uint8Array> {
  const enc = new TextEncoder()
  const keyData = enc.encode(key)

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: { name: 'SHA-256' } },
    false,
    ['sign']
  )

  const sig = await crypto.subtle.sign('HMAC', cryptoKey, enc.encode(message))

  return new Uint8Array(sig)
}

/* <---------------------- Byte generator yielding one byte at a time --------------------------> */
async function* byteGenerator(request: FairLogicByteGeneratorDto): AsyncIterableIterator<number> {
  const { serverSeed, clientSeed, nonce, cursor } = request
  let currentRound = Math.floor(cursor / 32)
  let currentRoundCursor = cursor
  currentRoundCursor -= currentRound * 32

  while (true) {
    /* <---------- Create the HMAC using the server seed and update it with the current inputs ------> */
    const buffer = await createHmac(serverSeed, `${clientSeed}:${nonce}:${currentRound}`)

    /* <---------------------- Yield the bytes one by one until the round is over -------------------> */
    while (currentRoundCursor < 32) {
      yield buffer[currentRoundCursor]
      currentRoundCursor += 1
    }

    /* <---------------------- Reset the cursor and move to the next round --------------------------> */
    currentRoundCursor = 0
    currentRound += 1
  }
}

/* <---------------------- Convert bytes to float numbers --------------------------> */
function convertBytesToFloats(request: FairLogicBytesToFloatsDto): number[] {
  return _.chunk(request.bytes, 4).map((bytesChunk) =>
    bytesChunk.reduce((result, value, i) => {
      const divider = 256 ** (i + 1)
      const partialResult = value / divider
      return result + partialResult
    }, 0)
  )
}

async function generateFloatsForGame(request: FairLogicGenerateFloatsDto): Promise<number[]> {
  const { serverSeed, clientSeed, count, cursor, nonce } = request

  const randomNumbers = byteGenerator({ serverSeed, clientSeed, nonce, cursor })

  const bytes: number[] = []

  /* <--------------------- Populate bytes array with sets of 4 from RNG output ---------------------> */
  for await (const num of randomNumbers) {
    if (bytes.length >= count * 4) break
    bytes.push(num)
  }

  /* <---------------------- Convert the bytes to floats and return them ----------------------------> */
  return convertBytesToFloats({ bytes })
}

async function generateDiceResult(request: BaseFairLogicGenerateForGameDto): Promise<number> {
  const diceDataToGenerateFloats = {
    ...request,
    cursor: 0,
    count: 1,
  }

  const floats = await generateFloatsForGame(diceDataToGenerateFloats)

  const resultFloat = (floats[0] * 10_001) / 100

  return resultFloat
}

async function generateMinesResult(request: GenerateFairLogicResultMinesDto) {
  const minesDataToGenerateFloats = {
    ...request,
    cursor: 0,
    count: request.mines,
  }
  const floats = await generateFloatsForGame(minesDataToGenerateFloats)

  const availablePositions = Array.from({ length: 25 }, (_, i) => i)
  return floats.map((float, i) => {
    const randomIndex = Math.floor(float * (25 - i))
    return availablePositions.splice(randomIndex, 1)[0]
  })
}

async function generateLimboResult(request: BaseFairLogicGenerateForGameDto): Promise<number> {
  const limboDataToGenerateFloats = {
    ...request,
    cursor: 0,
    count: 1,
  }

  const limboOutcome = await generateFloatsForGame(limboDataToGenerateFloats)
  const floatPoint = (1e8 / (limboOutcome[0] * 1e8)) * 0.99
  const crashPoint = Math.floor(floatPoint * 100) / 100
  const result = Math.max(crashPoint, 1)

  return result
}

async function generatePlinkoResult(request: GenerateFairLogicResultPlinkoDto): Promise<number> {
  const plinkoDataToGenerateFloats = {
    ...request,
    cursor: 0,
    count: request.rows,
  }
  let floats = await generateFloatsForGame(plinkoDataToGenerateFloats)
  floats = floats.map((num) => (num > 0.5 ? 1 : 0))

  const position = Math.max(
    0,
    Math.min(
      floats.reduce((acc, cur) => acc + cur, 0),
      request.rows
    )
  )
  const result = plinkoMuls[request.risk][request.rows][position]
  return result
}

async function generateKenoResult(request: BaseFairLogicGenerateForGameDto): Promise<number[]> {
  const kenoDataToGenerateFloats = {
    ...request,
    cursor: 0,
    count: 10, // Assuming we need 10 numbers for Keno
  }
  const floats = await generateFloatsForGame(kenoDataToGenerateFloats)
  const SQUARES = Array.from({ length: 40 }, (_, i) => i + 1)
  const FINAL_KENO_BOARD: number[] = []
  const TOTAL = 40

  floats
    .map((float, i) => Math.floor(float * (TOTAL - i)))
    .forEach((hit) => {
      const square = SQUARES.splice(hit, 1)[0]
      FINAL_KENO_BOARD.push(square)
    })

  return FINAL_KENO_BOARD
}

async function generateCrashResult(request: BaseFairLogicGenerateForGameDto): Promise<number> {
  const crashDataToGenerateFloats = {
    ...request,
    cursor: 0,
    count: 1,
  }
  const floats = await generateFloatsForGame(crashDataToGenerateFloats)
  return 1 / (1 - floats[0]) // Example crash point calculation
}

/** Outcome of recomputing a Coin Flip round (matches API `CoinFlipService` float mapping and win rule). */
export interface CoinFlipVerifyResult {
  floats: number[]
  results: number[]
  coins: number
  min: number
  coinType: number
  matchCount: number
  isWin: boolean
  multiplier: number
}

/**
 * Recomputes Coin Flip from seeds + nonce: `coins` floats, each flip is 1 if float > 0.5 else 0 (same as server).
 * Win when at least `min` results equal `coinType`; multiplier uses 0.99 RTP via `getCoinFlipPayoutMultiplier`.
 */
async function verifyCoinFlipRound(
  request: GenerateFairLogicResultCoinFlipDto,
): Promise<CoinFlipVerifyResult | undefined> {
  if (!request.serverSeed || !request.clientSeed) {
    return undefined
  }
  const coins = Math.max(1, Math.min(10, Math.floor(Number(request.coins)) || 1))
  let min = Math.max(1, Math.min(coins, Math.floor(Number(request.min)) || 1))
  if (coins >= 6 && coins <= 8 && min < 2) min = 2
  if (coins >= 9 && coins <= 10 && min < 3) min = 3
  const coinType = request.coinType === 0 ? 0 : 1

  const floats = await generateFloatsForGame({
    serverSeed: request.serverSeed,
    clientSeed: request.clientSeed,
    nonce: request.nonce,
    cursor: 0,
    count: coins,
  })
  const results = floats.map((num) => (num > 0.5 ? 1 : 0))
  const matchCount = results.filter((r) => r === coinType).length
  const isWin = matchCount >= min
  const multiplier = isWin ? getCoinFlipPayoutMultiplier(coins, min) : 0

  return {
    floats,
    results,
    coins,
    min,
    coinType,
    matchCount,
    isWin,
    multiplier,
  }
}

async function generateBlackjackResult(
  request: BaseFairLogicGenerateForGameDto
): Promise<number[]> {
  const blackjackDataToGenerateFloats = {
    ...request,
    cursor: 0,
    count: 5, // Assuming we need 5 cards for initial deal
  }
  const floats = await generateFloatsForGame(blackjackDataToGenerateFloats)
  return floats.map((float) => Math.floor(float * 52)) // 0-51 representing cards
}

async function generateWheelResult(request: GenerateFairLogicResultWheelDto): Promise<number> {
  const plinkoDataToGenerateFloats = {
    ...request,
    cursor: 0,
    count: 1,
  }

  const float = await generateFloatsForGame(plinkoDataToGenerateFloats)

  const randIdx = Math.floor(float[0] * request.segments)
  const result = wheelMuls[request.risk][request.segments].muls[randIdx]
  return result
}
async function generateBaccaratResult(request: BaseFairLogicGenerateForGameDto): Promise<number[]> {
  const baccaratDataToGenerateFloats = {
    ...request,
    cursor: 0,
    count: 6, // Assuming we need 6 cards for initial deal
  }
  const floats = await generateFloatsForGame(baccaratDataToGenerateFloats)
  return floats.map((float) => Math.floor(float * 52)) // 0-51 representing cards
}

async function generateRouletteResult(request: BaseFairLogicGenerateForGameDto): Promise<number> {
  const rouletteDataToGenerateFloats = {
    ...request,
    cursor: 0,
    count: 1,
  }
  const floats = await generateFloatsForGame(rouletteDataToGenerateFloats)
  return Math.floor(floats[0] * 37) // 0-36 for roulette numbers
}

/**
 * Calculate the win multiplier for the game
 * @param openedMines Number of mines opened
 * @param minesCount Total number of mines
 * @private
 * @memberof MinesService
 * @method calculateWinMultiplier
 * @return number
 */
function calculateWinMultiplier(openedMines: number, minesCount: number) {
  const n = MINES_GAME_TILES_COUNT // Total number of tiles
  const x = n - minesCount // Number of tiles without mines
  const d = openedMines // Number of tiles revealed

  // If no tiles have been revealed, the win multiplier is 1
  if (d === 0) return 1

  // Function to calculate factorial
  function factorial(number: number): number {
    let value = 1
    for (let i = 2; i <= number; i++) {
      value *= i
    }
    return value
  }

  // Function to calculate combinations (n choose k)
  function combination(a: number, b: number): number {
    if (b > a) return 0 // Return 0 if b is greater than a (invalid case)
    if (b === 0 || b === a) return 1 // C(a, 0) and C(a, a) are both 1
    return factorial(a) / (factorial(b) * factorial(a - b)) // Calculate combination using factorials
  }

  // Calculate combinations for total tiles and revealed tiles
  const first = combination(n, d)
  // Calculate combinations for tiles without mines and revealed tiles
  const second = combination(x, d)

  // Calculate the win multiplier with the house edge adjustment
  const result = (1 - HOUSE_EDGE) * (first / second)

  // Round the result to two decimal places and Return the final win multiplier
  return Math.round(result * 100) / 100
}

export {
  generateBaccaratResult,
  generateBlackjackResult,
  verifyCoinFlipRound,
  generateCrashResult,
  generateDiceResult,
  generateKenoResult,
  generateLimboResult,
  generateMinesResult,
  generatePlinkoResult,
  generateRouletteResult,
  generateWheelResult,
  calculateWinMultiplier,
}
