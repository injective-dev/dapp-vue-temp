import { computed } from 'vue'
import { useAccount, useBalance, useConnect, useDisconnect, useSwitchChain } from '@wagmi/vue'
import { injectiveTestnet } from '@/config/wagmi'

export function useWallet() {
  const { address, isConnected, isConnecting, chain } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const { switchChain } = useSwitchChain()

  // useBalance: pass address as a getter so it's always reactive
  // The query is disabled when address is undefined, so no crash
  const { data: balance } = useBalance({
    get address() { return address.value },
    get query() { return { enabled: isConnected.value } },
  })

  const isOnCorrectNetwork = computed(
    () => chain.value?.id === injectiveTestnet.id,
  )

  const connectWallet = (connectorIndex = 0) => {
    const connector = connectors.value[connectorIndex]
    if (connector) connect({ connector })
  }

  const switchToInjective = () => {
    switchChain({ chainId: injectiveTestnet.id })
  }

  return {
    address,
    isConnected,
    isConnecting,
    chain,
    balance,
    connectors,
    isOnCorrectNetwork,
    connectWallet,
    disconnect,
    switchToInjective,
  }
}
