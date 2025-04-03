const contractABI = [
  {
    inputs: [],
    name: "executeFundingRateMechanism",
    outputs: [],
    stateMutability: "nonpayable",
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
];

module.exports = contractABI;
