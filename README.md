Decentralised Perpetual Futures Trading Platform
A full-stack blockchain-based perpetual futures trading platform featuring a virtual AMM, automated liquidations, funding rate mechanisms, and advanced risk management tools.

🔗 Live Demo
Access the trading platform
(Frontend deployed on Vercel)

🏗️ Architecture
This project follows a three-tier architecture:

Frontend: React.js app hosted on Vercel

Backend: Node.js service running on Google Cloud’s free e2-micro VM

Smart Contracts: Deployed on Ethereum's Sepolia Testnet

✨ Features
📈 Trading Capabilities
Open long or short positions on SNX perpetual futures

Leverage options: 1x, 2x, 5x, 10x, and 20x

Custom slippage tolerance: 0.01% to 100.00%

View and manage your open position in real-time

Close full positions at any time (partial closing not supported)

Trade only integer amounts (e.g., 1, 2, 3 perps)

🛡️ Risk Management
Automated Liquidation:

Triggered when net margin (initial margin – unrealized loss) < maintenance margin (2% of position size)

Complete liquidation only (no partial liquidation)

Liquidation Warnings:

Real-time alerts including the liquidation price

Add additional margin from your deposit to avoid liquidation

Deposit Management:

Deposit and withdraw funds independently

Deposits are used for position margin

Frontend Validations:

Prevents invalid trades (e.g., insufficient deposit, invalid perp size)

Only integer perps allowed

Smart Contract Validations:

Independent of frontend—prevents direct malicious interactions via Remix or other tools

💸 Financial Mechanisms
Virtual AMM:

Uses a constant product formula on a virtual liquidity pool

No real assets are stored in the pool—used only for pricing

Funding Rate Mechanism:

Executed every 8 hours automatically

Based on TWAP (Time-Weighted Average Price) of last 10 perp trades

Gaining trader pays 10% of gains as funding fee; losing trader pays none

Platform Fees:

0.05% of total trade size when opening a position

5% of remaining margin after liquidation

10% of gains during funding rate (collected only from gainer)

Fee Withdrawals:

Only beneficiary can withdraw collected platform fees

⚙️ Technical Implementation
Heap-Based Liquidation Queue:

Efficient liquidation trigger using heap of liquidation prices

Backend:

PostgreSQL for storing price and trade history

Real-time WebSocket price streaming with self-healing reconnections

Blockchain polling to recover missed events after downtime

Sends email alerts on critical events (e.g., funding executed, WS failure)

Fallback funding mechanism: ensures funding still works even if backend fails

Smart Contract:

Uses OpenZeppelin’s ReentrancyGuard

All user-facing external functions are unit tested

Frontend:

Real-time display of:

Current perp price and Chainlink oracle price of SNX in ETH

Position stats: entry price, leverage, margin, maintenance margin, net margin, unrealized PnL

Last funding rate and countdown to next funding

Multiple time-frame candlestick chart (1m, 5m, 15m, 1h, 4h, 1d, 1w)

In-app notifications for:

New position

Margin update

Position closed

Liquidation triggered

Funding mechanism executed

Tooltips explaining all financial jargons

“View on GitHub” link at footer for transparency

“About” section detailing the platform

⚠️ Current Limitations
Only one asset (SNX) is supported

Only one open position allowed at a time

Positions must be fully closed before opening a new one (no partial trades)

No partial liquidation—positions are fully liquidated if triggered

Only integer perps can be traded (e.g., not 1.1)

Maintenance margin is fixed at 2% of position size

Every state-changing operation requires a wallet signature (MetaMask popup)

🧪 Tech Stack
Frontend: React, Lightweight Charts, Raw CSS

Backend: Node.js, Express, PostgreSQL, WebSocket, Nodemailer

Smart Contracts: Solidity (Foundry), OpenZeppelin, Sepolia Testnet

📜 License
MIT

📬 Contact
For questions, issues, or feedback:
📧 Jaisinghtomar9211@gmail.com
