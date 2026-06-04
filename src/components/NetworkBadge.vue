<script setup lang="ts">
import { useWallet } from '@/composables/useWallet'
import { injectiveTestnet } from '@/config/client'

const { chainId, isConnected, isOnCorrectNetwork } = useWallet()
</script>

<template>
  <span v-if="isConnected"
    :class="[
      'inline-flex items-center gap-1.5 px-3 py-1 rounded-inj-full font-whyte text-label-sm font-medium border',
      isOnCorrectNetwork
        ? 'bg-inj-green/20 border-inj-green/40 text-inj-lime'
        : 'bg-red-900/40 border-red-600/40 text-red-400'
    ]"
  >
    <span :class="['w-1.5 h-1.5 rounded-full', isOnCorrectNetwork ? 'bg-inj-lime' : 'bg-red-400']" />
    {{ isOnCorrectNetwork ? 'Injective Testnet' : 'Wrong Network' }}
  </span>
</template>
