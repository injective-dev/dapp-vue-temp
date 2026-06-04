import { ref, computed, watch } from 'vue'
import { parseUnits, formatUnits, maxUint256 } from 'viem'

// Safe BigInt conversion — prevents formatUnits from crashing if RPC
// returns an unexpected type (string instead of bigint, etc.)
function toBigInt(val: unknown): bigint {
  if (typeof val === 'bigint') return val
  if (typeof val === 'string') return BigInt(val)
  if (typeof val === 'number') return BigInt(Math.floor(val))
  return 0n
}
import { publicClient } from '@/config/client'
import { CONTRACT_ADDRESSES, ERC20_ABI, VAULT_ABI } from '@/config/contracts'
import { useWallet, getWalletClient } from './useWallet'

export function useUSDCVault() {
  const { address, isConnected } = useWallet()

  const usdcBalance = ref(0n)
  const userDeposit = ref(0n)
  const vaultBalance = ref(0n)

  const txHash = ref<`0x${string}` | undefined>()
  const isLoading = ref(false)
  const isTxPending = ref(false)
  const isTxSuccess = ref(false)
  const error = ref<string | null>(null)

  // ── Fetch all balances ──────────────────────────────────────────────────
  async function fetchVaultBalance() {
    try {
      const bal = await publicClient.readContract({
        address: CONTRACT_ADDRESSES.VAULT,
        abi: VAULT_ABI,
        functionName: 'getVaultBalance',
      })
      vaultBalance.value = toBigInt(bal)
    } catch { /* silent */ }
  }

  async function fetchUserBalances(addr: `0x${string}`) {
    try {
      const [usdc, deposit] = await Promise.all([
        publicClient.readContract({
          address: CONTRACT_ADDRESSES.USDC,
          abi: ERC20_ABI,
          functionName: 'balanceOf',
          args: [addr],
        }),
        publicClient.readContract({
          address: CONTRACT_ADDRESSES.VAULT,
          abi: VAULT_ABI,
          functionName: 'getUserDeposit',
          args: [addr],
        }),
      ])
      usdcBalance.value = toBigInt(usdc)
      userDeposit.value = toBigInt(deposit)
    } catch { /* silent */ }
  }

  async function refetchAll() {
    await fetchVaultBalance()
    if (address.value) await fetchUserBalances(address.value)
  }

  // Auto-fetch when wallet connects or changes
  watch(address, (addr) => {
    if (addr) {
      fetchUserBalances(addr)
      fetchVaultBalance()
    } else {
      usdcBalance.value = 0n
      userDeposit.value = 0n
    }
  }, { immediate: true })

  // Also fetch vault balance on mount even before wallet connects
  fetchVaultBalance()

  // ── Send tx helper ──────────────────────────────────────────────────────
  async function sendTx(
    contractAddress: `0x${string}`,
    abi: any,
    functionName: string,
    args?: any[],
  ): Promise<`0x${string}`> {
    const wallet = getWalletClient()
    const [account] = await wallet.getAddresses()

    const hash = await wallet.writeContract({
      address: contractAddress,
      abi,
      functionName,
      args,
      account,
      chain: null, // use already-connected chain
    } as any)

    return hash
  }

  // ── Wait for confirmation + refresh ────────────────────────────────────
  async function waitAndRefresh(hash: `0x${string}`) {
    isTxPending.value = true
    isTxSuccess.value = false
    try {
      await publicClient.waitForTransactionReceipt({ hash })
      isTxSuccess.value = true
      await refetchAll()
    } finally {
      isTxPending.value = false
    }
  }

  // ── Deposit ─────────────────────────────────────────────────────────────
  async function deposit(amountStr: string) {
    if (!address.value) return
    isLoading.value = true
    error.value = null
    isTxSuccess.value = false
    try {
      const amount = parseUnits(amountStr, 6)

      // Check and auto-approve allowance
      const allowance = await publicClient.readContract({
        address: CONTRACT_ADDRESSES.USDC,
        abi: ERC20_ABI,
        functionName: 'allowance',
        args: [address.value, CONTRACT_ADDRESSES.VAULT],
      }) as bigint

      if (allowance < amount) {
        const approveHash = await sendTx(
          CONTRACT_ADDRESSES.USDC, ERC20_ABI, 'approve',
          [CONTRACT_ADDRESSES.VAULT, maxUint256],
        )
        txHash.value = approveHash
        isTxPending.value = true
        await publicClient.waitForTransactionReceipt({ hash: approveHash })
        isTxPending.value = false
      }

      const hash = await sendTx(
        CONTRACT_ADDRESSES.VAULT, VAULT_ABI, 'deposit', [amount],
      )
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

  // ── Withdraw ────────────────────────────────────────────────────────────
  async function withdraw(amountStr: string) {
    isLoading.value = true
    error.value = null
    isTxSuccess.value = false
    try {
      const hash = await sendTx(
        CONTRACT_ADDRESSES.VAULT, VAULT_ABI, 'withdraw',
        [parseUnits(amountStr, 6)],
      )
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

  // ── Withdraw All ────────────────────────────────────────────────────────
  async function withdrawAll() {
    isLoading.value = true
    error.value = null
    isTxSuccess.value = false
    try {
      const hash = await sendTx(
        CONTRACT_ADDRESSES.VAULT, VAULT_ABI, 'withdrawAll',
      )
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
    usdcBalanceFormatted: computed(() => formatUnits(usdcBalance.value, 6)),
    userDepositFormatted: computed(() => formatUnits(userDeposit.value, 6)),
    vaultBalanceFormatted: computed(() => formatUnits(vaultBalance.value, 6)),
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
