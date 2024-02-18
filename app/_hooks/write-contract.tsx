import { errorToaster } from '@/app/_utils/truncatedToaster'
import { useWriteContract as writeContract } from 'wagmi'

export const useWriteContract = () =>
  writeContract({
    mutation: {
      onError(error) {
        errorToaster(error)
      },
    },
  })
