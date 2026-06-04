import { ref, computed, onMounted, onUnmounted } from 'vue'
import { createWalletClient, custom, formatEther, getAddress } from 'viem'
import { injectiveTestnet, publicClient } from '@/config/client'

// ── Shared reactive wallet state ─────────────────────────────────────────────
const address = ref<`0x${string}` | undefined>()
const chainId = ref<number | undefined>()
const injBalance = ref<string>('0')
const isConnecting = ref(false)

const isConnected = computed(() => !!address.value)
const isOnCorrectNetwork = computed(() => chainId.value === injectiveTestnet.id)

// ── Wallet client (created on connect) ───────────────────────────────────────
export function getWalletClient() {
  const eth = (window as any).ethereum
  if (!eth) throw new Error('No wallet detected. Please install MetaMask.')
  return createWalletClient({
    chain: injectiveTestnet,
    transport: custom(eth),
  })
}

// ── Fetch INJ balance ────────────────────────────────────────────────────────
async function fetchBalance(addr: `0x${string}`) {
  try {
    const bal = await publicClient.getBalance({ address: addr })
    injBalance.value = parseFloat(formatEther(bal)).toFixed(4)
  } catch {
    injBalance.value = '0'
  }
}

// ── Account/chain event handlers ─────────────────────────────────────────────
function handleAccountsChanged(accounts: string[]) {
  if (accounts.length === 0) {
    address.value = undefined
    injBalance.value = '0'
  } else {
    address.value = getAddress(accounts[0]) as `0x${string}`
    fetchBalance(address.value)
  }
}

function handleChainChanged(newChainId: string) {
  chainId.value = parseInt(newChainId, 16)
}

// ── Composable ────────────────────────────────────────────────────────────────
export function useWallet() {
  const eth = (window as any).ethereum

  onMounted(() => {
    if (!eth) return
    eth.on('accountsChanged', handleAccountsChanged)
    eth.on('chainChanged', handleChainChanged)

    // Restore session if already connected
    eth.request({ method: 'eth_accounts' }).then((accounts: string[]) => {
      if (accounts.length > 0) {
        address.value = getAddress(accounts[0]) as `0x${string}`
        fetchBalance(address.value)
        eth.request({ method: 'eth_chainId' }).then((id: string) => {
          chainId.value = parseInt(id, 16)
        })
      }
    })
  })

  onUnmounted(() => {
    if (!eth) return
    eth.removeListener('accountsChanged', handleAccountsChanged)
    eth.removeListener('chainChanged', handleChainChanged)
  })

  const connectWallet = async () => {
    const eth = (window as any).ethereum
    if (!eth) {
      alert('Please install MetaMask to connect.')
      return
    }
    isConnecting.value = true
    try {
      const accounts: string[] = await eth.request({ method: 'eth_requestAccounts' })
      address.value = getAddress(accounts[0]) as `0x${string}`
      const id: string = await eth.request({ method: 'eth_chainId' })
      chainId.value = parseInt(id, 16)
      await fetchBalance(address.value)
    } catch (err) {
      console.error('Connect failed:', err)
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
    try {
      await eth.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${injectiveTestnet.id.toString(16)}` }],
      })
    } catch (err: any) {
      // Chain not added — add it
      if (err.code === 4902) {
        await eth.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: `0x${injectiveTestnet.id.toString(16)}`,
            chainName: injectiveTestnet.name,
            nativeCurrency: injectiveTestnet.nativeCurrency,
            rpcUrls: [injectiveTestnet.rpcUrls.default.http[0]],
            blockExplorerUrls: [injectiveTestnet.blockExplorers.default.url],
          }],
        })
      }
    }
  }

  return {
    address,
    isConnected,
    isConnecting,
    isOnCorrectNetwork,
    chainId,
    balance: computed(() => ({ formatted: injBalance.value, symbol: 'INJ' })),
    connectWallet,
    disconnect,
    switchToInjective,
  }
}
