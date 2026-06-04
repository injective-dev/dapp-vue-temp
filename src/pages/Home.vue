<script setup lang="ts">
import { RouterLink } from 'vue-router'
import ConnectWallet from '@/components/ConnectWallet.vue'
import { useWallet } from '@/composables/useWallet'

const { isConnected } = useWallet()

const features = [
  {
    tag: 'Vault',
    title: 'USDC Vault',
    desc: 'Deposit and withdraw USDC on Injective EVM testnet. Contract already deployed — no setup needed.',
  },
  {
    tag: 'AI',
    title: 'MCP Integration',
    desc: 'Connect AI assistants to Injective via the MCP server for natural language on-chain operations.',
  },
  {
    tag: 'Frontend',
    title: 'Vue 3 + wagmi',
    desc: 'Vite, Vue 3, TypeScript, Tailwind CSS. Pre-configured for Injective EVM testnet.',
  },
  {
    tag: 'Contracts',
    title: 'Hardhat Ready',
    desc: 'Solidity contracts with deploy scripts and tests. Vault already deployed on testnet.',
  },
]
</script>

<template>
  <div class="min-h-screen bg-inj-dark">
    <!-- Nav -->
    <nav class="border-b border-inj-border bg-inj-midnight/80 backdrop-blur-sm sticky top-0 z-10">
      <div class="max-w-5xl mx-auto px-inj-lg h-16 flex items-center justify-between">
        <span class="font-marist font-bold text-inj-snow text-lg tracking-tight">
          Injective dApp
        </span>
        <ConnectWallet />
      </div>
    </nav>

    <!-- Hero -->
    <section class="bg-gradient-to-br from-inj-midnight via-inj-dark to-inj-dark border-b border-inj-border">
      <div class="max-w-5xl mx-auto px-inj-lg py-24 md:py-32">
        <span class="tag-builder mb-inj-lg inline-flex">⚡ Testnet Ready</span>
        <h1 class="font-marist text-display font-bold text-inj-snow leading-[1.1] mb-inj-lg max-w-2xl">
          Build on Injective.<br />Ship faster.
        </h1>
        <p class="font-marist text-body-md text-inj-muted max-w-xl mb-inj-xl">
          A production-ready Vue 3 starter with a deployed USDC Vault contract and
          Injective MCP integration. Clone and run.
        </p>
        <div class="flex flex-wrap gap-inj-sm items-center">
          <RouterLink v-if="isConnected" to="/dashboard" class="btn-primary">
            Open Dashboard →
          </RouterLink>
          <ConnectWallet v-else />
          <a href="https://github.com/injective-dev/dapp-vue-template" target="_blank"
            rel="noopener noreferrer"
            class="px-inj-md py-inj-sm rounded-inj-md font-marist text-body-md font-medium border border-inj-border text-inj-muted hover:border-inj-ocean/60 hover:text-inj-snow transition-colors">
            View on GitHub
          </a>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section class="max-w-5xl mx-auto px-inj-lg py-16">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-inj-md">
        <div v-for="f in features" :key="f.title" class="card hover:border-inj-ocean/40 transition-colors">
          <span class="tag-builder mb-inj-md inline-flex">{{ f.tag }}</span>
          <h3 class="font-marist text-lg font-bold text-inj-snow mb-2">{{ f.title }}</h3>
          <p class="font-marist text-body-md text-inj-muted leading-relaxed">{{ f.desc }}</p>
        </div>
      </div>
    </section>

    <!-- Quick Start -->
    <section class="max-w-5xl mx-auto px-inj-lg pb-24">
      <h2 class="font-marist text-2xl font-bold text-inj-snow mb-inj-lg">Quick Start</h2>
      <div class="bg-inj-midnight border border-inj-border rounded-inj-md p-inj-xl overflow-x-auto">
        <pre class="font-mono text-sm text-inj-snow space-y-1"><span class="text-inj-muted"># 1. Clone the repo</span>
git clone https://github.com/&lt;you&gt;/&lt;your-repo&gt; &amp;&amp; cd &lt;your-repo&gt;

<span class="text-inj-muted"># 2. Install and run — no contract deployment needed!</span>
npm install &amp;&amp; npm run dev

<span class="text-inj-lime"># ✅ Vault contract already deployed on Injective EVM Testnet</span></pre>
      </div>
    </section>

    <!-- Footer -->
    <footer class="border-t border-inj-border">
      <div class="max-w-5xl mx-auto px-inj-lg h-14 flex items-center justify-between">
        <span class="font-whyte text-label-sm text-inj-muted">MIT © Chuhan Jin</span>
        <div class="flex items-center gap-inj-lg">
          <a v-for="l in [
              { label: 'Docs', href: 'https://docs.injective.network/' },
              { label: 'Explorer', href: 'https://testnet.blockscout.injective.network/' },
              { label: 'MCP', href: 'https://github.com/InjectiveLabs/mcp-server' },
            ]"
            :key="l.label" :href="l.href" target="_blank" rel="noopener noreferrer"
            class="font-whyte text-label-sm text-inj-muted hover:text-inj-snow transition-colors">
            {{ l.label }}
          </a>
        </div>
      </div>
    </footer>
  </div>
</template>
