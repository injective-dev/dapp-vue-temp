import { ref, computed } from 'vue'
import { createWalletClient, custom, formatEther, getAddress } from 'viem'
import { injectiveTestnet, publicClient } from '@/config/client'

// ── Module-level shared state (singleton) ────────────────────────────────────
// All state is declared once here and shared across all useWallet() calls.
const address = ref<`0x${string}` | undefined>()
const chainId = ref<number | undefined>()
const injBalance = ref<string>('0')
const isConnecting = ref(false)

const isConnected = computed(() => !!address.value)
const isOnCorrectNetwork = computed(() => chainId.value === injectiveTestnet.id)
const balance = computed(() => ({ formatted: injBalance.value, symbol: 'INJ' }))

// ── Wallet client factory ────────────────────────────────────────────────────
export function getWalletClient() {
  const eth = (window as any).ethereum
  if (!eth) throw new Error('No wallet detected. Please install MetaMask.')
  return createWalletClient({ chain: injectiveTestnet, transport: custom(eth) })
}

// ── Balance fetch ────────────────────────────────────────────────────────────
async function fetchBalance(addr: `0x${string}`) {
  try {
    const bal = await publicClient.getBalance({ address: addr })
    injBalance.value = parseFloat(formatEther(bal)).toFixed(4)
  } catch {
    injBalance.value = '0'
  }
}

// ── Event handlers ───────────────────────────────────────────────────────────
function handleAccountsChanged(accounts: string[]) {
  if (!accounts || accounts.length === 0) {
    address.value = undefined
    injBalance.value = '0'
  } else {
    try {
      address.value = getAddress(accounts[0]) as `0x${string}`
      fetchBalance(address.value)
    } catch {
      address.value = undefined
    }
  }
}

function handleChainChanged(newChainId: string) {
  chainId.value = parseInt(newChainId, 16)
}

// ── Register listeners ONCE at module level ──────────────────────────────────
// Do NOT use onMounted/onUnmounted — those fire per-component and would
// unregister listeners when the first component unmounts.
function initEthereumListeners() {
  const eth = (window as any).ethereum
  if (!eth) return

  eth.on('accountsChanged', handleAccountsChanged)
  eth.on('chainChanged', handleChainChanged)

  // Restore existing session silently (no popup)
  eth.request({ method: 'eth_accounts' })
    .then((accounts: string[]) => {
      if (accounts && accounts.length > 0) {
        try {
          address.value = getAddress(accounts[0]) as `0x${string}`
          fetchBalance(address.value)
        } catch { /* ignore invalid address */ }
      }
    })
    .catch(() => { /* no wallet or not permitted */ })

  eth.request({ method: 'eth_chainId' })
    .then((id: string) => { chainId.value = parseInt(id, 16) })
    .catch(() => {})
}

// Run once when module loads
if (typeof window !== 'undefined') {
  // Defer to ensure window.ethereum is injected by browser extension
  setTimeout(initEthereumListeners, 100)
}

// ── Public composable ────────────────────────────────────────────────────────
export function useWallet() {
  const connectWallet = async () => {
    const eth = (window as any).ethereum
    if (!eth) {
      alert('Please install MetaMask to connect.')
      return
    }
    isConnecting.value = true
    try {
      const accounts: string[] = await eth.request({ method: 'eth_requestAccounts' })
      if (accounts && accounts.length > 0) {
        address.value = getAddress(accounts[0]) as `0x${string}`
        const id: string = await eth.request({ method: 'eth_chainId' })
        chainId.value = parseInt(id, 16)
        await fetchBalance(address.value)
      }
    } catch (err: any) {
      // User rejected — silent
      console.warn('Wallet connect rejected:', err?.message)
    } finally {
      isConnecting.value = false
    }
  }

  const disconnect = () => {
    address.value = undefined
    injBalance.value = '0'
    chainId.value = undefined
  }

  const switchToInjective = async () => {
    const eth = (window as any).ethereum
    if (!eth) return
    const hexChainId = `0x${injectiveTestnet.id.toString(16)}`
    try {
      await eth.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: hexChainId }],
      })
    } catch (err: any) {
      if (err?.code === 4902) {
        // Chain not in wallet yet — add it
        await eth.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: hexChainId,
            chainName: injectiveTestnet.name,
            nativeCurrency: injectiveTestnet.nativeCurrency,
            rpcUrls: [injectiveTestnet.rpcUrls.default.http[0]],
            blockExplorerUrls: [injectiveTestnet.blockExplorers?.default?.url],
          }],
        })
      }
    }
  }

  return {
    address,        // Ref<`0x${string}` | undefined> — auto-unwrapped in template
    isConnected,    // ComputedRef<boolean>
    isConnecting,   // Ref<boolean>
    isOnCorrectNetwork, // ComputedRef<boolean>
    chainId,        // Ref<number | undefined>
    balance,        // ComputedRef<{formatted: string, symbol: string}> — use balance.formatted in template
    connectWallet,
    disconnect,
    switchToInjective,
  }
}
