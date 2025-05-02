import React, { useState } from "react";
import { useRef, useEffect } from "react";
import "./TradingChart.css";
import { CandlestickSeries, createChart, ColorType } from "lightweight-charts";
import axios from "axios";
import BigNumber from "bignumber.js";
import { useWatchContractEvent } from "wagmi";
import { contractABI } from "../../../contractABI";
import { useAccount } from "wagmi";
import { useConfig } from "wagmi";
import { useTrade } from "../Background/TradeContext";
import { toast } from "sonner";
import Button from "../../HelperComponents/Button/Button";

// following function is used to get data from backend

async function getDataForChartFromBackend(x, y) {
  const REQUEST_URL = import.meta.env.VITE_BACKEND_URL_TO_GET_PERP_PRICES;
  try {
    let response = await axios.get(REQUEST_URL, {
      params: { x, y },
    });
    return response;
  } catch {
    return null;
  }
}

// this function is used to convert array of dataPoints that are in string format (when backend sends them) to Number format
function fromStringToNumber(data) {
  let correctFormatData = data.map((dataPoint) => {
    let val = new BigNumber(dataPoint.perp_price);
    let correctFormatTime = Number(dataPoint.timestamp);
    let correctFormatValue = Number(val.dividedBy("1e18"));
    return {
      value: correctFormatValue,
      time: correctFormatTime,
    };
  });
  return correctFormatData;
}

// following function is used to update lastCandleStick with one dataPoint
function updateLastCandleStickWithOneDataPoint(
  dataPoint,
  lastCandleStick,
  timeIntervalInSeconds
) {
  let newTime =
    Math.floor(dataPoint.time / timeIntervalInSeconds) * timeIntervalInSeconds;
  if (newTime === lastCandleStick.current.time) {
    lastCandleStick.current.high = Math.max(
      lastCandleStick.current.high,
      dataPoint.value
    );
    lastCandleStick.current.low = Math.min(
      lastCandleStick.current.low,
      dataPoint.value
    );
    lastCandleStick.current.close = dataPoint.value;
  } else {
    lastCandleStick.current.open = dataPoint.value;
    lastCandleStick.current.high = dataPoint.value;
    lastCandleStick.current.low = dataPoint.value;
    lastCandleStick.current.close = dataPoint.value;
    lastCandleStick.current.time = newTime;
  }
}
// following function is used to convert an array to candlestick format array
function convertToCandleStickFormat(
  data,
  lastCandleStick,
  timeIntervalInSeconds
) {
  let localLastCandleStick = {
    open: 0,
    high: 0,
    low: 0,
    close: 0,
    time: 0,
  };

  let candleStickFormatData = [];

  for (let dataPoint of data) {
    let newTime =
      Math.floor(dataPoint.time / timeIntervalInSeconds) *
      timeIntervalInSeconds;

    if (newTime === localLastCandleStick.time) {
      localLastCandleStick.high = Math.max(
        localLastCandleStick.high,
        dataPoint.value
      );
      localLastCandleStick.low = Math.min(
        localLastCandleStick.low,
        dataPoint.value
      );
      localLastCandleStick.close = dataPoint.value;
    } else {
      // Push the previous candle if it's valid
      if (localLastCandleStick.time !== 0) {
        candleStickFormatData.push({ ...localLastCandleStick });
      }

      localLastCandleStick.open = dataPoint.value;
      localLastCandleStick.high = dataPoint.value;
      localLastCandleStick.low = dataPoint.value;
      localLastCandleStick.close = dataPoint.value;
      localLastCandleStick.time = newTime;
    }
  }

  // Push the last candle
  if (localLastCandleStick.time !== 0) {
    candleStickFormatData.push({ ...localLastCandleStick });
  }

  lastCandleStick.current = localLastCandleStick;

  return candleStickFormatData;
}

async function putInitialDataInChart(
  initialX,
  initialY,
  timeIntervalInSeconds,
  lastCandleStick,
  candlestickSeriesRef,
  chartRef
) {
  let response = await getDataForChartFromBackend(initialX, initialY);

  if (response == null) {
    toast.error("Error fetching price history.");
  } else {
    let rawDataSet = fromStringToNumber(response.data.dataPoints);
    rawDataSet = rawDataSet.reverse();

    let candleStickFormatDataSet = convertToCandleStickFormat(
      rawDataSet,
      lastCandleStick,
      timeIntervalInSeconds
    );
    candlestickSeriesRef.current.setData(candleStickFormatDataSet);

    chartRef.current.timeScale().fitContent();
  }
}

