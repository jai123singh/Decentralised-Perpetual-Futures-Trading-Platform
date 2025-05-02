import React from "react";
import Button from "../../HelperComponents/Button/Button";
import "./PerpTradeSectionPage2.css";
import { useTrade } from "../Background/TradeContext";
import BigNumber from "bignumber.js";
import { useRef, useEffect } from "react";
import Tooltip from "../../HelperComponents/Tooltip/Tooltip";
import { FiInfo } from "react-icons/fi";

export default function PerpTradeSectionPage2({ goToPageThree, goToPageFour }) {
  // Creating a ref for the scrollable div
  const scrollContainerRef = useRef(null);

  // Using useEffect to scroll to bottom when component mounts
  useEffect(() => {
    if (scrollContainerRef.current) {
      setTimeout(() => {
        scrollContainerRef.current.scrollTop =
          scrollContainerRef.current.scrollHeight;
      }, 1);
    }
  }, []);

  let {
    position = 0n,
    leverage = 0n,
    numberOfPerpInOpenPosition = 0n,
    perpPriceAtWhichTraderEnteredTheTrade = 0n,
    margin = 0n,
    maintenanceMargin = 0n,
    effectiveMargin = 0n,
    triggerPrice = 0n,
    pnl = 0n,
    platformFeeCollectedToOpenThePosition = 0n,
    currentPerpPrice = 0n,
  } = useTrade();

  let WEI = new BigNumber("1e18");

  let entryPrice = new BigNumber(
    perpPriceAtWhichTraderEnteredTheTrade.toString()
  ).dividedBy(WEI);

  let platformFeeCollectedToOpenThePositionInEth = new BigNumber(
    platformFeeCollectedToOpenThePosition.toString()
  ).dividedBy(WEI);

  let marginInEth = new BigNumber(margin.toString()).dividedBy(WEI);

  let maintenanceMarginInEth = new BigNumber(
    maintenanceMargin.toString()
  ).dividedBy(WEI);

  let effectiveMarginInEth = new BigNumber(
    effectiveMargin.toString()
  ).dividedBy(WEI);

  let currentPerpPriceInEth = new BigNumber(
    currentPerpPrice.toString()
  ).dividedBy(WEI);

  let pnlInEth = new BigNumber(pnl.toString()).dividedBy(WEI);
  let pnlInEthAsString = pnlInEth.toString();
  if (pnlInEth.isGreaterThan("0")) {
    pnlInEthAsString = "+" + pnlInEthAsString;
  }

  let triggerPriceInEth = new BigNumber(triggerPrice.toString()).dividedBy(WEI);

  return (
    <div className="perp-trade-section-page2">
      <div className="perp-trade-section-page2-heading">
        {(() => {
          if (position === 1n) {
            return <b>Long Position Details</b>;
          } else if (position === -1n) {
            return <b>Short Position Details</b>;
          } else {
            return <b>fetching...</b>;
          }
        })()}
      </div>

      <div
        className="perp-trade-section-page2-info-abt-open-trade-section"
        ref={scrollContainerRef}
      >
        <div className="perp-trade-section-page2-subsection">
          <div className="perp-trade-section-page2-subsection-left-section">
            Platform Fee
            <Tooltip
              text={
                "Platform Fee: The actual fee paid to the platform when you open your position.It is 0.05% of your position size, calculated at the time of execution based on the trade price."
              }
              position="top"
            >
              <FiInfo size={14} style={{ marginLeft: "6px" }} />
            </Tooltip>
          </div>
          <div className="perp-trade-section-page2-subsection-right-section">
            {platformFeeCollectedToOpenThePositionInEth.toFormat(15).toString()}{" "}
            ETH
          </div>
        </div>
        <div className="perp-trade-section-page2-subsection">
          <div className="perp-trade-section-page2-subsection-left-section">
            Perpetual Amount
            <Tooltip
              text={
                "Perpetual Amount: The number of perpetual contracts (perps) you bought or sold when you opened your position."
              }
              position="top"
            >
              <FiInfo size={14} style={{ marginLeft: "6px" }} />
            </Tooltip>
          </div>
          <div className="perp-trade-section-page2-subsection-right-section">
            {numberOfPerpInOpenPosition.toString()}
          </div>
        </div>
        <div className="perp-trade-section-page2-subsection">
          <div className="perp-trade-section-page2-subsection-left-section">
            Entry Price
            <Tooltip
              text={
                "Entry Price: The price at which your position was opened, based on the perp price at the exact moment your trade was executed. This is used to calculate your unrealized PnL."
              }
              position="top"
            >
              <FiInfo size={14} style={{ marginLeft: "6px" }} />
            </Tooltip>
          </div>
          <div className="perp-trade-section-page2-subsection-right-section">
            {entryPrice.toString()} ETH
          </div>
        </div>
        <div className="perp-trade-section-page2-subsection">
          <div className="perp-trade-section-page2-subsection-left-section">
            Leverage
          </div>
          <div className="perp-trade-section-page2-subsection-right-section">
            {leverage.toString()}x
          </div>
        </div>
        <div className="perp-trade-section-page2-subsection">
          <div className="perp-trade-section-page2-subsection-left-section">
            Current Price
          </div>
          <div className="perp-trade-section-page2-subsection-right-section">
            {currentPerpPriceInEth.toString()} ETH
          </div>
        </div>
        <div className="perp-trade-section-page2-subsection">
          <div className="perp-trade-section-page2-subsection-left-section">
            Margin
            <Tooltip
              text={
                "Margin: The amount of your deposit allocated to open and maintain your position. It acts as collateral. A higher margin reduces liquidation risk."
              }
              position="top"
            >
              <FiInfo size={14} style={{ marginLeft: "6px" }} />
            </Tooltip>
          </div>
          <div className="perp-trade-section-page2-subsection-right-section">
            {marginInEth.toString()} ETH
          </div>
        </div>
        <div className="perp-trade-section-page2-subsection">
          <div className="perp-trade-section-page2-subsection-left-section">
            Maintenance Margin
            <Tooltip
              text={
                "Maintenance Margin: The minimum amount of margin required to keep your position open. It is calculated as 2% of your position size. If your effective margin falls below this threshold, your position will be automatically liquidated to prevent further losses."
              }
              position="top"
            >
              <FiInfo size={14} style={{ marginLeft: "6px" }} />
            </Tooltip>
          </div>
          <div className="perp-trade-section-page2-subsection-right-section">
            {maintenanceMarginInEth.toString()} ETH
          </div>
        </div>
        <div className="perp-trade-section-page2-subsection">
          <div className="perp-trade-section-page2-subsection-left-section">
            Effective Margin
            <Tooltip
              text={
                "Effective Margin: The margin available after subtracting any unrealized loss from your current position.It is calculated as:\nEffective Margin = Margin − Unrealized Loss (if any).\nThis value indicates the health of your position:\n• If the effective margin is greater than 1.5× the maintenance margin, it is shown in green.\n• If it falls below that threshold, it turns red, signaling a high risk of automated liquidation."
              }
              position="top"
            >
              <FiInfo size={14} style={{ marginLeft: "6px" }} />
            </Tooltip>
          </div>
          <div
            className={`perp-trade-section-page2-subsection-right-section ${
              maintenanceMarginInEth.isGreaterThan("0") &&
              maintenanceMarginInEth
                .multipliedBy("1.5")
                .isGreaterThanOrEqualTo(effectiveMarginInEth)
                ? "perp-trade-section-page2-text-red"
                : "perp-trade-section-page2-text-green"
            }`}
          >
            {effectiveMarginInEth.toString()} ETH
          </div>
        </div>

        <div className="perp-trade-section-page2-subsection">
          <div className="perp-trade-section-page2-subsection-left-section">
            Unrealized PnL
            <Tooltip
              text={
                "Unrealized PnL: The current profit or loss on your open position based on the difference between the entry price and the current perp price, without closing the position.\n• If the perp price has moved in your favor, this shows a positive value (profit).\n• If the perp price has moved against your position, it shows a negative value (loss).\nThis is an expected value, calculated using the current perp price. Since the perp price may change due to your trade or other traders' activity when closing your position, the actual realized PnL may slightly differ."
              }
              position="top"
            >
              <FiInfo size={14} style={{ marginLeft: "6px" }} />
            </Tooltip>
          </div>
          <div
            className={`perp-trade-section-page2-subsection-right-section ${
              pnlInEth.isGreaterThan("0")
                ? "perp-trade-section-page2-text-green"
                : pnlInEth.isLessThan("0")
                ? "perp-trade-section-page2-text-red"
                : ""
            }`}
          >
            {pnlInEthAsString} ETH
          </div>
        </div>
      </div>
      <div
        className={`perp-trade-section-page2-warning-safety-section ${
          triggerPrice <= 0
            ? "perp-trade-section-page2-warning-safety-section-green-font"
            : "perp-trade-section-page2-warning-safety-section-red-font"
        }`}
      >
        {triggerPrice <= 0
          ? `🛡️ You are protected from automated
        liquidation. Your margin is sufficient to set the liquidation trigger
        price below 0 ETH, and the perpetual price cannot fall below 0 ETH.`
          : position === 1n
          ? `⚠️ Liquidation Risk: If the perp price falls below 
        ${triggerPriceInEth.toString()} ETH, your position will be liquidated due
        to insufficient effective margin.`
          : `⚠️ Liquidation Risk: If the perp price rises above 
        ${triggerPriceInEth.toString()} ETH, your position will be liquidated due 
        to insufficient effective margin.`}
      </div>
      <div className="perp-trade-section-page2-button-section">
        <Button
          className="perp-trade-section-page2-button"
          onClick={goToPageFour}
        >
          Increase Margin
        </Button>
        <Button
          className="perp-trade-section-page2-button"
          onClick={goToPageThree}
        >
          Close Position
        </Button>
      </div>
    </div>
  );
}
