import { parseAbi } from 'viem'

/**
 * Official Circle USDC on Injective EVM Testnet
 * Get testnet USDC: https://faucet.circle.com/
 */
export const USDC_TESTNET_ADDRESS =
  '0x0C382e685bbeeFE5d3d9C29e29E341fEE8E84C5d' as const

/**
 * USDCVault — deployed on Injective EVM Testnet (Chain ID: 1439)
 * Explorer: https://testnet.blockscout.injective.network/address/0xc79efba3814eedb4b8b85651bc6668198e46ac5a
 */
export const VAULT_ADDRESS = (
  import.meta.env.VITE_VAULT_ADDRESS ||
  '0xc79efba3814eedb4b8b85651bc6668198e46ac5a'
) as `0x${string}`

export const CONTRACT_ADDRESSES = {
  USDC: (import.meta.env.VITE_USDC_ADDRESS ||
    USDC_TESTNET_ADDRESS) as `0x${string}`,
  VAULT: VAULT_ADDRESS,
}

// Human-readable ABI (parseAbi is viem's canonical approach — avoids
// internal formatAbiItem quirks with manually-constructed readonly tuples)
export const ERC20_ABI = parseAbi([
  'function balanceOf(address account) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
])

export const VAULT_ABI = parseAbi([
  'function deposit(uint256 amount)',
  'function withdraw(uint256 amount)',
  'function withdrawAll()',
  'function getVaultBalance() view returns (uint256)',
  'function getUserDeposit(address user) view returns (uint256)',
  'function totalDeposited() view returns (uint256)',
  'event Deposited(address indexed user, uint256 amount)',
  'event Withdrawn(address indexed user, uint256 amount)',
])
