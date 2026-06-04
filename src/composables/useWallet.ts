import { ref, computed, onUnmounted } from 'vue'
import {
  getAccount,
  watchAccount,
  getBalance,
  connect,
  disconnect,
  switchChain,
  type GetAccountReturnType,
} from '@wagmi/core'
import { wagmiConfig, injectiveTestnet } from '@/config/wagmi'

// ── Shared reactive account state (singleton across composable calls) ──────
const account = ref<GetAccountReturnType>(getAccount(wagmiConfig))
const balance = ref<{ formatted: string; symbol: string } | null>(null)

let watcherCount = 0
let unwatch: (() => void) | null = null

function startWatcher() {
  if (unwatch) return
  unwatch = watchAccount(wagmiConfig, {
    onChange(data) {
      account.value = data
      if (data.address) {
        getBalance(wagmiConfig, { address: data.address })
          .then((b) => {
            balance.value = { formatted: b.formatted, symbol: b.symbol }
          })
          .catch(() => { balance.value = null })
      } else {
        balance.value = null
      }
    },
  })
}

function stopWatcher() {
  if (unwatch && watcherCount <= 0) {
    unwatch()
    unwatch = null
  }
}

export function useWallet() {
  watcherCount++
  startWatcher()

  onUnmounted(() => {
    watcherCount--
    stopWatcher()
  })

  const isConnected = computed(() => account.value.isConnected)
  const isConnecting = computed(() => account.value.isConnecting)
  const address = computed(() => account.value.address)
  const chain = computed(() => account.value.chain)
  const isOnCorrectNetwork = computed(
    () => account.value.chain?.id === injectiveTestnet.id,
  )

  const connectWallet = async (connectorIndex = 0) => {
    const connectors = wagmiConfig.connectors
    const connector = connectors[connectorIndex]
    if (connector) await connect(wagmiConfig, { connector })
  }

  const disconnectWallet = async () => {
    await disconnect(wagmiConfig)
  }

  const switchToInjective = async () => {
    await switchChain(wagmiConfig, { chainId: injectiveTestnet.id })
  }

  return {
    address,
    isConnected,
    isConnecting,
    chain,
    balance,
    isOnCorrectNetwork,
    connectWallet,
    disconnect: disconnectWallet,
    switchToInjective,
  }
}
