import React, { useState, useEffect } from "react";
import "./TradingChartArea.css";
import TradingChart from "../TradingChart/TradingChart";
import { useTrade } from "../Background/TradeContext";
import BigNumber from "bignumber.js";

export default function TradingChartArea() {
  return (
    <div className="tradingchart-area">
      <TradingChart />
    </div>
  );
}
