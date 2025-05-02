# Decentralised Perpetual Futures Trading Platform

A blockchain-based perpetual futures trading platform featuring automated liquidation, funding rate mechanisms, and a virtual AMM system.

## Live Demo

[Access the trading platform](https://decentralised-perpetual-futures-trading-platform-frontend.vercel.app/) (Deployed on Vercel)

## Architecture

This project uses a three-tier architecture:

- **Frontend**: React application hosted on Vercel
- **Backend**: Node.js service running on Google Cloud's e2-micro VM
- **Smart Contracts**: Deployed on Ethereum's Sepolia testnet

## Features

### Trading Capabilities

- **Position Management**: Open long or short positions with your choice of parameters
- **Leverage Options**: Trade with 1x, 2x, 5x, 10x, or 20x leverage
- **Customizable Slippage**: Set slippage tolerance from 0.01% to 100.00%
- **Position Closing**: Close positions at any time (full position only)

### Risk Management

- **Automated Liquidation**: Positions are liquidated when net margin falls below maintenance margin
- **Liquidation Warning**: Receive notifications with liquidation price information
- **Additional Margin**: Add more margin to prevent liquidation of positions
- **Deposit Management**: Deposit and withdraw funds independently from positions

### Financial Mechanisms

- **Funding Rate**: Automatically executed every 8 hours on open positions
- **TWAP Implementation**: Time-Weighted Average Price of the last ten perp prices used for funding rate calculations
- **Platform Fees**:
  - 0.05% of total trade size when opening positions
  - 5% of remaining margin after liquidation
  - 10% of gains during funding rate mechanisms

### Technical Implementation

- **Virtual AMM**: Constant product algorithm used on virtual liquidity pool to determine perp prices
- **Heap Data Structure**: Optimized liquidation triggering using a price-based heap
- **Fault-Tolerant Backend**:
  - PostgreSQL database for historical data
  - Self-healing WebSocket connections
  - Blockchain polling for missed events
  - Fallback funding rate execution mechanism

### User Interface

- **Price Charts**: Multiple timeframe options (1min, 5min, 15min, 1hr, 4hr, 1day, 1week)
- **Position Metrics**: View margin, maintenance margin, net margin, and current PnL
- **Notifications**: Receive alerts for important events (funding rate, liquidation, position changes)
- **Real-time Updates**: Latest prices and funding rates displayed prominently

## Current Limitations

1. **Single Asset Trading**: Currently only SNX perpetual futures are supported
2. **No Partial Position Changes**: Positions must be fully closed before opening new ones
3. **No Partial Liquidations**: Positions are fully liquidated when triggered
4. **Integer-Only Perp Trading**: Cannot trade fractional perp amounts (e.g., 1.1 perps)
5. **Fixed Maintenance Margin**: Set at 2% of total position size
6. **Transaction Requirements**: All state-changing operations require wallet signature

## License

[MIT](LICENSE)

## Contact

For questions or feedback, please open an issue on this repository or reach out at [Jaisinghtomar9211@gmail.com](Jaisinghtomar9211@gmail.com).
