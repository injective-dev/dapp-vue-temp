<script setup lang="ts">
import { ref, watch } from 'vue'
import { useUSDCVault } from '@/composables/useUSDCVault'
import { useWallet } from '@/composables/useWallet'

const EXPLORER = 'https://testnet.blockscout.injective.network'

const { isConnected, isOnCorrectNetwork } = useWallet()
const {
  usdcBalanceFormatted,
  userDepositFormatted,
  vaultBalanceFormatted,
  deposit,
  withdraw,
  withdrawAll,
  isLoading,
  isTxPending,
  isTxSuccess,
  error,
  txHash,
} = useUSDCVault()

const depositAmount = ref('')
const withdrawAmount = ref('')
const lastAction = ref<'deposit' | 'withdraw' | null>(null)

// Clear inputs on success
watch(isTxSuccess, (confirmed) => {
  if (confirmed) {
    if (lastAction.value === 'deposit') depositAmount.value = ''
    if (lastAction.value === 'withdraw') withdrawAmount.value = ''
  }
})

const busy = ref(false)
watch([isLoading, isTxPending], ([l, p]) => { busy.value = l || p })

async function handleDeposit() {
  lastAction.value = 'deposit'
  try { await deposit(depositAmount.value) } catch { /* shown in banner */ }
}

async function handleWithdraw() {
  lastAction.value = 'withdraw'
  try { await withdraw(withdrawAmount.value) } catch { /* shown in banner */ }
}

async function handleWithdrawAll() {
  lastAction.value = 'withdraw'
  try { await withdrawAll() } catch { /* shown in banner */ }
}
</script>

<template>
  <!-- Not connected -->
  <div v-if="!isConnected" class="card flex items-center justify-center min-h-[120px]">
    <p class="text-inj-muted font-marist text-body-md">Connect your wallet to use the vault</p>
  </div>

  <!-- Wrong network -->
  <div v-else-if="!isOnCorrectNetwork" class="card border-inj-amber/40 text-inj-amber text-center">
    Switch to Injective Testnet to continue
  </div>

  <div v-else class="space-y-inj-lg">

    <!-- ── Vault Stats ── -->
    <div class="card">
      <h2 class="font-marist text-xl font-bold text-inj-snow mb-inj-md">USDC Vault</h2>
      <div class="grid grid-cols-3 gap-3">
        <!-- Wallet balance -->
        <div class="card-inner">
          <p class="font-whyte text-label-sm text-inj-muted mb-1">Your Wallet</p>
          <p class="font-marist text-lg font-bold text-inj-snow">
            {{ parseFloat(usdcBalanceFormatted).toFixed(2) }}
          </p>
          <p class="font-whyte text-label-xs text-inj-muted">USDC</p>
        </div>
        <!-- User deposit -->
        <div class="card-inner border-inj-lime/30">
          <p class="font-whyte text-label-sm text-inj-muted mb-1">Your Deposit</p>
          <p class="font-marist text-lg font-bold text-inj-lime">
            {{ parseFloat(userDepositFormatted).toFixed(2) }}
          </p>
          <p class="font-whyte text-label-xs text-inj-muted">USDC</p>
        </div>
        <!-- Total in vault -->
        <div class="card-inner border-inj-ocean/30">
          <p class="font-whyte text-label-sm text-inj-muted mb-1">Total in Vault</p>
          <p class="font-marist text-lg font-bold text-inj-ocean">
            {{ parseFloat(vaultBalanceFormatted).toFixed(2) }}
          </p>
          <p class="font-whyte text-label-xs text-inj-muted">USDC</p>
        </div>
      </div>

      <!-- Faucet link -->
      <a href="https://faucet.circle.com/" target="_blank" rel="noopener noreferrer"
        class="flex items-center justify-center gap-2 w-full mt-inj-md border border-inj-border rounded-inj-md py-2.5 font-whyte text-label-sm text-inj-muted hover:border-inj-ocean/50 hover:text-inj-snow transition-colors">
        <span class="text-inj-lime">💧</span>
        Get Testnet USDC — Circle Faucet
        <svg class="w-3 h-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </a>
    </div>

    <!-- ── TX Banners ── -->
    <div v-if="txHash && isTxPending" class="banner-pending flex items-center gap-2">
      <svg class="w-4 h-4 animate-spin flex-shrink-0" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
      </svg>
      <span>
        Waiting for confirmation…
        <a :href="`${EXPLORER}/tx/${txHash}`" target="_blank" rel="noopener noreferrer"
          class="underline font-semibold hover:opacity-80">View tx →</a>
      </span>
    </div>

    <div v-if="txHash && isTxSuccess" class="banner-success space-y-1">
      <div class="flex items-center gap-2">
        <span>✅</span>
        <span class="font-semibold">
          Transaction confirmed!
          <a :href="`${EXPLORER}/tx/${txHash}`" target="_blank" rel="noopener noreferrer"
            class="underline hover:opacity-80">View on Explorer →</a>
        </span>
      </div>
      <p class="font-mono text-xs opacity-70 break-all pl-6">{{ txHash }}</p>
    </div>

    <div v-if="error" class="banner-error">{{ error }}</div>

    <!-- ── Deposit ── -->
    <div class="card">
      <h3 class="font-marist text-lg font-bold text-inj-snow mb-inj-md">Deposit USDC</h3>
      <form @submit.prevent="handleDeposit" class="space-y-inj-md">
        <div>
          <label class="block font-whyte text-label-sm text-inj-muted mb-2">Amount (USDC)</label>
          <input
            v-model="depositAmount"
            type="text" inputmode="decimal" placeholder="0.00" required
            :disabled="busy" class="input-dark"
          />
          <p class="font-whyte text-label-xs text-inj-muted mt-1">
            Wallet: {{ parseFloat(usdcBalanceFormatted).toFixed(2) }} USDC available
          </p>
        </div>
        <button type="submit" :disabled="busy || !depositAmount" class="btn-primary w-full">
          <span v-if="isLoading && lastAction === 'deposit'">Sending…</span>
          <span v-else-if="isTxPending && lastAction === 'deposit'">Confirming…</span>
          <span v-else>Deposit {{ depositAmount || '0' }} USDC</span>
        </button>
      </form>
    </div>

    <!-- ── Withdraw ── -->
    <div class="card">
      <h3 class="font-marist text-lg font-bold text-inj-snow mb-inj-md">Withdraw USDC</h3>
      <form @submit.prevent="handleWithdraw" class="space-y-inj-md">
        <div>
          <label class="block font-whyte text-label-sm text-inj-muted mb-2">Amount (USDC)</label>
          <input
            v-model="withdrawAmount"
            type="text" inputmode="decimal" placeholder="0.00" required
            :disabled="busy" class="input-dark"
          />
          <p class="font-whyte text-label-xs text-inj-muted mt-1">
            Available: {{ parseFloat(userDepositFormatted).toFixed(2) }} USDC in vault
          </p>
        </div>
        <div class="flex gap-inj-sm">
          <button type="submit" :disabled="busy || !withdrawAmount" class="btn-primary flex-1">
            <span v-if="isLoading && lastAction === 'withdraw'">Sending…</span>
            <span v-else-if="isTxPending && lastAction === 'withdraw'">Confirming…</span>
            <span v-else>Withdraw {{ withdrawAmount || '0' }} USDC</span>
          </button>
          <button type="button" @click="handleWithdrawAll"
            :disabled="busy || parseFloat(userDepositFormatted) === 0"
            class="btn-secondary px-inj-lg">
            All
          </button>
        </div>
      </form>
    </div>

  </div>
</template>
