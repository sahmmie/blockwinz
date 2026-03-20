/* eslint-disable @typescript-eslint/no-unused-expressions */
import { useSound } from './useSound'
import { useEffect, useRef, useState } from 'react'
import { useMaxProfit } from './useMaxProfit'
import { useBetAmount } from '@/hooks/useBetAmount'
import { useGameState } from '@/hooks/useGameState'
import { wheelMuls } from '@/casinoGames/wheel/wheelMuls'
import { GameRenderer } from '../components/Renderer/GameRenderer'
import { WheelGameState, WheelBetRequest, WheelBetResponse, MulData } from '../types'
import { useSettingsStore } from '@/hooks/useSettings'
import { TagGroupItem } from '@/components/TagGroup'
import { useIsMobile } from '@/hooks/useIsMobile'
import useWalletState from '@/hooks/useWalletState'

type EP = WheelGameState & WheelBetRequest & WheelBetResponse

export const useGameControls = () => {
  const { getWalletData } = useWalletState()
    const { state, actions } = useGameState<WheelGameState, WheelBetRequest, WheelBetResponse>({
        initialState: {
            animSpeed: 50,
            animNormalSpeed: 300,
            animTurboSpeed: 50,
            prevResults: [],
            mulData: [],
            segments: 10,
            risk: 'MEDIUM',
            multiplier: -1,
            delayBeforeNextAutoBet: 50,
            forceUpdater: '',
            tagResults: []
        },
        onBetRequest: (currState) => {
            play('startBet', settings.isMuted)
            return {
                segments: currState.segments,
                risk: currState.risk,
            }
        },
        onBetResult: (currState: EP, res: WheelBetResponse) => {
            currState
            actions.updateState({ multiplier: res.multiplier, forceUpdater: Math.random().toString() })
            isSpinningRef.current = true
        },
        onAnimFinish: (currState: EP, res: WheelBetResponse) => {
            currState
            res
        },
        betEndpoint: '/wheel/spin',
    })
    const isMobile = useIsMobile()
    const { play, stop } = useSound()
    const { settings } = useSettingsStore()
    const isMuted = settings.isMuted

    const isMutedRef = useRef<boolean>(settings.isMuted || false)
    const segmentsRef = useRef<number>(state.segments)
    const isSpinningRef = useRef<boolean>(false)
    const mulsDataRef = useRef<MulData[]>([])
    const onMulEnterRef = useRef<(multiplier: number) => void>(() => { })

    const [gameRendererInited, setGameRendererInited] = useState<boolean>(false)
    const gameRendererRef = useRef<GameRenderer | null>(null)

    const { betAmountErrors } = useBetAmount(state.betAmount.toString())

    useEffect(() => {
        const currentMuls = wheelMuls[state.risk][state.segments]
        const uniqueMultipliers = Array.from(new Set(currentMuls.muls))

        const mulData: MulData[] = uniqueMultipliers.sort().map((um, index) => {
            const color = currentMuls.colors.find(c => c.mul === um)?.color || 'gray'
            const count = currentMuls.muls.filter(m => m === um).length
            const chance = (count / state.segments) * 100
            return {
                mul: um,
                color,
                chance,
                index,
                sound: 'sound-path',
                uid: Math.random().toString(),
            }
        })

        mulsDataRef.current = mulData
        actions.updateState({ mulData })
    }, [state.segments, state.risk])

    useEffect(() => {
        gameRendererRef.current?.setTurbo(settings.isTurbo || false)
    }, [settings.isTurbo])

    useEffect(() => {
        if (state.multiplier === -1) return
        gameRendererRef.current?.setOnMulEnter(onMulEnterRef.current)
        gameRendererRef.current?.spin(state.multiplier)
    }, [state.multiplier, state.forceUpdater])

    useEffect(() => {
        gameRendererRef.current = new GameRenderer(state.segments, state.risk, isMobile || false)
        setGameRendererInited(true)
    }, [])

    useEffect(() => {
        gameRendererRef.current?.update(state.segments, state.risk)
    }, [state.segments, state.risk])

    useEffect(() => {
        isMutedRef.current = settings.isMuted || false
    }, [settings.isMuted])

    // Play spin sound when wheel starts spinning
    useEffect(() => {
        if (isSpinningRef.current) {
            play('spin', isMuted)
        }
    }, [isSpinningRef.current])

    const { segments, risk, betAmount } = state

    const { maxProfitErrors } = useMaxProfit(parseFloat(betAmount), Math.max(...wheelMuls[risk][segments].muls))

    const validSegments = (seg: number): boolean => {
        return [10, 20, 30, 40, 50].includes(seg)
    }

    const handleSegmentsChange = (newSegments: number) => {
        if (isSpinningRef.current || !validSegments(newSegments)) return
        segmentsRef.current = newSegments
        actions.updateState({ segments: newSegments })
    }

    const increaseSegments = () => {
        if (isSpinningRef.current) return
        const newSegs = Math.min((segmentsRef.current || 10) + 10, 50)
        handleSegmentsChange(newSegs)
    }

    const decreaseSegments = () => {
        if (isSpinningRef.current) return
        const newSegs = Math.max((segmentsRef.current || 50) - 10, 10)
        handleSegmentsChange(newSegs)
    }

    const toggleRisk = (newRisk: string) => {
        actions.updateState({ risk: newRisk })
    }

    useEffect(() => {
        onMulEnterRef.current = (mul: number) => {
            const index = mulsDataRef.current.findIndex(md => md.mul === mul)
            const mulData = mulsDataRef.current[index]
            if (mulData) {
                const newResult: MulData = {
                    color: mulData.color,
                    mul: mulData.mul,
                    chance: 0,
                    sound: '',
                    index,
                    uid: Math.random().toString(),
                }

                const newTagResult: TagGroupItem = {
                    bgColor: mulData.color,
                    color: '#ECF0F1',
                    label: `${mulData.mul.toFixed(2)}`,
                    id: `${Date.now()}-${Math.random()}`,
                }

                actions.updateState((prevState) => {
                    const currentTagResults = prevState.tagResults || []
                    const newTagResults = [...currentTagResults, newTagResult]
                    // Keep only the last 5 elements (remove oldest, keep newest)
                    const updatedTagResults = newTagResults.slice(-5)

                    return {
                        prevResults: [newResult, ...(prevState.prevResults || [])].slice(0, 5),
                        tagResults: updatedTagResults
                    }
                })
            }

            stop('spin')
            mul > 0 && play('result', isMuted)
            isSpinningRef.current = false
            getWalletData()
        }
    }, [mulsDataRef.current])

    return {
        ...state,
        ...actions,
        isSpinning: isSpinningRef.current,
        betAmountErrors,
        maxProfitErrors,
        gameRendererInited,
        gameRendererRef,
        increaseSegments,
        decreaseSegments,
        toggleRisk,
        handleSegmentsChange,
    }
}

export default useGameControls

