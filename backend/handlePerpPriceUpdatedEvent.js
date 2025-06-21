const dotenv = require("dotenv");
dotenv.config();
const { ethers } = require("ethers");
const contractABI = require("./contractABI.js");
const { storePerpData, getLatestBlockNumber } = require("./db.js");
const sendMail = require("./sendMail.js");
const getExponentialBackOffTime = require("./utilityFunctions.js");

const WS_RPC_URL = process.env.WS_RPC_URL;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

let websocketProvider;
let contract;
let isConnectionBrokenManually = false;
let restartCount = 0;
const MAX_RESTART = 10;

const perpPriceHandler = async (
  newPerpPrice,
  timestamp,
  ContractEventPayload
) => {
  let blockNumber = ContractEventPayload.log.blockNumber;

  // following line is just for testing
  // console.log("received data is :", newPerpPrice, timestamp, blockNumber);

  try {
    await storePerpData(newPerpPrice, timestamp, blockNumber);
  } catch {
    await sendMail(
      "Tried inserting perp price update upon revceiving PerpPriceUpdated event into the database , but database function storePerpData is throwing error."
    );
  }
};

const closeHandler = (event) => {
  if (isConnectionBrokenManually == false) {
    // following console is just for testing
    // console.log("closeHandler is working properly!!!!!!yeaaaaahhhhhhhhhhhhh.");
    setTimeout(restart, 100);
  }
};

async function insertMissedPerpPriceUpdates() {
  let attemptNumber = 1;
  let baseWaitPeriod = 10000; //10 seconds
  let maxWaitPeriod = 90000; // 90 seconds
  let blockNumberOfTheLastEntryMadeInDatabase = await getLatestBlockNumber();

  // getLatestBlockNumber() returning -1 means that some error happened
  if (blockNumberOfTheLastEntryMadeInDatabase == BigInt(-1)) {
    await sendMail(
      "Since getLatestBlockNumber function failed, hence could not update the missed perp price events."
    );
    return 1;
  }

  // Special case: if db is empty, use default starting block
  if (blockNumberOfTheLastEntryMadeInDatabase == BigInt(0)) {
    blockNumberOfTheLastEntryMadeInDatabase = BigInt(8591308);
  } else {
    blockNumberOfTheLastEntryMadeInDatabase =
      blockNumberOfTheLastEntryMadeInDatabase + BigInt(1);
  }

  while (attemptNumber <= 11) {
    if (attemptNumber > 10) {
      await sendMail(
        "Tried fetching and updating database with previous missed perp price update events multiple times , but failed. Need manual intervention"
      );
      return -1;
    } else {
      try {
        const latestBlock = await websocketProvider.getBlockNumber();
        const fromBlock = Number(blockNumberOfTheLastEntryMadeInDatabase);
        const toBlock = latestBlock;
        const processedEvents = [];

        for (let start = fromBlock; start <= toBlock; start += 100) {
          const end = Math.min(start + 99, toBlock);
          const events = await contract.queryFilter(
            "PerpPriceUpdated",
            start,
            end
          );

          const chunkProcessed = events.map((event) => {
            return {
              newPerpPrice: event.args[0],
              timestamp: event.args[1],
              blockNumber: event.blockNumber,
            };
          });

          processedEvents.push(...chunkProcessed);
        }

        for (let i = 0; i < processedEvents.length; i++) {
          await storePerpData(
            processedEvents[i].newPerpPrice,
            processedEvents[i].timestamp,
            processedEvents[i].blockNumber
          );
        }
        return 1;
      } catch {
        await new Promise((resolve) => {
          let waitTime = getExponentialBackOffTime(
            attemptNumber,
            baseWaitPeriod,
            maxWaitPeriod
          );
          setTimeout(resolve, waitTime);
        });
      }
    }
    attemptNumber++;
  }
}

async function connectWebSocket() {
  let attemptNumber = 1;
  let baseWaitPeriod = 5000; //5 seconds
  let maxWaitPeriod = 60000; // 60 seconds

  while (attemptNumber <= 11) {
    if (attemptNumber > 10) {
      await sendMail(
        "Tried connecting websocket multiple times, but failed. Need manual intervention."
      );
      return false;
    } else {
      try {
        websocketProvider = new ethers.WebSocketProvider(WS_RPC_URL);
        await websocketProvider.getBlockNumber();

        contract = new ethers.Contract(
          CONTRACT_ADDRESS,
          contractABI,
          websocketProvider
        );

        return true;
      } catch {
        await new Promise((resolve) => {
          let waitTime = getExponentialBackOffTime(
            attemptNumber,
            baseWaitPeriod,
            maxWaitPeriod
          );
          setTimeout(resolve, waitTime);
        });
      }
    }
    attemptNumber++;
  }
}

function cleanupConnection() {
  if (contract) {
    contract.removeListener("PerpPriceUpdated", perpPriceHandler);
  }

  if (websocketProvider && websocketProvider.websocket) {
    websocketProvider.websocket.removeEventListener("close", closeHandler);
    websocketProvider.websocket.close();
  }
}

async function setupEventListeners() {
  contract.on("PerpPriceUpdated", perpPriceHandler);

  websocketProvider.websocket.addEventListener("close", closeHandler);
}

async function listenAndRespondToPerpPriceUpdatedEvent() {
  // following console is judt for testing
  // console.log("Perp Price updation is being handled properly");
  isConnectionBrokenManually = false;
  const connected = await connectWebSocket();
  if (connected) {
    let isInserted = await insertMissedPerpPriceUpdates();
    if (isInserted == -1) {
      setTimeout(restart, 100);
    } else {
      await setupEventListeners();
    }
  } else {
    setTimeout(restart, 100);
  }
}

async function restart() {
  isConnectionBrokenManually = true;
  cleanupConnection();
  restartCount++;
  if (restartCount <= MAX_RESTART) {
    setTimeout(listenAndRespondToPerpPriceUpdatedEvent, 10000);
  } else {
    await sendMail(
      "Backend server portion that listens and saves perp price updates is going down. It has reached its maximum restart capacity"
    );
  }
}

module.exports = listenAndRespondToPerpPriceUpdatedEvent;
