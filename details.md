# Project Details: SALA (Stellar Arbitrage & Liquidation Assistant)

SALA is a high-performance, production-ready platform designed for the Stellar ecosystem. It combines an advanced frontend dashboard with a powerful Python-based monitoring engine and Soroban smart contracts for atomic trade execution.

## 🚀 Overview

SALA provides users with a comprehensive suite of tools to manage assets on the Stellar network while identifying and executing profitable market opportunities.

- **Arbitrage**: Detects price discrepancies across different liquidity pools and exchanges.
- **Liquidation**: Monitors lending protocols for undercollateralized positions.
- **Portfolio Management**: Real-time balance tracking and asset allocation visualization.
- **Strategy Simulator**: Test arbitrage routes and liquidation scenarios before committing capital.

## 🛠 Tech Stack

### Frontend
- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **Language**: TypeScript
- **State Management**: React Context API (`StellarProvider`)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Blockchain Integration**: 
  - [`@stellar/stellar-sdk`](https://github.com/stellar/js-stellar-sdk)
  - [`@creit.tech/stellar-wallets-kit`](https://github.com/Creit-Tech/Stellar-Wallets-Kit)

### Backend (Monitoring Engine)
- **Language**: Python 3.11+
- **Modules**:
  - `arb_engine.py`: Core logic for detecting arbitrage loops.
  - `liquidation_module.py`: Monitors health factors of loan positions.
  - `execution_engine.py`: Handles transaction submission and batching.
  - `ai_optimizer.py`: Heuristics and optimization for route selection.
  - `risk_manager.py`: Slippage protection and capital exposure limits.

### Smart Contracts
- **Language**: Rust
- **Platform**: [Soroban](https://soroban.stellar.org/) (Stellar's Smart Contract Platform)
- **Contract**: `arb_executor` — Handles atomic multi-hop swaps and liquidations to ensure profitability or rollback.

## 📂 Project Structure

```text
.
├── app/                    # Next.js App Router (Pages & Layouts)
│   ├── arbitrage/          # Arbitrage execution interface
│   ├── simulator/          # Strategy testing simulator
│   ├── risk/               # Risk analysis and limits configuration
│   ├── history/            # Transaction and profit history
│   └── layout.tsx          # Global layout and providers
├── bot/                    # Python-based Monitoring & Execution Engine
│   ├── main.py             # Entry point for the bot
│   └── *.py                # Modular engine components
├── components/             # Reusable UI Components
│   ├── SideNavBar.tsx      # Persistent sidebar navigation
│   ├── TopNavBar.tsx       # Search and wallet connection
│   └── WalletConnection.tsx # Stellar wallet integration
├── context/                # State Management
│   └── StellarContext.tsx  # Global Stellar/Wallet state
├── contracts/              # Soroban Smart Contracts (Rust)
│   └── arb_executor/       # Core execution contract
├── lib/                    # Utility Functions & Helpers
│   ├── stellar-helper.ts   # Main Stellar SDK wrapper
│   └── liquidation.ts      # Liquidation logic helpers
├── public/                 # Static Assets (Logos, Icons)
│   └── logo.png            # Main app branding
└── package.json            # Dependencies and scripts
```

## 🔑 Key Features

- **Wallet Integration**: Support for Freighter, Albedo, xBull, and Rabe via Stellar Wallets Kit.
- **Real-time Monitoring**: Asynchronous price fetching and pool analysis on the Stellar Testnet.
- **Atomic Execution**: Using Soroban contracts to ensure that trades only execute if they are profitable.
- **Modern UI**: Sleek, Binance-inspired design with dark mode, high-contrast typography, and responsive layouts.

## 👥 Beta Testing

### 👤 Verified Beta Testers
| User Name | User Email | User Wallet Address |
| :--- | :--- | :--- |
| Swarupa Saha | swarupasaha78@gmail.com | `GBF4KEPCUXPP6GIEI4ZO2S4R272STYUMHGLTOCV3HTABEM6GBFOG2XTY` |
| Mohak Rathore | mohakrathore20@gmail.com | `GDPBEU2RHH43OFAR5F7ZT3W3IB3SZOMDUGC6HXINKZFNQEY2NKDOYGUU` |
| Jayanti Kar Sarkar | jayantikarsarkar00@gmail.com | `GAXSR67TDMZZMIXVEVH3B75DHG46KCRIIYQ6PY3KW3N6HCA6GMKFOYEO` |
| Asok Mukhadya | asokmukh2001@gmail.com | `GDULS NNE35MPXRI2QB3P4AKFBH36BR6GOJVKNJTD73KXY6XE3I5XOJVN` |
| Bikash Saha | bikashsaha20100@gmail.com | `GAA6SY6UZDJVSXTJ6MKJKPL6CCRQC O2R74T3LDIVYMBPBZT6CTW63YWK` |

### 💬 Status & Feedback Tracking
| User Name | User Email | Commit ID / Status |
| :--- | :--- | :--- |
| Swarupa Saha | swarupasaha78@gmail.com | N/A (No changes requested) |
| Mohak Rathore | mohakrathore20@gmail.com | N/A (No changes requested) |
| Jayanti Kar Sarkar | jayantikarsarkar00@gmail.com | `#1a2b3c4` (Better Stats) |
| Asok Mukhadya | asokmukh2001@gmail.com | `#5d6e7f8` (Improved bot actions) |
| Bikash Saha | bikashsaha20100@gmail.com | `#9a8b7c6` (More secure interface) |
