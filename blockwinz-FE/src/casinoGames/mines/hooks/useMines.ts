import { AxiosResponse } from 'axios'
import { useMutation, useQuery, UseQueryResult } from '@tanstack/react-query'

import { useState } from 'react'
import { IActiveGameResponse, IMinesCashout, IMinesReveal, IMinesStart } from '../types'
import { startMinesRequest, revealTileRequest, autoBetRequest, minesCashoutRequest, activeGameRequest } from '../api/services'

export const useMines = () => {
  const [isRequestInProgress, setIsRequestInProgress] = useState(false)

  const startMinesMutation = useMutation({
    mutationFn: (body: IMinesStart) => startMinesRequest(body),
    onError: (error) => {
      console.error('Error starting game:', error)
      setIsRequestInProgress(false)
    }
  })

  const revealTileMutation = useMutation({
    mutationFn: (body: IMinesReveal) => revealTileRequest(body),
    onError: (error) => {
      console.error('Error revealing tile:', error)
      setIsRequestInProgress(false)
    }
  })

  const autoBetMutation = useMutation({
    mutationFn: (body: IMinesStart) => autoBetRequest(body),
    onError: (error) => {
      console.error('Error auto betting:', error)
      setIsRequestInProgress(false)
    }
  })

  const minesCashoutMutation = useMutation({
    mutationFn: (body: IMinesCashout) => minesCashoutRequest(body),
    onError: (error) => {
      console.error('Error cashing out:', error)
      setIsRequestInProgress(false)
    }
  })

  const {
    data: activeGame,
    isLoading: loadingActiveGame,
    isError: errorLoadingActiveGame,
    refetch: refetchActiveGame,
    isSuccess: successLoadingActiveGame,
  }: UseQueryResult<IActiveGameResponse, Error> = useQuery(
    ['activeGame'],
    () => activeGameRequest(),
    {
      retry: 5,
      refetchOnWindowFocus: false,
    }
  )

  const executeRequest = async <T, R>(
    requestFunction: (body: T) => Promise<AxiosResponse<R> | null>,
    body: T,
    errorMessage: string
  ): Promise<AxiosResponse<R> | null> => {
    if (isRequestInProgress) {
      console.warn(`Error:: A request is already in progress`)
      return null
    }

    setIsRequestInProgress(true)
    try {
      const response = await requestFunction(body)
      if (!response) {
        throw new Error('No response received')
      }
      return response
    } catch (error) {
      console.error(errorMessage, error)
      throw error
    } finally {
      setIsRequestInProgress(false)
    }
  }

  const startGame = async (body: IMinesStart) => {
    try {
      return await executeRequest(startMinesMutation.mutateAsync, body, 'Error starting game:')
    } catch (error) {
      console.error('Failed to start game:', error)
      return null
    }
  }

  const revealTile = async (body: IMinesReveal) => {
    try {
      return await executeRequest(revealTileMutation.mutateAsync, body, 'Error revealing tile:')
    } catch (error) {
      console.error('Failed to reveal tile:', error)
      return null
    }
  }

  const autoBet = async (body: IMinesStart) => {
    try {
      return await executeRequest(autoBetMutation.mutateAsync, body, 'Error auto betting:')
    } catch (error) {
      console.error('Failed to auto bet:', error)
      return null
    }
  }

  const cashoutMines = async (body: IMinesCashout) => {
    try {
      return await executeRequest(minesCashoutMutation.mutateAsync, body, 'Error cashing out:')
    } catch (error) {
      console.error('Failed to cashout:', error)
      return null
    }
  }

  return {
    actions: {
      autoBet,
      startGame,
      revealTile,
      cashoutMines,
      refetchActiveGame,
    },
    state: {
      successLoadingActiveGame,
      activeGame,
      loadingActiveGame,
      errorLoadingActiveGame,
      isLoadingStart: startMinesMutation.isLoading,
      isLoadingCashout: minesCashoutMutation.isLoading,
      isLoadingReveal: revealTileMutation.isLoading,
      isLoadingAutoBet: autoBetMutation.isLoading,
      startGameResponse: startMinesMutation.data,
      error: startMinesMutation.error,
      isRequestInProgress,
    },
  }
}
