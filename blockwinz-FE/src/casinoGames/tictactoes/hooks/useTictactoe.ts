import { AxiosResponse } from 'axios'
import { useMutation, useQuery, UseQueryResult } from '@tanstack/react-query'
import {
  startNewGameRequest,
  makeMoveRequest,
  activeGameRequest,
} from '../api/services.ts'
import { useState } from 'react'
import { TictactoeActiveGameResponse, TicTacToeMove, TicTacToeStart } from '../types.ts'

export const useTictactoe = () => {
  const [isRequestInProgress, setIsRequestInProgress] = useState(false)
  const startNewGameMutation = useMutation((body: TicTacToeStart) => startNewGameRequest(body))
  const makeMoveMutation = useMutation((body: TicTacToeMove) => makeMoveRequest(body))

  const {
    data: activeGame,
    isLoading: loadingActiveGame,
    isError: errorLoadingActiveGame,
    refetch: refetchActiveGame,
    isSuccess: successLoadingActiveGame,
  }: UseQueryResult<TictactoeActiveGameResponse, Error> = useQuery(
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
      console.error(`Error:: A request is already in progress`)
      return null
    }

    setIsRequestInProgress(true)
    try {
      return await requestFunction(body)
    } catch (error) {
      console.error(errorMessage, error)
      return null
    } finally {
      setIsRequestInProgress(false)
    }
  }

  const startGame = (body: TicTacToeStart) =>
    executeRequest(startNewGameMutation.mutateAsync, body, 'Error starting game:')

  const makeMove = (body: TicTacToeMove) =>
    executeRequest(makeMoveMutation.mutateAsync, body, 'Error revealing tile:')


  return {
    actions: {
      startGame,
      refetchActiveGame,
      makeMove,
    },
    state: {
      successLoadingActiveGame,
      activeGame,
      loadingActiveGame,
      errorLoadingActiveGame,
      isLoadingMakeMove: makeMoveMutation.isLoading,
      startGameResponse: startNewGameMutation.data,
      isLoadingStart: startNewGameMutation.isLoading,
      startGameError: startNewGameMutation.error,
      isRequestInProgress,
    },
  }
}