export default function TradingChart() {
  const oneMin = 60;
  const fiveMin = oneMin * 5;
  const fifteenMin = fiveMin * 3;
  const oneHour = fifteenMin * 4;
  const fourHour = oneHour * 4;
  const oneDay = fourHour * 6;
  const oneWeek = oneDay * 7;
  const [timeInterval, setTimeInterval] = useState(oneHour);
  const tradingChartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const candlestickSeriesRef = useRef(null);
  const { address } = useAccount();

  let { currentPerpPrice, getLatestData } = useTrade();
  let correspondingTimestampAsNumber = useRef(0);
  const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;
  let lastCandleStick = useRef({
    open: 0,
    high: 0,
    low: 0,
    close: 0,
    time: 0,
  });

  let initialData;
  let initialX = timeInterval * 0.5;
  let initialY = 0;
  let timeIntervalInSeconds = timeInterval;
  let currentPerpPriceAsNumber = 0;
  if (currentPerpPrice !== undefined) {
    currentPerpPriceAsNumber = Number(
      new BigNumber(currentPerpPrice.toString()).dividedBy(
        new BigNumber("1e18")
      )
    );
  }

  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: contractABI,
    eventName: "PerpPriceUpdated",
    onLogs(logs) {
      logs.forEach((log) => {
        getLatestData();
        correspondingTimestampAsNumber.current = Number(log.args.timestamp);
      });
    },
  });

  useEffect(() => {
    chartRef.current = createChart(tradingChartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "Transparent" },
        textColor: "#A0A0A0",
      },

      width: tradingChartContainerRef.current.clientWidth * 0.95,
      height: tradingChartContainerRef.current.clientHeight * 0.95,
      grid: {
        vertLines: {
          color: "rgba(180, 180, 180, 0.1)", // brighter gray
          style: 2,
          width: 0.25,
        },
        horzLines: {
          color: "rgba(180, 180, 180, 0.1)", // brighter gray
          style: 2,
          width: 0.25,
        },
      },
    });

    chartRef.current.priceScale("right").applyOptions({
      visible: true,
      borderColor: "#888",
      autoScale: true,
      scaleMargins: {
        top: 0.2,
        bottom: 0.1,
      },
    });

    chartRef.current.timeScale().applyOptions({
      visible: true,
      borderColor: "#888",
      timeVisible: true,
      secondsVisible: true,
      barSpacing: 10, // Fixed space between bars
      rightOffset: 5, // Space on the right side of the chart
      lockVisibleTimeRangeOnResize: true, // Prevents automatic rescaling on container resize
      fixRightEdge: true, // Prevents scrolling beyond the last data point
      minBarSpacing: 5,
    });

    candlestickSeriesRef.current = chartRef.current.addSeries(
      CandlestickSeries,
      {
        upColor: "#00C087",
        downColor: "#FF5353",
        borderVisible: false,
        wickUpColor: "#00C087",
        wickDownColor: "#FF5353",
        priceFormat: {
          type: "price",
          precision: 8, // show up to 8 digits after decimal for very small values
          minMove: 0.00000001,
        },
      }
    );

    candlestickSeriesRef.current.setData([]);

    chartRef.current.timeScale().fitContent();

    const handleResize = () => {
      chartRef.current.applyOptions({
        width: tradingChartContainerRef.current.clientWidth * 0.95,
        height: tradingChartContainerRef.current.clientHeight * 0.95,
      });
    };

    window.addEventListener("resize", handleResize);

    putInitialDataInChart(
      initialX,
      initialY,
      timeIntervalInSeconds,
      lastCandleStick,
      candlestickSeriesRef,
      chartRef
    );

    return () => {
      window.removeEventListener("resize", handleResize);

      chartRef.current.remove();
    };
  }, []);

  useEffect(() => {
    if (currentPerpPriceAsNumber && correspondingTimestampAsNumber.current) {
      let dataPoint = {
        value: currentPerpPriceAsNumber,
        time: correspondingTimestampAsNumber.current,
      };

      updateLastCandleStickWithOneDataPoint(
        dataPoint,
        lastCandleStick,
        timeIntervalInSeconds
      );
      candlestickSeriesRef.current.update(lastCandleStick.current);
    }
  }, [currentPerpPrice, correspondingTimestampAsNumber]);

  useEffect(() => {
    putInitialDataInChart(
      initialX,
      initialY,
      timeIntervalInSeconds,
      lastCandleStick,
      candlestickSeriesRef,
      chartRef
    );
  }, [timeInterval]);

  return (
    <div className="trading-chart" ref={tradingChartContainerRef}>
      <div className="trading-chart-button-group-container">
        <Button
          className={`trading-chart-button-style ${
            timeInterval === oneMin ? "trading-chart-button-selected" : ""
          }`}
          onClick={() => {
            setTimeInterval(oneMin);
          }}
        >
          1m
        </Button>
        <Button
          className={`trading-chart-button-style ${
            timeInterval === fiveMin ? "trading-chart-button-selected" : ""
          }`}
          onClick={() => {
            setTimeInterval(fiveMin);
          }}
        >
          5m
        </Button>
        <Button
          className={`trading-chart-button-style ${
            timeInterval === fifteenMin ? "trading-chart-button-selected" : ""
          }`}
          onClick={() => {
            setTimeInterval(fifteenMin);
          }}
        >
          15m
        </Button>
        <Button
          className={`trading-chart-button-style ${
            timeInterval === oneHour ? "trading-chart-button-selected" : ""
          }`}
          onClick={() => {
            setTimeInterval(oneHour);
          }}
        >
          1h
        </Button>
        <Button
          className={`trading-chart-button-style ${
            timeInterval === fourHour ? "trading-chart-button-selected" : ""
          }`}
          onClick={() => {
            setTimeInterval(fourHour);
          }}
        >
          4h
        </Button>
        <Button
          className={`trading-chart-button-style ${
            timeInterval === oneDay ? "trading-chart-button-selected" : ""
          }`}
          onClick={() => {
            setTimeInterval(oneDay);
          }}
        >
          1D
        </Button>
        <Button
          className={`trading-chart-button-style ${
            timeInterval === oneWeek ? "trading-chart-button-selected" : ""
          }`}
          onClick={() => {
            setTimeInterval(oneWeek);
          }}
        >
          1W
        </Button>
      </div>
    </div>
  );
}
