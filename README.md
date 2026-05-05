# Web3 Pix — Monorepo

Decentralized payment system inspired by Brazil's Pix. The payee generates a QR Code; the payer scans it and sends stablecoins (USDC/USDT) directly from their wallet — no intermediaries.

**Stack:** Next.js 15 · Node.js + Express · MongoDB · Socket.io · Viem · Hardhat

---

## Requirements

- Node.js 18+
- npm 8+ (workspaces)
- MongoDB running locally (or a remote URI)
- MetaMask (or any EVM wallet) installed in the browser

---

## Installation

```bash
git clone git@github.com:Lkcm/web3-qr-code-payment-generator.git
cd web3-qr-code-payment-generator
npm install
```

`npm install` at the root installs `backend/` and `frontend/` dependencies via workspaces.  
The `blockchain/` package has its own dependencies — install them when using the local network:

```bash
cd blockchain && npm install && cd ..
```

---

## Operation modes

The project supports three modes, controlled by environment variables:

| Mode | `CHAIN` (backend) | `NEXT_PUBLIC_CHAIN_ID` (frontend) | When to use |
|---|---|---|---|
| **Local** | `local` | `31337` | Development — no real gas, no testnet required |
| **Testnet** | `testnet` | `80002` | Testing with a real wallet on Polygon Amoy |
| **Mainnet** | `mainnet` | `137` | Production on Polygon PoS |

---

## Environment variables

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

Edit the copied files according to the mode you want (see sections below).

---

## Local mode (Hardhat) — development

This mode runs a local blockchain with mock USDC and USDT contracts. No real gas or testnet connection required.

### 1. Start the Hardhat node

In a dedicated terminal (keep it running):

```bash
cd blockchain
npx hardhat node
```

The node starts at `http://127.0.0.1:8545` with chainId `31337` and prints 20 accounts with 10,000 ETH each.

### 2. Deploy the mock contracts

In another terminal:

```bash
cd blockchain
npm run deploy
```

The script prints the contract addresses and the exact values to paste into your `.env` files. Example output:

```
USDC deployed: 0x5FbDB2315678afecb367f032d93F642f64180aa3
USDT deployed: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512

--- Copy to backend/.env ---
CHAIN=local
RPC_URL=http://127.0.0.1:8545
USDC_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
USDT_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512

--- Copy to frontend/.env ---
NEXT_PUBLIC_CHAIN_ID=31337
NEXT_PUBLIC_USDC_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
NEXT_PUBLIC_USDT_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
```

Paste those values into the respective `.env` / `.env.local`.

> Contract addresses change every time the node restarts and the deploy is re-run.

### 3. Configure MetaMask for the local network

Add the network manually in MetaMask:

| Field | Value |
|---|---|
| Network name | Hardhat Local |
| RPC URL | `http://127.0.0.1:8545` |
| Chain ID | `31337` |
| Currency symbol | ETH |

Import one of the Hardhat accounts using the private key printed in the `npx hardhat node` terminal. The first account (`0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`) already has 10,000 USDC and 10,000 USDT minted by the deploy script.

### 4. Start MongoDB

```bash
mongod
```

The default URI is `mongodb://localhost:27017/web3payments`.

### 5. Run the project

```bash
npm run dev
```

- Frontend: http://localhost:3000
- Backend: http://localhost:3001

---

## Testnet mode (Polygon Amoy)

### backend/.env

```env
PORT=3001
FRONTEND_URL=http://localhost:3000
MONGODB_URI=mongodb://localhost:27017/web3payments
CHAIN=testnet
RPC_URL=
USDC_ADDRESS=0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582
USDT_ADDRESS=
```

### frontend/.env.local

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_SOCKET_URL=http://localhost:3001
NEXT_PUBLIC_CHAIN_ID=80002
NEXT_PUBLIC_USDC_ADDRESS=0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582
NEXT_PUBLIC_USDT_ADDRESS=
```

You need MATIC on Amoy to pay for gas. Faucet: https://faucet.polygon.technology

---

## Mainnet mode (Polygon PoS)

### backend/.env

```env
PORT=3001
FRONTEND_URL=http://localhost:3000
MONGODB_URI=<your_mongo_uri>
CHAIN=mainnet
RPC_URL=
USDC_ADDRESS=0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359
USDT_ADDRESS=0xc2132D05D31c914a87C6611C10748AEb04B58e8F
```

### frontend/.env.local

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_SOCKET_URL=http://localhost:3001
NEXT_PUBLIC_CHAIN_ID=137
NEXT_PUBLIC_USDC_ADDRESS=0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359
NEXT_PUBLIC_USDT_ADDRESS=0xc2132D05D31c914a87C6611C10748AEb04B58e8F
```

---

## Useful commands

```bash
# Run everything together
npm run dev

# Run separately
npm run dev:backend    # http://localhost:3001
npm run dev:frontend   # http://localhost:3000

# Production build
npm run build
npm run start

# Hardhat local node (run inside blockchain/)
npx hardhat node

# Deploy mock contracts (run inside blockchain/)
npm run deploy
```

---

## Monorepo structure

```
/
├── backend/          # Node.js + Express + Socket.io
├── frontend/         # Next.js 15
├── blockchain/       # Hardhat + mock contracts (local dev)
├── package.json      # Workspace root
└── README.md
```
