import { createPublicClient, http, defineChain } from 'viem'

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

// Public client for reading — no wallet needed
export const publicClient = createPublicClient({
  chain: injectiveTestnet,
  transport: http(import.meta.env.VITE_RPC_URL || 'https://k8s.testnet.json-rpc.injective.network/'),
})
