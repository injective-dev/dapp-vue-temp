import { createConfig, http } from '@wagmi/core'
import { defineChain } from 'viem'
import { injected, metaMask } from '@wagmi/core/connectors'

export const injectiveTestnet = defineChain({
  id: 1439,
  name: 'Injective Testnet',
  nativeCurrency: { name: 'Injective', symbol: 'INJ', decimals: 18 },
  rpcUrls: {
    default: {
      http: [import.meta.env.VITE_RPC_URL || 'https://k8s.testnet.json-rpc.injective.network/'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Injective Testnet Explorer',
      url: 'https://testnet.blockscout.injective.network/',
    },
  },
  testnet: true,
})

export const wagmiConfig = createConfig({
  chains: [injectiveTestnet],
  connectors: [injected(), metaMask()],
  transports: {
    [injectiveTestnet.id]: http(),
  },
})
