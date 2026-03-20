import axiosInstance from '@/lib/axios.ts'
import { IMinesStart, IMinesStartResponse, IMinesReveal, IMinesRevealResponse, IMinesCashout, IMinesCashoutResponse } from '../types.ts'
import { MinesEndpoints } from './endpoints.ts'


import { AxiosResponse } from 'axios'

export const startMinesRequest = async (
  body: IMinesStart
): Promise<AxiosResponse<IMinesStartResponse>> => {
  return await axiosInstance.post(MinesEndpoints.start, body)
}

export const revealTileRequest = async (
  body: IMinesReveal
): Promise<AxiosResponse<IMinesRevealResponse>> => {
  return await axiosInstance.post(MinesEndpoints.reveal, body)
}

export const minesCashoutRequest = async (
  body: IMinesCashout
): Promise<AxiosResponse<IMinesCashoutResponse>> => {
  return await axiosInstance.post(MinesEndpoints.cashout, body)
}
export const autoBetRequest = async (
  body: IMinesStart
): Promise<AxiosResponse<IMinesCashoutResponse>> => {
  return await axiosInstance.post(MinesEndpoints.autoBet, body)
}
export const activeGameRequest = async (): Promise<AxiosResponse<IMinesCashoutResponse>> => {
  return await axiosInstance.get(MinesEndpoints.activeGame)
}
