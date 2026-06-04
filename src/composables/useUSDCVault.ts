import { ref, watch, computed } from 'vue'
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from '@wagmi/vue'
import { parseUnits, formatUnits, maxUint256 } from 'viem'
import { CONTRACT_ADDRESSES, ERC20_ABI, VAULT_ABI } from '@/config/contracts'

export function useUSDCVault() {
  const { address } = useAccount()
  const { writeContractAsync } = useWriteContract()

  const txHash = ref<`0x${string}` | undefined>(undefined)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // ── Read: wallet USDC balance ────────────────────────────────────────────
  const { data: usdcBalance, refetch: refetchUsdcBalance } = useReadContract({
    address: CONTRACT_ADDRESSES.USDC,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: computed(() => (address.value ? [address.value] : undefined)) as any,
    query: computed(() => ({ enabled: !!address.value })),
  })

  // ── Read: USDC allowance ─────────────────────────────────────────────────
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: CONTRACT_ADDRESSES.USDC,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: computed(() =>
      address.value ? [address.value, CONTRACT_ADDRESSES.VAULT] : undefined,
    ) as any,
    query: computed(() => ({ enabled: !!address.value })),
  })

  // ── Read: user deposit in vault ──────────────────────────────────────────
  const { data: userDeposit, refetch: refetchUserDeposit } = useReadContract({
    address: CONTRACT_ADDRESSES.VAULT,
    abi: VAULT_ABI,
    functionName: 'getUserDeposit',
    args: computed(() => (address.value ? [address.value] : undefined)) as any,
    query: computed(() => ({ enabled: !!address.value })),
  })

  // ── Read: total vault balance ────────────────────────────────────────────
  const { data: vaultBalance, refetch: refetchVaultBalance } = useReadContract({
    address: CONTRACT_ADDRESSES.VAULT,
    abi: VAULT_ABI,
    functionName: 'getVaultBalance',
  })

  // ── Wait for tx confirmation ─────────────────────────────────────────────
  const { isSuccess: isTxSuccess, isLoading: isTxPending } = useWaitForTransactionReceipt({
    hash: txHash,
  })

  // ── Auto-refetch on confirmation ─────────────────────────────────────────
  watch(isTxSuccess, (confirmed) => {
    if (confirmed) {
      refetchUsdcBalance()
      refetchAllowance()
      refetchUserDeposit()
      refetchVaultBalance()
    }
  })

  // ── Formatters ───────────────────────────────────────────────────────────
  const usdcBalanceFormatted = computed(() =>
    usdcBalance.value ? formatUnits(usdcBalance.value as bigint, 6) : '0',
  )
  const userDepositFormatted = computed(() =>
    userDeposit.value ? formatUnits(userDeposit.value as bigint, 6) : '0',
  )
  const vaultBalanceFormatted = computed(() =>
    vaultBalance.value ? formatUnits(vaultBalance.value as bigint, 6) : '0',
  )

  // ── Deposit ──────────────────────────────────────────────────────────────
  async function deposit(amountStr: string) {
    isLoading.value = true
    error.value = null
    try {
      const amount = parseUnits(amountStr, 6)

      // Auto-approve if needed
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

  // ── Withdraw ─────────────────────────────────────────────────────────────
  async function withdraw(amountStr: string) {
    isLoading.value = true
    error.value = null
    try {
      const amount = parseUnits(amountStr, 6)
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESSES.VAULT,
        abi: VAULT_ABI,
        functionName: 'withdraw',
        args: [amount],
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

  // ── Withdraw All ─────────────────────────────────────────────────────────
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
    // Balances
    usdcBalanceFormatted,
    userDepositFormatted,
    vaultBalanceFormatted,
    // Actions
    deposit,
    withdraw,
    withdrawAll,
    // Tx state
    txHash,
    isTxPending,
    isTxSuccess,
    isLoading,
    error,
  }
}
