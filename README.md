# Decentralized Perpetual Futures Trading Platform

A blockchain-based perpetual futures trading platform featuring automated liquidation, funding rate mechanisms, and a virtual AMM system.

## Live Demo

[Access the trading platform](https://decentralised-perpetual-futures-trading-platform-frontend.vercel.app/) (Deployed on Vercel)

## Architecture

This project uses a three-tier architecture:

- **Frontend**: React application hosted on Vercel
- **Backend**: Node.js service running on Google Cloud's e2-micro VM instance
- **Smart Contracts**: Deployed on Ethereum's Sepolia testnet

## Key Features

### Trading Capabilities

- Open long or short positions with customizable parameters
- Multiple leverage options: 1x, 2x, 5x, 10x, or 20x
- Adjustable slippage tolerance (0.01% to 100.00%)
- Position management (close positions at any time)

### Risk Management

- Automated liquidation system when net margin falls below maintenance margin
- Liquidation price warnings and notifications
- Ability to add margin to existing positions to prevent liquidation
- Separate deposit management from position margin

### Financial Mechanisms

- 8-hour funding rate cycle for balancing long and short interest
- TWAP (Time-Weighted Average Price) implementation using the last ten perpetual prices
- Virtual AMM with constant product algorithm for price determination
- Platform fees:
  - 0.05% of total trade size when opening positions
  - 5% of remaining margin after liquidation
  - 10% of gains during funding rate settlements

### Technical Implementation

- Price-based heap data structure for optimized liquidation processing
- Fault-tolerant backend with:
  - PostgreSQL database for historical data persistence
  - Self-healing WebSocket connections
  - Blockchain polling for missed events
  - Fallback funding rate execution mechanism
  - Email notifications for system events

### User Interface

- Interactive price charts with multiple timeframes (1min to 1week)
- Real-time position metrics (margin, maintenance margin, PnL)
- Notification system for important events
- Oracle price display for underlying asset (SNX)
- Tooltips for trading terminology

## Security Features

- OpenZeppelin ReentrancyGuard implementation to prevent re-entrancy attacks
- Multi-layer validation (both frontend and smart contract)
- Protected administrative functions

## Current Limitations

1. **Single Asset Trading**: Currently only SNX perpetual futures are supported
2. **No Partial Position Changes**: Positions must be fully closed before opening new ones
3. **No Partial Liquidations**: Positions are fully liquidated when triggered
4. **Integer-Only Trading**: Cannot trade fractional perpetual amounts
5. **Fixed Maintenance Margin**: Set at 2% of total position size
6. **Transaction Requirements**: All state-changing operations require wallet signature

## Development and Testing

- Comprehensive test suite for all external smart contract functions
- Frontend validation to prevent common transaction errors

## License

[MIT](LICENSE)

## Contact

For questions or feedback, please open an issue on this repository or reach out at [Jaisinghtomar9211@gmail.com](mailto:Jaisinghtomar9211@gmail.com).
