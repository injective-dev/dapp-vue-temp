<script setup lang="ts">
import { useWallet } from '@/composables/useWallet'
import { injectiveTestnet } from '@/config/wagmi'

const { chain, isConnected } = useWallet()
</script>

<template>
  <span v-if="isConnected"
    :class="[
      'inline-flex items-center gap-1.5 px-3 py-1 rounded-inj-full font-whyte text-label-sm font-medium border',
      chain?.id === injectiveTestnet.id
        ? 'bg-inj-green/20 border-inj-green/40 text-inj-lime'
        : 'bg-red-900/40 border-red-600/40 text-red-400'
    ]"
  >
    <span :class="['w-1.5 h-1.5 rounded-full', chain?.id === injectiveTestnet.id ? 'bg-inj-lime' : 'bg-red-400']" />
    {{ chain?.id === injectiveTestnet.id ? chain?.name : 'Wrong Network' }}
  </span>
</template>
