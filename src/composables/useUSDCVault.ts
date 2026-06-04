import { ref, watch, computed } from 'vue'
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from '@wagmi/vue'
import { parseUnits, formatUnits, maxUint256 } from 'viem'
import type { Address } from 'viem'
import { CONTRACT_ADDRESSES, ERC20_ABI, VAULT_ABI } from '@/config/contracts'

// Always a valid address — prevents viem from crashing on address.split() when
// wallet is not yet connected (undefined would cause the error)
const ZERO_ADDR = '0x0000000000000000000000000000000000000000' as Address

export function useUSDCVault() {
  const { address, isConnected } = useAccount()
  const { writeContractAsync } = useWriteContract()

  const txHash = ref<`0x${string}` | undefined>(undefined)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Safe address: ALWAYS a valid hex string, never undefined
  // viem validates args before checking enabled, so undefined crashes it
  const safeAddr = computed<Address>(() => address.value ?? ZERO_ADDR)

  // ── Read: wallet USDC balance ──────────────────────────────────────────
  const { data: usdcBalance, refetch: refetchUsdcBalance } = useReadContract({
    address: CONTRACT_ADDRESSES.USDC,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    get args() { return [safeAddr.value] as [Address] },
    get query() { return { enabled: isConnected.value } },
  })

  // ── Read: USDC allowance ───────────────────────────────────────────────
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: CONTRACT_ADDRESSES.USDC,
    abi: ERC20_ABI,
    functionName: 'allowance',
    get args() { return [safeAddr.value, CONTRACT_ADDRESSES.VAULT] as [Address, Address] },
    get query() { return { enabled: isConnected.value } },
  })

  // ── Read: user deposit in vault ────────────────────────────────────────
  const { data: userDeposit, refetch: refetchUserDeposit } = useReadContract({
    address: CONTRACT_ADDRESSES.VAULT,
    abi: VAULT_ABI,
    functionName: 'getUserDeposit',
    get args() { return [safeAddr.value] as [Address] },
    get query() { return { enabled: isConnected.value } },
  })

  // ── Read: total vault balance (no user address needed) ─────────────────
  const { data: vaultBalance, refetch: refetchVaultBalance } = useReadContract({
    address: CONTRACT_ADDRESSES.VAULT,
    abi: VAULT_ABI,
    functionName: 'getVaultBalance',
  })

  // ── Wait for tx confirmation ───────────────────────────────────────────
  const { isSuccess: isTxSuccess, isLoading: isTxPending } =
    useWaitForTransactionReceipt({
      get hash() { return txHash.value },
    })

  // ── Auto-refetch all balances after tx confirmed ───────────────────────
  watch(isTxSuccess, (confirmed) => {
    if (confirmed) {
      refetchUsdcBalance()
      refetchAllowance()
      refetchUserDeposit()
      refetchVaultBalance()
    }
  })

  // ── Formatters ─────────────────────────────────────────────────────────
  const usdcBalanceFormatted = computed(() =>
    usdcBalance.value != null ? formatUnits(usdcBalance.value as bigint, 6) : '0',
  )
  const userDepositFormatted = computed(() =>
    userDeposit.value != null ? formatUnits(userDeposit.value as bigint, 6) : '0',
  )
  const vaultBalanceFormatted = computed(() =>
    vaultBalance.value != null ? formatUnits(vaultBalance.value as bigint, 6) : '0',
  )

  // ── Deposit ────────────────────────────────────────────────────────────
  async function deposit(amountStr: string) {
    isLoading.value = true
    error.value = null
    try {
      const amount = parseUnits(amountStr, 6)

      // Auto-approve if allowance insufficient
      if (!allowance.value || (allowance.value as bigint) < amount) {
        const approveHash = await writeContractAsync({
          address: CONTRACT_ADDRESSES.USDC,
          abi: ERC20_ABI,
          functionName: 'approve',
          args: [CONTRACT_ADDRESSES.VAULT, maxUint256],
        })
        txHash.value = approveHash
        await new Promise((r) => setTimeout(r, 2000))
        await refetchAllowance()
      }

      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESSES.VAULT,
        abi: VAULT_ABI,
        functionName: 'deposit',
        args: [amount],
      })
      txHash.value = hash
      return hash
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Deposit failed'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // ── Withdraw ───────────────────────────────────────────────────────────
  async function withdraw(amountStr: string) {
    isLoading.value = true
    error.value = null
    try {
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESSES.VAULT,
        abi: VAULT_ABI,
        functionName: 'withdraw',
        args: [parseUnits(amountStr, 6)],
      })
      txHash.value = hash
      return hash
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Withdrawal failed'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // ── Withdraw All ───────────────────────────────────────────────────────
  async function withdrawAll() {
    isLoading.value = true
    error.value = null
    try {
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESSES.VAULT,
        abi: VAULT_ABI,
        functionName: 'withdrawAll',
      })
      txHash.value = hash
      return hash
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Withdrawal failed'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return {
    usdcBalanceFormatted,
    userDepositFormatted,
    vaultBalanceFormatted,
    deposit,
    withdraw,
    withdrawAll,
    txHash,
    isTxPending,
    isTxSuccess,
    isLoading,
    error,
  }
}
