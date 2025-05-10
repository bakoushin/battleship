import ABI from '../../../backend/abis/Battleship.json'
import { UseReadContractReturnType } from 'wagmi'
const { VITE_BATTLESHIP_ADDR } = import.meta.env

export const GITHUB_REPOSITORY_URL = 'https://github.com/bakoushin/battleship'

export const WAGMI_CONTRACT_CONFIG = {
  address: VITE_BATTLESHIP_ADDR as `0x${string}`,
  abi: ABI,
}

export type WagmiUseReadContractReturnType<
  F extends string,
  R = unknown,
  A extends readonly unknown[] = unknown[]
> = UseReadContractReturnType<typeof ABI, F, A, R | undefined>
