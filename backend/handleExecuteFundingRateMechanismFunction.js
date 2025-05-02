const dotenv = require("dotenv");
dotenv.config();
const { ethers } = require("ethers");
const getExponentialBackOffTime = require("./utilityFunctions.js");
const sendMail = require("./sendMail.js");
const contractABI = require("./contractABI.js");

const HTTP_RPC_URL = process.env.HTTP_RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

let timeouts = [];
let eightHours = 8 * 60 * 60; //eight hours in seconds
let httpProvider;
let wallet;
let contract;
let numberOfTimesRestartFunctionCalled = 0;
const MAX_RESTART = 5;

// in below function, lastFundingTime must be BigInt and it should represent time in seconds.

// if below function returns a positive value, it means , that many seconds are left in next funding roud but if it returns -ve value, it means that next funding round should have happened by this time but did not happen
function getTimeLeftForNextFundingRound(lastFundingTime) {
  let currentTime = BigInt(Math.floor(Date.now() / 1000));
  let timePassedSinceLastFundingTime = currentTime - lastFundingTime;
  let timeLeftForNextFundingRound =
    BigInt(eightHours) - timePassedSinceLastFundingTime;

  // following console is just for testing
  // console.log(
  //   "getTimeLeftForNextFundingRound function called, timeLeft for next funding round is : ",
  //   timeLeftForNextFundingRound
  // );

  return timeLeftForNextFundingRound;
}

function connectHttp() {
  httpProvider = new ethers.JsonRpcProvider(HTTP_RPC_URL);

  // following console is just for testing
  // console.log("http server connected");
  // Here we do not try to check connection like we do in case of websocket connection bcoz http connection unlike websocket connection is not a persistent connection , and we would check and retry it when we are making calls.
}

async function getLastFundingTime() {
  let attemptNumber = 1;
  let baseWaitPeriod = 1000; //1 second
  let maxWaitPeriod = 30000; //30 seconds

  while (attemptNumber <= 11) {
    if (attemptNumber > 10) {
      await sendMail(
        "Tried fetching lastFundingTime 10 times using http server, but could not fetch it."
      );
      throw new Error("Could not fetch last funding time.");
    } else {
      try {
        let lastFundingTime = await contract.lastFundingTime();
        // following console lines is just for testing
        // console.log(
        //   "lastFundingTime is returned, last funding time is: ",
        //   lastFundingTime
        // );
        // console.log(
        //   "lastFundingTime is returned, number of attempts it took: ",
        //   attemptNumber
        // );
        return lastFundingTime;
      } catch {
        await new Promise((resolve) => {
          let waitTime = getExponentialBackOffTime(
            attemptNumber,
            baseWaitPeriod,
            maxWaitPeriod
          );
          let timeoutID = setTimeout(resolve, waitTime);
          timeouts.push(timeoutID);
        });
      }
    }
    attemptNumber++;
  }
}

async function restart() {
  if (numberOfTimesRestartFunctionCalled < MAX_RESTART) {
    numberOfTimesRestartFunctionCalled++;
    timeouts.forEach(clearTimeout);
    timeouts.length = 0;
    setTimeout(start, 10000); // again start after 10 second waiting period
  } else {
    await sendMail(
      "The restart function has reached its maximum call limit. Therefore, the backend responsible for managing calls to the `executeFundingRateMechanism` function on the smart contract is terminating. Please resolve the issue manually and restart the process."
    );
  }
}

async function start() {
  // following console is judt for testing
  // console.log("Funding rate mechanism is being handled properly");
  connectHttp();
  wallet = new ethers.Wallet(PRIVATE_KEY, httpProvider);
  contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, wallet);
  let lastFundingTime;

  try {
    lastFundingTime = await getLastFundingTime();
  } catch (error) {
    // following console is for testing only
    // console.log(
    //   "got error while fetching last funding time in start body : ",
    //   error
    // );
    lastFundingTime = BigInt(Math.floor(Date.now() / 1000));
  }

  let timeLeftForNextFundingRound =
    getTimeLeftForNextFundingRound(lastFundingTime);

  if (timeLeftForNextFundingRound > 0n) {
    let timeoutID = setTimeout(
      callFundingRateMechanism,
      Number(timeLeftForNextFundingRound) * 1000
    );
    timeouts.push(timeoutID);
  } else {
    callFundingRateMechanism();
    // following console is just for testing
    // console.log(
    //   "callFundingRateMechanism function called immediately without any wait period from start function"
    // );
  }
}

