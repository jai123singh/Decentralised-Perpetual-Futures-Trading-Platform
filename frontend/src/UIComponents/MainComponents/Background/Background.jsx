import React from "react";
import "./Background.css";
import TradingChartArea from "../TradingChartArea/TradingChartArea";
import TraderInteractionArea from "../TraderInteractionArea/TraderInteractionArea";
import { useState, useEffect } from "react";
import { useAccount, useReadContracts } from "wagmi";
import { contractABI } from "../../../contractABI";
import { TradeProvider } from "./TradeContext";
import { useWatchContractEvent } from "wagmi";
import { toast } from "sonner";
import BigNumber from "bignumber.js";
import TopInfoPanel from "../TopInfoPanel/TopInfoPanel";
import Button from "../../HelperComponents/Button/Button";
import AboutSection from "../AboutSection/AboutSection";

export default function Background() {
  const [page, setPage] = useState("Trade");
  const { address } = useAccount();
  const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;
  let WEI = new BigNumber("1e18");

  const response = useReadContracts({
    contracts: [
      {
        address: CONTRACT_ADDRESS,
        abi: contractABI,
        functionName: "getMaxNumberOfTradablePerp",
        args: [],
      },
      {
        address: CONTRACT_ADDRESS,
        abi: contractABI,
        functionName: "getPositionOfTrader",
        args: [address],
      },
      {
        address: CONTRACT_ADDRESS,
        abi: contractABI,
        functionName: "getAmountOfDepositOfTrader",
        args: [address],
      },
      {
        address: CONTRACT_ADDRESS,
        abi: contractABI,
        functionName: "getAmountOfWithdrawableDepositOfTrader",
        args: [address],
      },
      {
        address: CONTRACT_ADDRESS,
        abi: contractABI,
        functionName: "getLeverageUsedByTrader",
        args: [address],
      },
      {
        address: CONTRACT_ADDRESS,
        abi: contractABI,
        functionName: "getNumberOfPerpInOpenPositionOfTrader",
        args: [address],
      },
      {
        address: CONTRACT_ADDRESS,
        abi: contractABI,
        functionName: "getPerpPriceAtWhichTraderEnteredTheTrade",
        args: [address],
      },
      {
        address: CONTRACT_ADDRESS,
        abi: contractABI,
        functionName: "getMarginOfTrader",
        args: [address],
      },
      {
        address: CONTRACT_ADDRESS,
        abi: contractABI,
        functionName: "getMaintenanceMarginOfTrader",
        args: [address],
      },
      {
        address: CONTRACT_ADDRESS,
        abi: contractABI,
        functionName: "getEffectiveMargin",
        args: [address],
      },
      {
        address: CONTRACT_ADDRESS,
        abi: contractABI,
        functionName: "getMaximumAmountThatCanBeAddedToMargin",
        args: [address],
      },
      {
        address: CONTRACT_ADDRESS,
        abi: contractABI,
        functionName: "getTriggerPriceOfTrader",
        args: [address],
      },
      {
        address: CONTRACT_ADDRESS,
        abi: contractABI,
        functionName: "getPnLOfTrader",
        args: [address],
      },
      {
        address: CONTRACT_ADDRESS,
        abi: contractABI,
        functionName: "getPlatformFeeCollectedToOpenThePosition",
        args: [address],
      },
      {
        address: CONTRACT_ADDRESS,
        abi: contractABI,
        functionName: "currentPriceOfPerp",
        args: [],
      },
      {
        address: CONTRACT_ADDRESS,
        abi: contractABI,
        functionName: "lastFundingRate",
        args: [],
      },
      {
        address: CONTRACT_ADDRESS,
        abi: contractABI,
        functionName: "lastFundingTime",
        args: [],
      },
    ],
  });

  let maxNumberOfTradeablePerp;
  let position; // position-> 1->long , -1->short , 0->no open position
  let deposit;
  let maxWithdrawableDeposit;
  let leverage;
  let numberOfPerpInOpenPosition;
  let perpPriceAtWhichTraderEnteredTheTrade;
  let margin;
  let maintenanceMargin;
  let effectiveMargin;
  let maxAmountThatCanBeAddedToMargin;
  let triggerPrice;
  let pnl;
  let platformFeeCollectedToOpenThePosition;
  let currentPerpPrice;
  let lastFundingRate;
  let lastFundingTime;
  let getLatestData = response.refetch;

  let data = response.data;
  if (data) {
    if (data[0].status == "success") maxNumberOfTradeablePerp = data[0].result;
    if (data[1].status == "success") position = data[1].result;
    if (data[2].status == "success") deposit = data[2].result;
    if (data[3].status == "success") maxWithdrawableDeposit = data[3].result;
    if (data[4].status == "success") leverage = data[4].result;
    if (data[5].status == "success")
      numberOfPerpInOpenPosition = data[5].result;
    if (data[6].status == "success")
      perpPriceAtWhichTraderEnteredTheTrade = data[6].result;
    if (data[7].status == "success") margin = data[7].result;
    if (data[8].status == "success") maintenanceMargin = data[8].result;
    if (data[9].status == "success") effectiveMargin = data[9].result;
    if (data[10].status == "success")
      maxAmountThatCanBeAddedToMargin = data[10].result;
    if (data[11].status == "success") triggerPrice = data[11].result;
    if (data[12].status == "success") pnl = data[12].result;
    if (data[13].status == "success")
      platformFeeCollectedToOpenThePosition = data[13].result;
    if (data[14].status == "success") currentPerpPrice = data[14].result;
    if (data[15].status == "success") lastFundingRate = data[15].result;
    if (data[16].status == "success") lastFundingTime = data[16].result;
  }

  // Note- above variables will be(except for getLatestData. This function would always be available)
  // 1- undefined when response.data is undefined ie result of call made to alchemy has not yet got back
  // 2-Once the respose comes, they would contain the value of these variables or they would still be undefined if something went wrong or reverted

  // Note , even it fails due to network error ie say for eg , user's network is not working, so in that case, its not like these objects would remain undefined as request would never be sent, instead, u will get status - failure and error containing the reason for it.Usually the error due to failure would be->ContractFunctionExecutionError: HTTP request failed. URL: https://eth-sepolia.g.alchemy.com/v2/bAo…

  const tradeData = {
    maxNumberOfTradeablePerp,
    position,
    deposit,
    maxWithdrawableDeposit,
    leverage,
    numberOfPerpInOpenPosition,
    perpPriceAtWhichTraderEnteredTheTrade,
    margin,
    maintenanceMargin,
    effectiveMargin,
    maxAmountThatCanBeAddedToMargin,
    triggerPrice,
    pnl,
    platformFeeCollectedToOpenThePosition,
    currentPerpPrice,
    lastFundingRate,
    lastFundingTime,
    getLatestData,
  };

  useEffect(() => {
    if (address) {
      getLatestData();
    }
  }, [address]);

  // below we are subscribing to  events emitted by perp smart contract

  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: contractABI,
    eventName: "PositionLiquidated",
    onLogs(logs) {
      logs.forEach((log) => {
        // here, we will not call getLatestData function because, it is for sure, that whenever any position is liquidated, perp price update event is also emitted. We are calling getLatestData function in that event handler, hence no need to call it here.
        if (log.args.traderAddress == address) {
          let fee = new BigNumber(log.args.platformFee.toString()).dividedBy(
            WEI
          );
          toast.error(
            `Your position has been liquidated. A platform fee of ${fee.toString()} ETH was charged for this automated liquidation.`
          );
        }
      });
    },
  });

  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: contractABI,
    eventName: "FundingRateSettlement",
    onLogs(logs) {
      toast.info(
        <div>
          <b>Funding rate mechanism executed.</b>
          <br />
          Traders who gained from the funding rate have been charged a 10%
          platform fee on their gains. Check your deposit for updates.
        </div>
      );
      logs.forEach((log) => {
        getLatestData();
      });
    },
  });

  // following functions are used to switch between trading page and about section page
  function handleTradeButtonClick() {
    if (page !== "Trade") {
      setPage("Trade");
    }
  }

  function handleAboutButtonClick() {
    if (page !== "About") {
      setPage("About");
    }
  }

  //Below we are informing trader to use sepolia testnet to trade via toast notification
  useEffect(() => {
    toast.info(
      "🔔 This platform runs on the Sepolia testnet. Make sure your wallet is connected to Sepolia to use all features."
    );
  }, []);

  return (
    <TradeProvider value={tradeData}>
      <div className="background">
        {(() => {
          if (page === "Trade") {
            return (
              <>
                <div className="background-heading">
                  Decentralised Perpetual Futures Trading Platform
                </div>
                <div className="background-top-info-section">
                  <TopInfoPanel></TopInfoPanel>
                </div>
                <div className="background-middle-section">
                  <TradingChartArea />
                  <TraderInteractionArea />
                </div>
              </>
            );
          } else {
            return <AboutSection></AboutSection>;
          }
        })()}
        <div className="background-bottom-section">
          <div className="background-bottom-section-left-section">
            <Button
              className={`background-bottom-buttons ${
                page === "Trade" ? "background-bottom-buttons-selected" : ""
              }`}
              onClick={handleTradeButtonClick}
            >
              Trade
            </Button>
            <Button
              className={`background-bottom-buttons ${
                page === "About" ? "background-bottom-buttons-selected" : ""
              }`}
              onClick={handleAboutButtonClick}
            >
              About
            </Button>
            <a
              href="https://github.com/jai123singh/Decentralised-Perpetual-Futures-Trading-Platform"
              target="_blank"
              className="background-bottom-section-anchor"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 98 96"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M48.854,0 C21.839,0 0,22 0,49.217 C0,70.973 13.993,89.389 33.405,95.904 C35.832,96.379 36.721,94.879 36.721,93.574 C36.721,92.381 36.651,88.893 36.651,84.723 C23.054,87.682 20.201,78.824 20.201,78.824 C17.994,73.119 14.795,71.619 14.795,71.619 C10.353,68.566 15.12,68.566 15.12,68.566 C20.027,68.847 22.608,73.611 22.608,73.611 C26.977,81.115 34.01,79.039 36.862,77.734 C37.218,74.539 38.528,72.256 39.977,70.973 C29.14,69.773 17.781,65.533 17.781,46.594 C17.781,41.251 19.633,36.883 22.676,33.41 C22.252,32.176 20.607,27.105 23.282,20.359 C23.282,20.359 27.438,19.053 36.65,25.405 C40.558,24.309 44.761,23.761 48.963,23.761 C53.166,23.761 57.369,24.309 61.276,25.405 C70.489,19.053 74.645,20.359 74.645,20.359 C77.32,27.105 75.675,32.176 75.251,33.41 C78.294,36.883 80.146,41.251 80.146,46.594 C80.146,65.533 68.787,69.703 57.95,70.973 C59.75,72.619 61.276,75.744 61.276,80.463 C61.276,87.209 61.206,91.873 61.206,93.574 C61.206,94.879 62.096,96.379 64.522,95.904 C83.934,89.389 97.927,70.973 97.927,49.217 C97.858,22 75.948,0 48.854,0 Z"
                  fill="#FFFFFF"
                />
              </svg>
              View on GitHub
            </a>
          </div>
          <div className="background-bottom-section-right-section">
            <svg width="16" height="16" viewBox="0 0 784.37 1277.39">
              <path
                fill="#8A92B2"
                d="M392.07,0L383.5,29.11V873.74l8.57,8.53,392.06-231.75Z"
              />
              <path
                fill="#62688F"
                d="M392.07,0L0,650.52l392.07,231.75V472.33Z"
              />
              <path
                fill="#8A92B2"
                d="M392.07,956.52l-4.83,5.89v300.87l4.83,14.1,392.3-552.49Z"
              />
              <path fill="#62688F" d="M392.07,1277.38V956.52L0,724.89Z" />
              <path
                fill="#454A75"
                d="M392.07,882.29l392.06-231.77-392.06-178.21Z"
              />
              <path fill="#8A92B2" d="M0,650.52l392.07,231.77V472.33Z" />
            </svg>
            <span>Powered by Ethereum Smart Contract</span>
          </div>
        </div>
      </div>
    </TradeProvider>
  );
}
