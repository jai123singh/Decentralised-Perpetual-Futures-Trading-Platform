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

export default function Background() {
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

  return (
    <TradeProvider value={tradeData}>
      <div className="background">
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

        <div className="background-bottom-section"></div>
      </div>
    </TradeProvider>
  );
}
