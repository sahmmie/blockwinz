/* eslint-disable @typescript-eslint/no-unused-expressions */
import { useSound } from './useSound'
import { useEffect, useRef, useState } from 'react'
import { useMaxProfit } from './useMaxProfit'
import { useBetAmount } from '@/hooks/useBetAmount'
import { useGameState } from '@/hooks/useGameState'
import { plinkoMuls } from '@/casinoGames/plinko/plinkoMuls'
import { colors } from '../clrs'
import { GameRenderer } from '../components/Renderer/GameRenderer'
import { PlinkoGameState, PlinkoBetRequest, PlinkoBetResponse, BucketData } from '../types'
import { useSettingsStore } from '@/hooks/useSettings'
import useWalletState from '@/hooks/useWalletState'

type EP = PlinkoGameState & PlinkoBetRequest & PlinkoBetResponse

export const useGameControls = () => {
  const { getWalletData } = useWalletState()
  const { state, actions } = useGameState<PlinkoGameState, PlinkoBetRequest, PlinkoBetResponse>({
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
      play('startBet', settings.isMuted)
      return {
        rows: currState.rows,
        risk: currState.risk,
      }
    },
    onBetResult: async (currState: EP, res: PlinkoBetResponse) => {
      currState
      const goalBucket = res.results.reduce((acc, cur) => acc + cur, 0)
      if (!settings.isTurbo) await gameRendererRef.current?.createBall(goalBucket)
      onBallSpawn()
      actions.updateState({ results: res.results })
    },
    onAnimFinish: () => {
      // No-op: all finish logic is now in onBucketEnter
    },
    betEndpoint: '/plinko/roll',
  })

  const { play } = useSound()
  const { settings } = useSettingsStore()

  const bucketDataRef = useRef<BucketData[]>([])
  const isMutedRef = useRef<boolean>(settings.isMuted || false)
  const runningBallsRef = useRef<number>(0)
  const rowsRef = useRef<number>(state.rows)

  const onBallSpawn = () => {
    setRunningBalls(runningBallsRef.current + 1)
  }

  const setBucketsContainerP = (newP: number) => actions.updateState({ bucketsContainerP: newP })

  const [gameRendererInited, setGameRendererInited] = useState<boolean>(false)
  const [gameDataLoading, setGameDataLoading] = useState<boolean>(true)
  const gameRendererRef = useRef<GameRenderer | null>(null)

  const { betAmountErrors } = useBetAmount(state.betAmount.toString())

  useEffect(() => {
    gameRendererRef.current = new GameRenderer(state.rows, state.risk, setBucketsContainerP)
    
    // Listen for game data loading completion
    const checkLoadingComplete = () => {
      if (gameRendererRef.current?.pathsLoaded) {
        setGameDataLoading(false)
      } else {
        setTimeout(checkLoadingComplete, 100)
      }
    }
    checkLoadingComplete()
    
    setGameRendererInited(true)
  }, [])

  useEffect(() => {
    gameRendererRef.current?.updateRisk(state.risk)
  }, [state.risk])

  useEffect(() => {
    gameRendererRef.current?.setOnBallInBucket(state.onBucketEnter)
  }, [state.onBucketEnter])

  useEffect(() => {
    isMutedRef.current = settings.isMuted || false
  }, [settings.isMuted])

  const setBucketData = (newBucketData: BucketData[]) => {
    bucketDataRef.current = newBucketData
    actions.updateState({ bucketData: newBucketData })
  }

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

    setBucketData(newBD)
  }, [state.rows, state.risk])

  useEffect(() => {
    const onBucketEnter = (bucketIndex: number) => {
      setRunningBalls(runningBallsRef.current - 1)

      const bucket = bucketDataRef.current[bucketIndex]
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

      // --- Animation is truly finished here ---
      getWalletData()
      // Turbo mode finish logic
      if (settings.isTurbo) {
        const goalBucket = bucketIndex
        state.onBucketEnter(goalBucket)
      }
    }

    actions.updateState({ onBucketEnter: onBucketEnter })
  }, [bucketDataRef.current, settings.isMuted, settings.isTurbo])

  const { rows, risk, betAmount } = state

  const { maxProfitErrors } = useMaxProfit(parseFloat(betAmount), plinkoMuls[risk][rows][0])

  const setRunningBalls = (newRunningBalls: number) => {
    runningBallsRef.current = newRunningBalls
  }

  useEffect(() => {
    actions.updateState({ rows: rowsRef.current })
  }, [rowsRef.current])

  const handleRowsChange = (newRows: number) => {
    if (runningBallsRef.current > 0 || newRows < 8 || newRows > 16) return
    rowsRef.current = newRows
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
    onBallSpawn,
    increaseRow,
    decreaseRow,
    toggleRisk,
    handleRowsChange,
    setBucketData,
    setBucketsContainerP,
  }
}

export default useGameControls
