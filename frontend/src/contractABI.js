export const contractABI = [
  {
    inputs: [
      {
        internalType: "address",
        name: "traderAddress",
        type: "address",
      },
      {
        internalType: "int256",
        name: "amountToBeAdded",
        type: "int256",
      },
    ],
    name: "addMoreMarginToOpenPosition",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "addressOfTrader",
        type: "address",
      },
      {
        internalType: "int256",
        name: "numberOfPerpBought",
        type: "int256",
      },
      {
        internalType: "int256",
        name: "leverageUsedByTrader",
        type: "int256",
      },
      {
        internalType: "int256",
        name: "perpPriceWhenTraderClickedBuy",
        type: "int256",
      },
      {
        internalType: "int256",
        name: "slippageToleranceOfTrader",
        type: "int256",
      },
    ],
    name: "buy",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_backend",
        type: "address",
      },
    ],
    name: "changeBackend",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_beneficiary",
        type: "address",
      },
    ],
    name: "changeBeneficiary",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_owner",
        type: "address",
      },
    ],
    name: "changeOwner",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "traderAddress",
        type: "address",
      },
    ],
    name: "closeOpenPosition",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "traderAddress",
        type: "address",
      },
      {
        internalType: "int256",
        name: "amountOfWeiToBeDeposited",
        type: "int256",
      },
    ],
    name: "deposit",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "executeFundingRateMechanism",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "addressOfTrader",
        type: "address",
      },
      {
        internalType: "int256",
        name: "numberOfPerpSold",
        type: "int256",
      },
      {
        internalType: "int256",
        name: "leverageUsedByTrader",
        type: "int256",
      },
      {
        internalType: "int256",
        name: "perpPriceWhenTraderClickedSell",
        type: "int256",
      },
      {
        internalType: "int256",
        name: "slippageToleranceOfTrader",
        type: "int256",
      },
    ],
    name: "sell",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "int256",
        name: "_numberOfPerpInLiquidityPool",
        type: "int256",
      },
    ],
    stateMutability: "payable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "ReentrancyGuardReentrantCall",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "int256",
        name: "fundingRate",
        type: "int256",
      },
      {
        indexed: false,
        internalType: "int256",
        name: "timestamp",
        type: "int256",
      },
    ],
    name: "FundingRateSettlement",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "int256",
        name: "newPrice",
        type: "int256",
      },
      {
        indexed: false,
        internalType: "int256",
        name: "timestamp",
        type: "int256",
      },
    ],
    name: "PerpPriceUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "traderAddress",
        type: "address",
      },
      {
        indexed: false,
        internalType: "int256",
        name: "timestamp",
        type: "int256",
      },
      {
        indexed: false,
        internalType: "int256",
        name: "platformFee",
        type: "int256",
      },
    ],
    name: "PositionLiquidated",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "traderAddress",
        type: "address",
      },
      {
        internalType: "int256",
        name: "amountToBeWithdrawn",
        type: "int256",
      },
    ],
    name: "takeOutDeposit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    stateMutability: "payable",
    type: "fallback",
  },
  {
    inputs: [],
    name: "withdrawNetProfit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    stateMutability: "payable",
    type: "receive",
  },
  {
    inputs: [],
    name: "currentPriceOfPerp",
    outputs: [
      {
        internalType: "int256",
        name: "",
        type: "int256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "traderAddress",
        type: "address",
      },
    ],
    name: "getAmountOfDepositOfTrader",
    outputs: [
      {
        internalType: "int256",
        name: "",
        type: "int256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getAmountOfWeiInWeiPool",
    outputs: [
      {
        internalType: "int256",
        name: "",
        type: "int256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "traderAddress",
        type: "address",
      },
    ],
    name: "getAmountOfWithdrawableDepositOfTrader",
    outputs: [
      {
        internalType: "int256",
        name: "",
        type: "int256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "traderAddress",
        type: "address",
      },
    ],
    name: "getEffectiveMargin",
    outputs: [
      {
        internalType: "int256",
        name: "",
        type: "int256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "traderAddress",
        type: "address",
      },
    ],
    name: "getLeverageUsedByTrader",
    outputs: [
      {
        internalType: "int256",
        name: "",
        type: "int256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "traderAddress",
        type: "address",
      },
    ],
    name: "getMaintenanceMarginOfTrader",
    outputs: [
      {
        internalType: "int256",
        name: "",
        type: "int256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "traderAddress",
        type: "address",
      },
    ],
    name: "getMarginOfTrader",
    outputs: [
      {
        internalType: "int256",
        name: "",
        type: "int256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "traderAddress",
        type: "address",
      },
    ],
    name: "getMaximumAmountThatCanBeAddedToMargin",
    outputs: [
      {
        internalType: "int256",
        name: "",
        type: "int256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getMaxNumberOfTradablePerp",
    outputs: [
      {
        internalType: "int256",
        name: "",
        type: "int256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "traderAddress",
        type: "address",
      },
    ],
    name: "getNumberOfPerpInOpenPositionOfTrader",
    outputs: [
      {
        internalType: "int256",
        name: "",
        type: "int256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getOraclePrice",
    outputs: [
      {
        internalType: "int256",
        name: "",
        type: "int256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "traderAddress",
        type: "address",
      },
    ],
    name: "getPerpPriceAtWhichTraderEnteredTheTrade",
    outputs: [
      {
        internalType: "int256",
        name: "",
        type: "int256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "traderAddress",
        type: "address",
      },
    ],
    name: "getPlatformFeeCollectedToOpenThePosition",
    outputs: [
      {
        internalType: "int256",
        name: "",
        type: "int256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "traderAddress",
        type: "address",
      },
    ],
    name: "getPnLOfTrader",
    outputs: [
      {
        internalType: "int256",
        name: "",
        type: "int256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "traderAddress",
        type: "address",
      },
    ],
    name: "getPositionOfTrader",
    outputs: [
      {
        internalType: "int256",
        name: "",
        type: "int256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getTotalPlatformFeeCollected",
    outputs: [
      {
        internalType: "int256",
        name: "",
        type: "int256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "traderAddress",
        type: "address",
      },
    ],
    name: "getTriggerPriceOfTrader",
    outputs: [
      {
        internalType: "int256",
        name: "",
        type: "int256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "lastFundingRate",
    outputs: [
      {
        internalType: "int256",
        name: "",
        type: "int256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "lastFundingTime",
    outputs: [
      {
        internalType: "int256",
        name: "",
        type: "int256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];
