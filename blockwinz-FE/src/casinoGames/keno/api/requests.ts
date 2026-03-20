import axiosInstance from '@/lib/axios'
import { KenoBetRequest, KenoEndpoints, KenoBetResponse } from './types'

export const postBetRequest = async (request: KenoBetRequest): Promise<KenoBetResponse> => {
  const response = await axiosInstance.post<KenoBetResponse>(KenoEndpoints.Bet, request)

  return response.data
}
