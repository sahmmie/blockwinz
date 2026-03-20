import { useSound } from './useSound'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useMaxProfit } from './useMaxProfit'
import { useBetAmount } from '@/hooks/useBetAmount'
import { useGameState } from '@/hooks/useGameState'
import { plinkoMuls } from '@/casinoGames/plinko/plinkoMuls'
import { colors } from '../clrs'
import { GameRenderer } from '../components/Renderer/GameRenderer'
import { PLINKO_TURBO_ANIM_SPEED_MULTIPLIER } from '../components/Renderer/utils'
import { PlinkoGameState, PlinkoBetRequest, PlinkoBetResponse, BucketData } from '../types'
import { useSettingsStore } from '@/hooks/useSettings'
import useWalletState from '@/hooks/useWalletState'
import { SpeedTypes } from '@/shared/types/core'

type EP = PlinkoGameState & PlinkoBetRequest & PlinkoBetResponse

export const useGameControls = () => {
  const { getWalletData } = useWalletState()
  const { play } = useSound()
  const { settings } = useSettingsStore()

  const settingsRef = useRef(settings)
  settingsRef.current = settings

  const gameRendererRef = useRef<GameRenderer | null>(null)
  const finalizePlinkoRoundRef = useRef<(bucketIndex: number, fromAnimation: boolean) => void>(
    () => {}
  )

  const bucketDataRef = useRef<BucketData[]>([])
  const isMutedRef = useRef<boolean>(settings.isMuted || false)
  const runningBallsRef = useRef<number>(0)
  const rowsRef = useRef<number>(8)

  const setRunningBalls = (newRunningBalls: number) => {
    runningBallsRef.current = newRunningBalls
  }

  const bumpRunningBall = () => {
    setRunningBalls(runningBallsRef.current + 1)
  }

  const { state, actions } = useGameState<PlinkoGameState, PlinkoBetRequest, PlinkoBetResponse>({
    deferAutobetContinue: true,
    initialState: {
      animSpeed: 50,
      animNormalSpeed: 50,
      animTurboSpeed: 50,
      prevResults: [],
      rows: 8,
      risk: 'MEDIUM',
      results: [],
      bucketData: [],
      bucketsContainerP: 0,
      delayBeforeNextAutoBet: 50,
    },
    onBetRequest: (currState) => {
      play('startBet', settingsRef.current.isMuted)
      return {
        rows: currState.rows,
        risk: currState.risk,
      }
    },
    onBetResult: async (currState: EP, res: PlinkoBetResponse) => {
      const goalBucket = res.results.reduce((acc, cur) => acc + cur, 0)
      const isTurbo =
        settingsRef.current.isTurbo || currState.speedType === SpeedTypes.TURBO
      actions.updateState({ results: res.results })
      await gameRendererRef.current?.createBall(
        goalBucket,
        isTurbo ? PLINKO_TURBO_ANIM_SPEED_MULTIPLIER : 1
      )
      bumpRunningBall()
    },
    onAnimFinish: () => {
      // No-op: round completion is in finalizePlinkoRound
    },
    betEndpoint: '/plinko/roll',
  })

  const signalRoundCompleteRef = useRef(actions.signalRoundComplete)
  signalRoundCompleteRef.current = actions.signalRoundComplete

  const finalizePlinkoRound = useCallback(
    (bucketIndex: number, fromAnimation: boolean) => {
      if (fromAnimation) {
        setRunningBalls(Math.max(0, runningBallsRef.current - 1))
      }

      const bucket = bucketDataRef.current[bucketIndex]
      if (!bucket) return

      play('score', isMutedRef.current, bucket.index)
      const newResult = {
        color: bucket.color,
        label: bucket.label,
        index: bucketIndex,
        uid: Math.random().toString(),
      }

      actions.updateState((prevState) => ({
        prevResults: [newResult, ...(prevState.prevResults || [])].slice(0, 5),
      }))

      getWalletData()
      signalRoundCompleteRef.current()
    },
    [play, actions, getWalletData]
  )

  finalizePlinkoRoundRef.current = finalizePlinkoRound

  const setBucketsContainerP = (newP: number) => actions.updateState({ bucketsContainerP: newP })

  const [gameRendererInited, setGameRendererInited] = useState<boolean>(false)
  const [gameDataLoading, setGameDataLoading] = useState<boolean>(true)

  const { betAmountErrors } = useBetAmount(state.betAmount.toString())

  useEffect(() => {
    gameRendererRef.current = new GameRenderer(state.rows, state.risk, setBucketsContainerP)

    const checkLoadingComplete = () => {
      if (gameRendererRef.current?.pathsLoaded) {
        setGameDataLoading(false)
      } else {
        setTimeout(checkLoadingComplete, 100)
      }
    }
    checkLoadingComplete()

    setGameRendererInited(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- init renderer once on mount
  }, [])

  useEffect(() => {
    gameRendererRef.current?.updateRisk(state.risk)
  }, [state.risk])

  useEffect(() => {
    if (!gameRendererInited || !gameRendererRef.current) return
    const fn = (bucketIndex: number) => finalizePlinkoRoundRef.current(bucketIndex, true)
    gameRendererRef.current.setOnBallInBucket(fn)
    actions.updateState({ onBucketEnter: fn })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- actions.updateState is stable enough; avoid re-running every render
  }, [state.rows, state.risk, gameRendererInited])

  useEffect(() => {
    isMutedRef.current = settings.isMuted || false
  }, [settings.isMuted])

  useEffect(() => {
    const maxSoundIndex = 6
    const numBuckets = plinkoMuls[state.risk][state.rows].length
    const middleIndex = Math.floor(numBuckets / 2)
    const colorIndexIncrement = (colors.length - 1) / middleIndex
    const soundIndexIncrement = (maxSoundIndex - 1) / middleIndex

    const newBD = plinkoMuls[state.risk][state.rows].map((mul, index) => {
      const distanceFromMiddle = Math.abs(middleIndex - index)
      const colorIndex = Math.round(colorIndexIncrement * distanceFromMiddle) % colors.length
      const soundIndex = Math.round(soundIndexIncrement * distanceFromMiddle) % maxSoundIndex
      return {
        color: colors[colorIndex],
        label: state.rows > 15 ? `${parseFloat(mul.toFixed(2))}` : `x${parseFloat(mul.toFixed(2))}`,
        index: soundIndex,
        uid: Math.random().toString(),
      }
    })

    bucketDataRef.current = newBD
    actions.updateState({ bucketData: newBD })
    rowsRef.current = state.rows
    // eslint-disable-next-line react-hooks/exhaustive-deps -- actions.updateState; rows/risk drive bucket layout
  }, [state.rows, state.risk])

  const { rows, risk, betAmount } = state

  const { maxProfitErrors } = useMaxProfit(parseFloat(betAmount), plinkoMuls[risk][rows][0])

  const handleRowsChange = (newRows: number) => {
    if (runningBallsRef.current > 0 || newRows < 8 || newRows > 16) return
    rowsRef.current = newRows
    actions.updateState({ rows: newRows })
    gameRendererRef.current?.updateGame(newRows)
  }

  const increaseRow = () => {
    if (runningBallsRef.current > 0) return
    const newRows = Math.min((rowsRef.current || 8) + 1, 16)
    handleRowsChange(newRows)
  }

  const decreaseRow = () => {
    if (runningBallsRef.current > 0) return
    const newRows = Math.max((rowsRef.current || 8) - 1, 8)
    handleRowsChange(newRows)
  }

  const toggleRisk = (newRisk: string) => {
    actions.updateState({ risk: newRisk })
  }

  return {
    ...state,
    ...actions,
    runningBalls: runningBallsRef.current > 0,
    betAmountErrors,
    maxProfitErrors,
    gameRendererInited,
    gameDataLoading,
    gameRendererRef,
    increaseRow,
    decreaseRow,
    toggleRisk,
    handleRowsChange,
    setBucketsContainerP,
  }
}

export default useGameControls
