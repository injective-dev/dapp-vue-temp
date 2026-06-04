import { ref, computed, watch } from 'vue'
import {
  readContract,
  writeContract,
  waitForTransactionReceipt,
  getAccount,
  watchAccount,
} from '@wagmi/core'
import { parseUnits, formatUnits, maxUint256 } from 'viem'
import { wagmiConfig } from '@/config/wagmi'
import { CONTRACT_ADDRESSES, ERC20_ABI, VAULT_ABI } from '@/config/contracts'

// ── Shared vault state (reactive, updated on account or tx changes) ─────────
const usdcBalance = ref<bigint>(0n)
const userDeposit = ref<bigint>(0n)
const vaultBalance = ref<bigint>(0n)
const currentAddress = ref<`0x${string}` | undefined>(undefined)

async function fetchVaultBalance() {
  try {
    const bal = await readContract(wagmiConfig, {
      address: CONTRACT_ADDRESSES.VAULT,
      abi: VAULT_ABI,
      functionName: 'getVaultBalance',
    })
    vaultBalance.value = bal as bigint
  } catch { /* silent */ }
}

async function fetchUserData(addr: `0x${string}`) {
  try {
    const [usdc, deposit] = await Promise.all([
      readContract(wagmiConfig, {
        address: CONTRACT_ADDRESSES.USDC,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [addr],
      }),
      readContract(wagmiConfig, {
        address: CONTRACT_ADDRESSES.VAULT,
        abi: VAULT_ABI,
        functionName: 'getUserDeposit',
        args: [addr],
      }),
    ])
    usdcBalance.value = usdc as bigint
    userDeposit.value = deposit as bigint
  } catch { /* silent */ }
}

// Watch account changes to refresh data
watchAccount(wagmiConfig, {
  onChange(acc) {
    currentAddress.value = acc.address
    if (acc.address) {
      fetchUserData(acc.address)
      fetchVaultBalance()
    } else {
      usdcBalance.value = 0n
      userDeposit.value = 0n
    }
  },
})

// Initial load
fetchVaultBalance()
const initAcc = getAccount(wagmiConfig)
if (initAcc.address) {
  currentAddress.value = initAcc.address
  fetchUserData(initAcc.address)
}

// ── Composable ───────────────────────────────────────────────────────────────
export function useUSDCVault() {
  const txHash = ref<`0x${string}` | undefined>(undefined)
  const isLoading = ref(false)
  const isTxPending = ref(false)
  const isTxSuccess = ref(false)
  const error = ref<string | null>(null)

  const usdcBalanceFormatted = computed(() => formatUnits(usdcBalance.value, 6))
  const userDepositFormatted = computed(() => formatUnits(userDeposit.value, 6))
  const vaultBalanceFormatted = computed(() => formatUnits(vaultBalance.value, 6))

  async function waitAndRefresh(hash: `0x${string}`) {
    isTxPending.value = true
    isTxSuccess.value = false
    try {
      await waitForTransactionReceipt(wagmiConfig, { hash })
      isTxSuccess.value = true
      // Refresh all balances after confirmation
      if (currentAddress.value) await fetchUserData(currentAddress.value)
      await fetchVaultBalance()
    } finally {
      isTxPending.value = false
    }
  }

  async function deposit(amountStr: string) {
    const addr = currentAddress.value
    if (!addr) return
    isLoading.value = true
    error.value = null
    isTxSuccess.value = false
    try {
      const amount = parseUnits(amountStr, 6)

      // Check allowance
      const allowance = await readContract(wagmiConfig, {
        address: CONTRACT_ADDRESSES.USDC,
        abi: ERC20_ABI,
        functionName: 'allowance',
        args: [addr, CONTRACT_ADDRESSES.VAULT],
      }) as bigint

      // Auto-approve if needed
      if (allowance < amount) {
        const approveHash = await writeContract(wagmiConfig, {
          address: CONTRACT_ADDRESSES.USDC,
          abi: ERC20_ABI,
          functionName: 'approve',
          args: [CONTRACT_ADDRESSES.VAULT, maxUint256],
        })
        txHash.value = approveHash
        await waitForTransactionReceipt(wagmiConfig, { hash: approveHash })
      }

      const hash = await writeContract(wagmiConfig, {
        address: CONTRACT_ADDRESSES.VAULT,
        abi: VAULT_ABI,
        functionName: 'deposit',
        args: [amount],
      })
      txHash.value = hash
      await waitAndRefresh(hash)
      return hash
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Deposit failed'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function withdraw(amountStr: string) {
    isLoading.value = true
    error.value = null
    isTxSuccess.value = false
    try {
      const hash = await writeContract(wagmiConfig, {
        address: CONTRACT_ADDRESSES.VAULT,
        abi: VAULT_ABI,
        functionName: 'withdraw',
        args: [parseUnits(amountStr, 6)],
      })
      txHash.value = hash
      await waitAndRefresh(hash)
      return hash
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Withdrawal failed'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function withdrawAll() {
    isLoading.value = true
    error.value = null
    isTxSuccess.value = false
    try {
      const hash = await writeContract(wagmiConfig, {
        address: CONTRACT_ADDRESSES.VAULT,
        abi: VAULT_ABI,
        functionName: 'withdrawAll',
      })
      txHash.value = hash
      await waitAndRefresh(hash)
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
