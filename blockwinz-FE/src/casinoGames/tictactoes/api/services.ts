import { TicTacToeEndpoints } from './endpoints.ts'
import {
  TicTacToeStart,
  TictactoeStartResponse,
  TicTacToeMove,
  TicTacToeMoveResponse,
  TictactoeActiveGameResponse,
} from '../types.ts'
import { AxiosResponse } from 'axios'
import axiosInstance from '@/lib/axios.ts'

export const startNewGameRequest = async (
  body: TicTacToeStart
): Promise<AxiosResponse<TictactoeStartResponse>> => {
  return await axiosInstance.post(TicTacToeEndpoints.start, body)
}

export const makeMoveRequest = async (
  body: TicTacToeMove
): Promise<AxiosResponse<TicTacToeMoveResponse>> => {
  return await axiosInstance.post(TicTacToeEndpoints.makeMove, body)
}

export const activeGameRequest = async (): Promise<AxiosResponse<TictactoeActiveGameResponse>> => {
  return await axiosInstance.get(TicTacToeEndpoints.activeGame)
}