async function callFundingRateMechanism() {
  timeouts.forEach(clearTimeout);
  timeouts.length = 0;
  let attemptNumber = 1;
  let baseWaitPeriod = 15000; //15 seconds
  let maxWaitPeriod = 90000; //1.5 min
  let lastFundingTime;

  // In below while loop we try to run fundingRateMechanism function on smart contract by calling executeFundingRateMechanism function
  while (attemptNumber <= 11) {
    try {
      let tx = await contract.executeFundingRateMechanism();
      let receipt = await tx.wait();
      // receipt.status == 1 mean that the transaction executed successfully
      if (receipt.status == 1) {
        await sendMail("executeFundingRateMechanism function called.");
        // following console line is just for testing
        // console.log("executeFundingRateMechanism function called.");

        // below we are testing wether funding rate was executed ( by some user or backend) or not (fundingRateMechanism function on smart contract not called (Note->fundingRateMechanism is a different function which is called from inside of executeFundingRateMechanism function if certain conditions are met and call is from backend))

        let testLastFundingTime;
        try {
          testLastFundingTime = await getLastFundingTime();

          let testTimeLeftForNextFundingRound =
            getTimeLeftForNextFundingRound(testLastFundingTime);

          //  if following condition is true, then it means funding rate mechanism function was called by either backend or user. And lastFundingTime is updated now.
          if (testTimeLeftForNextFundingRound > 0n) {
            await sendMail(
              "funding rate mechanism function executed. LastFundingTime updated."
            );
            // following line is just for testing
            // console.log(
            //   "funding rate mechanism function executed. LastFundingTime updated."
            // );
            break;
          } else {
            if (attemptNumber > 10) {
              await sendMail(
                "executeFundingRateMechanism function on smart contract is running, but still lastFundingTime is not being updated. Kindly check. Either it is failing test condition for running fundingRateMechanism function or there is something wrong with fundingRateMechanism function."
              );
              restart();
              return;
            } else {
              await new Promise((resolve) => {
                let waitTime = getExponentialBackOffTime(
                  attemptNumber,
                  baseWaitPeriod,
                  maxWaitPeriod
                );
                let timeoutID = setTimeout(resolve, waitTime);
                timeouts.push(timeoutID);
              });
            }
          }
        } catch {
          // this catch will run only if  getLastFundingTime function is throwing error
          await sendMail(
            "Tried multiple times, but not able to fetch lastFundingTime. Please check."
          );
          restart();
          return;
        }
      }
      // receipt.status == 0 mean that the transaction reached blockchain node , but then dropped due to (due to out-of-gas, revert, or other issues)
      else if (receipt.status == 0) {
        if (attemptNumber > 10) {
          await sendMail(
            "Transaction to call executeFundingRateMechanism function on smart contract is reaching the blockchain, but is not being successful (receipt.status=0)."
          );
          restart();
          return;
        } else {
          await new Promise((resolve) => {
            let waitTime = getExponentialBackOffTime(
              attemptNumber,
              baseWaitPeriod,
              maxWaitPeriod
            );
            let timeoutID = setTimeout(resolve, waitTime);
            timeouts.push(timeoutID);
          });
        }
      }
    } catch {
      if (attemptNumber > 10) {
        await sendMail(
          "Tried calling executeFundingRateMechanism on smart contract but the transaction is failing. Possible reasons-> low balance in wallet , network issue"
        );
        restart();
        return;
      } else {
        await new Promise((resolve) => {
          let waitTime = getExponentialBackOffTime(
            attemptNumber,
            baseWaitPeriod,
            maxWaitPeriod
          );
          let timeoutID = setTimeout(resolve, waitTime);
          timeouts.push(timeoutID);
        });
      }
    }
    attemptNumber++;
  }
  // following console is just for testing
  // console.log(
  //   "number of attempts it took to execute funding rate",
  //   attemptNumber
  // );

  // below we are scheduling next funding rate call
  try {
    lastFundingTime = await getLastFundingTime();
  } catch (error) {
    await sendMail(
      "Tried multiple times, but not able to fetch lastFundingTime. Please check."
    );
    restart();
    return;
  }

  let timeLeftForNextFundingRound =
    getTimeLeftForNextFundingRound(lastFundingTime);

  if (timeLeftForNextFundingRound > 0n) {
    let timeoutID = setTimeout(
      callFundingRateMechanism,
      Number(timeLeftForNextFundingRound) * 1000
    );
    timeouts.push(timeoutID);
  } else {
    let timeoutID = setTimeout(callFundingRateMechanism, 100);
    timeouts.push(timeoutID);
  }
}

module.exports = start;
