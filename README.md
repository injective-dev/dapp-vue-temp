<div align="center">
  <img src="./public/logo.jpg" alt="Logo" width="120" style="border-radius:16px" />

  <h1>Injective dApp Vue Template</h1>
  <p>A minimal Vue 3 starter for building dApps on Injective EVM Testnet.</p>
  <p>
    <strong>Stack:</strong> Vite · Vue 3 · TypeScript · Tailwind CSS · @wagmi/vue · viem
  </p>
  <p>
    <a href="https://docs.injective.network/developers-evm/network-information">Docs</a> ·
    <a href="https://testnet.blockscout.injective.network/">Testnet Explorer</a> ·
    <a href="https://testnet.faucet.injective.network/">Faucet</a>
  </p>
</div>

---

## 🚀 Quick Start

```bash
git clone https://github.com/injective-dev/dapp-vue-template.git my-dapp
cd my-dapp
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) — no contract deployment needed!

---

## 📦 What's Included

### USDC Vault Contract (Already Deployed!)

- ✅ **Deposit USDC** — users deposit Circle USDC into the vault
- ✅ **Withdraw USDC** — users withdraw their own funds anytime
- ✅ **View balance** — total USDC held by the vault, live

**Deployed Contract:**
- **Address:** `0xc79efba3814eedb4b8b85651bc6668198e46ac5a`
- **Network:** Injective EVM Testnet (Chain ID: 1439)
- **Explorer:** [View on Blockscout](https://testnet.blockscout.injective.network/address/0xc79efba3814eedb4b8b85651bc6668198e46ac5a)

### Frontend Features

- **Wallet connection** — MetaMask / injected wallets via `@wagmi/vue`
- **Network detection** — auto-detects Injective Testnet
- **Deposit/Withdraw UI** — reactive forms with live balance display
- **TX status** — pending spinner + confirmed banner with explorer link
- **Auto-refresh** — balances update automatically after confirmation
- **Dark theme** — full night-mode UI

---

## 🛠 Project Structure

```
├── src/
│   ├── composables/         # Vue composables (useWallet, useUSDCVault)
│   ├── components/          # VaultForm, ConnectWallet, NetworkBadge
│   ├── config/              # wagmi config + contract ABIs
│   ├── pages/               # Home.vue, Dashboard.vue
│   ├── main.ts              # App entry
│   └── style.css            # Tailwind + component classes
├── .env.example             # Environment template
└── README.md
```

---

## 🔧 Configuration

`.env` (copy from `.env.example`):

```bash
# Vault is already deployed — just run the app!
VITE_VAULT_ADDRESS=0xc79efba3814eedb4b8b85651bc6668198e46ac5a
```

---

## 💳 Get Testnet Tokens

| Token | Faucet |
|-------|--------|
| INJ (gas) | [testnet.faucet.injective.network](https://testnet.faucet.injective.network/) |
| USDC | [faucet.circle.com](https://faucet.circle.com/) → select Injective |

---

## 🌐 Network Details

| | Testnet |
|---|---|
| **Chain ID** | `1439` |
| **RPC** | `https://k8s.testnet.json-rpc.injective.network/` |
| **Explorer** | [testnet.blockscout.injective.network](https://testnet.blockscout.injective.network/) |
| **USDC** | `0x0C382e685bbeeFE5d3d9C29e29E341fEE8E84C5d` |
| **Vault** | `0xc79efba3814eedb4b8b85651bc6668198e46ac5a` |

---

## 📄 License

MIT
