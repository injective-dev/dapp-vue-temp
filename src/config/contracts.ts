/**
 * Official Circle USDC on Injective EVM Testnet
 * Get testnet USDC: https://faucet.circle.com/
 */
export const USDC_TESTNET_ADDRESS = '0x0C382e685bbeeFE5d3d9C29e29E341fEE8E84C5d' as const

/**
 * USDCVault — deployed on Injective EVM Testnet (Chain ID: 1439)
 * Explorer: https://testnet.blockscout.injective.network/address/0xc79efba3814eedb4b8b85651bc6668198e46ac5a
 */
export const VAULT_ADDRESS = (
  import.meta.env.VITE_VAULT_ADDRESS || '0xc79efba3814eedb4b8b85651bc6668198e46ac5a'
) as `0x${string}`

export const CONTRACT_ADDRESSES = {
  USDC: (import.meta.env.VITE_USDC_ADDRESS || USDC_TESTNET_ADDRESS) as `0x${string}`,
  VAULT: VAULT_ADDRESS,
}

export const IS_CONTRACT_CONFIGURED =
  VAULT_ADDRESS !== '0x0000000000000000000000000000000000000000' &&
  VAULT_ADDRESS !== ('0x' as `0x${string}`)

export const ERC20_ABI = [
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'allowance',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const

export const VAULT_ABI = [
  {
    name: 'deposit',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'amount', type: 'uint256' }],
    outputs: [],
  },
  {
    name: 'withdraw',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'amount', type: 'uint256' }],
    outputs: [],
  },
  {
    name: 'withdrawAll',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: [],
  },
  {
    name: 'getVaultBalance',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'getUserDeposit',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'totalDeposited',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'Deposited',
    type: 'event',
    inputs: [
      { name: 'user', type: 'address', indexed: true },
      { name: 'amount', type: 'uint256', indexed: false },
    ],
  },
  {
    name: 'Withdrawn',
    type: 'event',
    inputs: [
      { name: 'user', type: 'address', indexed: true },
      { name: 'amount', type: 'uint256', indexed: false },
    ],
  },
] as const
