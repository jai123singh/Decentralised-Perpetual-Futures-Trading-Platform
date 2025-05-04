import React from "react";
import "./AboutSection.css";

export default function AboutSection() {
  return (
    <div className="about-container">
      <div className="about-header">
        <img
          src="https://images.pexels.com/photos/8370752/pexels-photo-8370752.jpeg?auto=compress&cs=tinysrgb&w=1200"
          alt="Cryptocurrency Trading"
          className="hero-image"
        />
        <div className="overlay">
          <h1>About DeFi Perpetual Futures</h1>
        </div>
      </div>

      <div className="about-content">
        <section className="about-section">
          <h2>What Are Perpetual Futures?</h2>
          <p>
            Perpetual futures are derivative contracts that allow traders to
            speculate on the future price of an asset without an expiration
            date. Unlike traditional futures contracts that settle on a specific
            date, perpetual futures can be held indefinitely.
          </p>
        </section>

        <section className="about-section">
          <h2>How This Platform Works</h2>
          <p>
            This decentralized perpetual trading platform enables trading of
            synthetic assets with leverage in a secure, transparent environment
            built on Ethereum. Here are the key features that make this platform
            unique:
          </p>

          <div className="features-grid">
            <div className="feature-card">
              <h3>Virtual AMM Price Discovery</h3>
              <p>
                Rather than relying on traditional order books, the platform
                utilizes a virtual Automated Market Maker (AMM) with a constant
                product algorithm. This virtual liquidity pool determines price
                movements based on trading activity without requiring actual
                assets to be deposited in the pool.
              </p>
            </div>

            <div className="feature-card">
              <h3>Flexible Leverage Options</h3>
              <p>
                Trade with confidence using flexible leverage options ranging
                from 1x to 20x. Various leverage levels (1x, 2x, 5x, 10x, 20x)
                are available to suit different risk appetites. Higher leverage
                amplifies both potential profits and losses, so trade
                responsibly.
              </p>
            </div>

            <div className="feature-card">
              <h3>Advanced Funding Rate Mechanism</h3>
              <p>
                Every 8 hours, a funding rate is calculated based on the
                Time-Weighted Average Price (TWAP) of the last ten perpetual
                prices. This mechanism helps align perpetual futures prices with
                spot market prices and prevents price manipulation from sudden
                market spikes.
              </p>
            </div>

            <div className="feature-card">
              <h3>Liquidation Protection System</h3>
              <p>
                The platform provides early warning when positions approach
                liquidation prices. Traders can add more margin to their
                positions to prevent liquidation and protect trades. An
                efficient heap data structure is used for liquidation
                monitoring.
              </p>
            </div>

            <div className="feature-card">
              <h3>Comprehensive Position Data</h3>
              <p>
                Monitor all aspects of positions including platform fees,
                perpetual amount, entry price, leverage, current price, margin,
                maintenance margin, effective margin, and unrealized PnL in
                real-time with intuitive dashboards and time-scaled charts.
              </p>
            </div>

            <div className="feature-card">
              <h3>Advanced Security Features</h3>
              <p>
                The platform implements industry-standard security practices
                including OpenZeppelin's ReentrancyGuard, comprehensive smart
                contract validation, and robust testing. Both frontend and smart
                contract contain validation checks to prevent malicious
                interactions.
              </p>
            </div>

            <div className="feature-card">
              <h3>Deposit and Withdrawal System</h3>
              <p>
                Traders can deposit funds into the platform and withdraw them as
                needed. When opening a position, the required margin is locked
                from their deposit. This enables flexible capital management
                while trading.
              </p>
            </div>

            <div className="feature-card">
              <h3>Customizable Slippage Tolerance</h3>
              <p>
                Traders can set their preferred slippage tolerance from 0.01% to
                100%, providing flexibility and control when executing trades in
                volatile market conditions.
              </p>
            </div>
          </div>
        </section>

        <section className="about-section">
          <h2>Trading Fees</h2>
          <div className="fees-container">
            <div className="fee-item">
              <span className="fee-label">Opening Fee:</span>
              <span className="fee-value">0.05% of total trade size</span>
            </div>
            <div className="fee-item">
              <span className="fee-label">Liquidation Fee:</span>
              <span className="fee-value">
                5% of remaining margin after liquidation
              </span>
            </div>
            <div className="fee-item">
              <span className="fee-label">Funding Rate Fee:</span>
              <span className="fee-value">
                10% from the amount gained by the benefiting trader (no fee from
                losing traders)
              </span>
            </div>
          </div>
        </section>

        <section className="about-section">
          <h2>Technical Infrastructure</h2>
          <p>The platform is built with a robust technical stack:</p>
          <ul className="infrastructure-list">
            <li>Smart contract deployed on Sepolia testnet</li>
            <li>Frontend hosted on Vercel with real-time notifications</li>
            <li>
              Backend on Google Cloud's e2-micro VM with PostgreSQL database
            </li>
            <li>Chainlink oracle integration for accurate price feeds</li>
            <li>
              Auto-recovery system for backend failures with exponential backoff
            </li>
            <li>Advanced charting with multiple timeframes (1min to 1week)</li>
          </ul>
        </section>

        <section className="about-section">
          <h2>Current Limitations</h2>
          <div className="limitations-container">
            <div className="limitation-item">
              <span className="limitation-text">
                • Single asset trading (SNX futures only)
              </span>
            </div>
            <div className="limitation-item">
              <span className="limitation-text">
                • One position at a time (must close existing position before
                opening a new one)
              </span>
            </div>
            <div className="limitation-item">
              <span className="limitation-text">
                • Full liquidation only (no partial liquidation)
              </span>
            </div>
            <div className="limitation-item">
              <span className="limitation-text">
                • Integer-only position sizing (no fractional perpetuals)
              </span>
            </div>
            <div className="limitation-item">
              <span className="limitation-text">
                • Fixed maintenance margin rate (2% of position size)
              </span>
            </div>
            <div className="limitation-item">
              <span className="limitation-text">
                • All state-changing operations require wallet signature
              </span>
            </div>
          </div>
        </section>

        <section className="about-section">
          <h2>Start Trading</h2>
          <p>
            Connect your wallet, deposit funds, and begin trading perpetual
            futures with customizable leverage in just a few clicks.
          </p>
          <div className="risk-warning">
            <p>
              Trading perpetual futures involves significant risk. Only trade
              with funds you can afford to lose. This platform is currently
              deployed on Sepolia testnet for testing purposes.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
