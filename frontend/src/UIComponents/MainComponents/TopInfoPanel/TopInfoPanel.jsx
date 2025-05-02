import React, { useState, useEffect } from "react";
import "./TopInfoPanel.css";
import { useTrade } from "../Background/TradeContext";
import BigNumber from "bignumber.js";
import { useReadContract } from "wagmi";
import { contractABI } from "../../../contractABI";
import { FiInfo } from "react-icons/fi";
import Tooltip from "../../HelperComponents/Tooltip/Tooltip";

function getTimeLeftForNextFundingRound(lastFundingTime) {
  const EIGHT_HOURS_IN_SECONDS = 8n * 60n * 60n;
  const nowInSeconds = BigInt(Math.floor(Date.now() / 1000)); // Current timestamp in seconds

  const nextFundingTimestamp = lastFundingTime + EIGHT_HOURS_IN_SECONDS;

  // If we're past the 8-hour mark, return zero
  if (nowInSeconds >= nextFundingTimestamp) {
    return { hours: 0n, minutes: 0n, seconds: 0n };
  }

  const secondsLeft = nextFundingTimestamp - nowInSeconds;

  const hours = secondsLeft / 3600n;
  const minutes = (secondsLeft % 3600n) / 60n;
  const seconds = secondsLeft % 60n;

  return { hours, minutes, seconds };
}

export default function TopInfoPanel() {
  const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;
  let oraclePriceOfUnderlyingAsset;

  let response = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: contractABI,
    functionName: "getOraclePrice",
    args: [],
  });

  if (response.data) {
    oraclePriceOfUnderlyingAsset = response.data;
  }

  useEffect(() => {
    let interval = setInterval(response.refetch, 5000);
    return () => clearInterval(interval);
  }, []);

  let { lastFundingRate, lastFundingTime, currentPerpPrice } = useTrade();
  const [hoursLeftAsString, setHoursLeftAsString] = useState("");
  const [minutesLeftAsString, setMinutesLeftAsString] = useState("");
  const [secondsLeftAsString, setSecondsLeftAsString] = useState("");
  let WEI = new BigNumber("1e18");
  let lastFundingRateInPercentageAsString = "";
  let currentPerpPriceinEthAsString = "";
  let oraclePriceOfUnderlyingAssetInEthAsString = "";

  if (currentPerpPrice !== undefined) {
    currentPerpPriceinEthAsString = new BigNumber(currentPerpPrice.toString())
      .dividedBy(WEI)
      .toString();
  }

  if (oraclePriceOfUnderlyingAsset !== undefined) {
    oraclePriceOfUnderlyingAssetInEthAsString = new BigNumber(
      oraclePriceOfUnderlyingAsset.toString()
    )
      .dividedBy(WEI)
      .toString();
  }

  if (lastFundingRate !== undefined) {
    lastFundingRateInPercentageAsString = new BigNumber(
      lastFundingRate.toString()
    )
      .dividedBy("1e22")
      .toString();

    if (
      lastFundingRateInPercentageAsString !== "" &&
      new BigNumber(lastFundingRateInPercentageAsString).isGreaterThan("0")
    ) {
      lastFundingRateInPercentageAsString =
        "+" + lastFundingRateInPercentageAsString;
    }
  }

  useEffect(() => {
    if (!lastFundingTime) return;

    const interval = setInterval(() => {
      const { hours, minutes, seconds } =
        getTimeLeftForNextFundingRound(lastFundingTime);

      setHoursLeftAsString(hours.toString().padStart(2, "0"));
      setMinutesLeftAsString(minutes.toString().padStart(2, "0"));
      setSecondsLeftAsString(seconds.toString().padStart(2, "0"));
    }, 1000);

    return () => clearInterval(interval);
  }, [lastFundingTime]);

  return (
    <div className="top-info-panel-container">
      <div className="top-info-panel-one-element-box">
        <img
          src="https://assets.coingecko.com/coins/images/3406/small/SNX.png"
          alt=""
          width={32}
          height={32}
        />
        SNX-ETH
      </div>
      <div className="top-info-panel-two-element-box">
        <div className="top-info-panel-two-element-box-first-element">
          Perp Price
          <Tooltip
            text={
              "Perp Price: The current price of the SNX perpetual contract, denominated in ETH. It is determined by a virtual AMM (vAMM) based on the long-short position imbalance, and may differ from the spot price due to market demand, supply, and funding rate adjustments. This price represents the last traded price of the perpetual contract."
            }
          >
            <FiInfo size={12} style={{ marginLeft: "4px" }} />
          </Tooltip>
        </div>
        <div className="top-info-panel-two-element-box-second-element">
          {currentPerpPrice !== undefined
            ? `${currentPerpPriceinEthAsString} ETH`
            : "fetching..."}
        </div>
      </div>
      <div className="top-info-panel-two-element-box">
        <div className="top-info-panel-two-element-box-first-element">
          Oracle Price
          <Tooltip
            text={
              "Oracle Price: The spot price of SNX in ETH, fetched from Chainlink’s decentralized oracle price feed. This price reflects the real-time market value and is used to calculate funding rates and assess divergence from the perp price."
            }
          >
            <FiInfo size={12} style={{ marginLeft: "4px" }} />
          </Tooltip>
        </div>
        <div className="top-info-panel-two-element-box-second-element">
          {oraclePriceOfUnderlyingAsset !== undefined
            ? `${oraclePriceOfUnderlyingAssetInEthAsString} ETH`
            : "fetching..."}
        </div>
      </div>
      <div className="top-info-panel-two-element-box">
        <div className="top-info-panel-two-element-box-first-element">
          Last Funding Rate
          <Tooltip
            text={
              "Last Funding Rate: Funding rates are periodic payments exchanged between long and short positions to keep the perp price aligned with the oracle price. The last funding rate is the most recent 8-hour rate, calculated based on the time-weighted average of the perp price (from our virtual AMM) and the Chainlink oracle price. A positive rate means longs paid shorts; a negative one means shorts paid longs."
            }
          >
            <FiInfo size={12} style={{ marginLeft: "4px" }} />
          </Tooltip>
        </div>
        <div
          className={`top-info-panel-two-element-box-second-element ${
            lastFundingRate !== undefined && lastFundingRate > 0
              ? "top-info-panel-text-color-green"
              : lastFundingRate !== undefined && lastFundingRate < 0
              ? "top-info-panel-text-color-red"
              : ""
          }`}
        >
          {lastFundingRate !== undefined
            ? `${lastFundingRateInPercentageAsString} %`
            : "fetching..."}
        </div>
      </div>
      <div className="top-info-panel-two-element-box">
        <div className="top-info-panel-two-element-box-first-element">
          Next Funding In
        </div>
        <div
          className={`top-info-panel-two-element-box-second-element ${
            lastFundingTime !== undefined &&
            hoursLeftAsString !== "" &&
            minutesLeftAsString !== "" &&
            secondsLeftAsString !== ""
              ? "top-info-panel-text-color-red"
              : ""
          }`}
        >
          {lastFundingTime !== undefined &&
          new BigNumber(hoursLeftAsString).isZero() &&
          new BigNumber(minutesLeftAsString).isZero() &&
          new BigNumber(secondsLeftAsString).isZero()
            ? "Processing funding rate settlement..."
            : lastFundingTime !== undefined &&
              hoursLeftAsString !== "" &&
              minutesLeftAsString !== "" &&
              secondsLeftAsString !== ""
            ? `${hoursLeftAsString}:${minutesLeftAsString}:${secondsLeftAsString}`
            : "fetching..."}
        </div>
      </div>
    </div>
  );
}
