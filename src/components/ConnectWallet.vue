<script setup lang="ts">
import { useWallet } from '@/composables/useWallet'

const {
  address,
  isConnected,
  isConnecting,
  balance,
  isOnCorrectNetwork,
  connectWallet,
  disconnect,
  switchToInjective,
} = useWallet()
</script>

<template>
  <!-- Wrong network -->
  <button v-if="isConnected && !isOnCorrectNetwork"
    @click="switchToInjective"
    class="btn-primary bg-amber-600 hover:bg-amber-500">
    Switch to Injective Testnet
  </button>

  <!-- Connected -->
  <div v-else-if="isConnected && address" class="flex items-center gap-inj-sm">
    <div class="flex flex-col px-inj-md py-1.5 bg-inj-navy border border-inj-border rounded-inj-md">
      <span class="font-whyte text-label-xs text-inj-muted">Balance</span>
      <span class="font-marist text-sm font-semibold text-inj-snow">
        {{ balance.value?.formatted ?? '0' }} INJ
      </span>
    </div>
    <div class="flex flex-col px-inj-md py-1.5 bg-inj-navy border border-inj-border rounded-inj-md">
      <span class="font-whyte text-label-xs text-inj-muted">Address</span>
      <span class="font-marist text-sm font-semibold text-inj-ocean font-mono">
        {{ address.slice(0, 6) }}…{{ address.slice(-4) }}
      </span>
    </div>
    <button @click="disconnect()"
      class="px-inj-md py-inj-sm rounded-inj-md font-marist text-sm font-medium
             border border-inj-border text-inj-muted
             hover:border-red-600/50 hover:text-red-400 transition-colors">
      Disconnect
    </button>
  </div>

  <!-- Not connected -->
  <button v-else @click="connectWallet" :disabled="isConnecting" class="btn-primary">
    {{ isConnecting ? 'Connecting…' : 'Connect Wallet' }}
  </button>
</template>
