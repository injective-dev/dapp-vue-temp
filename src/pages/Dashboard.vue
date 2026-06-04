<script setup lang="ts">
import { RouterLink } from 'vue-router'
import ConnectWallet from '@/components/ConnectWallet.vue'
import NetworkBadge from '@/components/NetworkBadge.vue'
import VaultForm from '@/components/VaultForm.vue'
import { useWallet } from '@/composables/useWallet'

const { isConnected, address, balance } = useWallet()
</script>

<template>
  <div class="min-h-screen bg-inj-dark">
    <!-- Header -->
    <header class="bg-inj-midnight/80 backdrop-blur-sm border-b border-inj-border sticky top-0 z-10">
      <div class="max-w-5xl mx-auto px-inj-lg h-16 flex items-center justify-between">
        <RouterLink to="/"
          class="font-marist font-bold text-inj-snow text-lg tracking-tight hover:text-inj-muted transition-colors">
          Injective dApp
        </RouterLink>
        <div class="flex items-center gap-inj-sm">
          <NetworkBadge />
          <ConnectWallet />
        </div>
      </div>
    </header>

    <main class="max-w-5xl mx-auto px-inj-lg py-inj-xl">
      <!-- Not connected -->
      <div v-if="!isConnected" class="flex flex-col items-center justify-center py-32 gap-inj-lg">
        <p class="font-marist text-body-md text-inj-muted">
          Connect your wallet to access the USDC Vault
        </p>
        <ConnectWallet />
      </div>

      <!-- Connected -->
      <template v-else>
        <!-- Stats row -->
        <div class="grid grid-cols-2 md:grid-cols-3 gap-inj-sm mb-inj-xl">
          <div class="card-outline">
            <p class="font-whyte text-label-sm text-inj-muted mb-1">Wallet</p>
            <p class="font-marist text-sm font-semibold text-inj-ocean font-mono">
              {{ address?.slice(0, 8) }}…{{ address?.slice(-6) }}
            </p>
          </div>
          <div class="card-outline">
            <p class="font-whyte text-label-sm text-inj-muted mb-1">INJ Balance</p>
            <p class="font-marist text-sm font-semibold text-inj-snow">
              {{ balance ? parseFloat(balance.formatted).toFixed(4) : '0' }} INJ
            </p>
          </div>
          <div class="card-outline col-span-2 md:col-span-1">
            <p class="font-whyte text-label-sm text-inj-muted mb-1">Network</p>
            <span class="tag-builder">Injective Testnet</span>
          </div>
        </div>

        <!-- Vault -->
        <div class="max-w-2xl mx-auto">
          <VaultForm />

          <!-- MCP card -->
          <div class="card border-inj-ocean/30 mt-inj-xl">
            <div class="flex items-center gap-inj-sm mb-inj-sm">
              <span class="tag-builder">AI</span>
              <h3 class="font-marist text-base font-bold text-inj-snow">MCP Integration</h3>
            </div>
            <p class="font-marist text-body-md text-inj-muted mb-inj-md">
              Connect Claude, Cursor, or VS Code to Injective via the MCP server
              for natural language on-chain operations.
            </p>
            <a href="https://github.com/InjectiveLabs/mcp-server" target="_blank"
              rel="noopener noreferrer"
              class="font-whyte text-label-sm text-inj-ocean hover:underline">
              Set up MCP →
            </a>
          </div>
        </div>
      </template>
    </main>
  </div>
</template>
