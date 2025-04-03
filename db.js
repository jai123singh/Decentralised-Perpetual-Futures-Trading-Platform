const dotenv = require("dotenv");
dotenv.config();
const { createClient } = require("@supabase/supabase-js");
const getExponentialBackOffTime = require("./utilityFunctions.js");
const sendMail = require("./sendMail.js");

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Following function inserts perp price update in the database
// all the parameters must be BigInt
// on successful inserting this function returns 1. On failure, it sends mail to developer and returns -1
async function storePerpData(perpPrice, timestamp, blockNumber) {
  let attemptNumber = 1;
  let baseWaitPeriod = 1000; //1 second
  let maxWaitPeriod = 15000; //15 seconds

  while (attemptNumber <= 6) {
    if (attemptNumber > 5) {
      await sendMail(
        "Error encountered multiple times while trying to insert perp price update in the database. Please check."
      );
      // following console is just for testing
      // console.log(
      //   "Error encountered multiple times while trying to insert perp price update in the database. Please check."
      // );
      return -1;
    } else {
      try {
        // Convert BigInt values to strings for database storage
        // PostgreSQL NUMERIC and BIGINT can handle the string representations
        const data = {
          perp_price: perpPrice.toString(),
          timestamp: timestamp.toString(),
          block_number: blockNumber.toString(),
        };

        // Insert data into the perp_prices table
        const { data: result, error } = await supabase
          .from("perp_prices")
          .insert(data);

        if (error) {
          throw error;
        }
        // following console is just for testing
        // console.log("perp price data inserted successfully: ", result);
        return 1;
      } catch (error) {
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

// Following function retrieves the block number of the most recent entry in the perp_prices table
//This function returns
// latestBlockNumber as BigInt if call is successful and table is not empty
// 0 as BigInt if call is successful but table is empty
// -1 as BigInt if call fails

async function getLatestBlockNumber() {
  let attemptNumber = 1;
  let baseWaitPeriod = 1000; //1 second
  let maxWaitPeriod = 15000; //15 seconds

  while (attemptNumber <= 6) {
    if (attemptNumber > 5) {
      await sendMail(
        "Tried getting the latest block number, but encountered some problem . Note -> Database is empty is not the problem."
      );
      // following console is just for testing
      // console.log(
      //   "Tried getting the latest block number, but encountered some problem . Note -> Database is empty is not the problem."
      // );
      return BigInt(-1);
    } else {
      try {
        // Query the perp_prices table for the most recent entry
        // Assuming entries are inserted in chronological order, so highest ID = most recent
        const { data, error } = await supabase
          .from("perp_prices")
          .select("block_number")
          .order("id", { ascending: false })
          .limit(1);

        if (error) {
          // following console is just for testing
          // console.error("Error fetching latest block number:", error);
          throw error;
        }

        // If no data returned, the table is empty
        if (!data || data.length === 0) {
          // following console is just for testing
          // console.log("No entries found in perp_prices table");
          return BigInt(0);
        }

        // Convert the string block number back to BigInt
        const latestBlockNumber = BigInt(data[0].block_number);
        // following console is just for testing
        // console.log(
        //   "Latest block number retrieved:",
        //   latestBlockNumber.toString()
        // );

        return latestBlockNumber;
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

//Following function
// Retrieves a specific range of data points from the perp_prices table
// Skips x*y entries from the most recent entries and then returns the next x entries

// x - Number of data points to return
// y - Multiplier for determining how many entries to skip
// on success, this function returns an array of data points containing perp_price and timestamp.It might be empty array if it doesnt find matching dataPoints
// if something goes wrong, this function will throw an error

//  in following function u need not to worry abt  1- skipCount being larger than total number of entries in database and 2- lesser than x entries left in database after skipping skipCount number of entries. Supabase automatically handles it. for first case - it returns empty array , for second case- it returns the remaining dataPoints

async function getSpecificDataRange(x, y) {
  let attemptNumber = 1;
  let baseWaitPeriod = 1000; //1 second
  let maxWaitPeriod = 15000; //15 seconds

  if (!Number.isInteger(x) || !Number.isInteger(y) || x <= 0 || y < 0) {
    throw new Error(
      "Parameters x and y must be positive integers, and x must be greater than 0"
    );
  }

  while (attemptNumber <= 6) {
    if (attemptNumber > 5) {
      await sendMail(
        "Error encountered multiple times while trying to fetch required data from database. Please check."
      );
      throw new Error(
        "Error encountered multiple times while trying to fetch required data from database. Please check."
      );
    } else {
      try {
        // Calculate how many entries to skip
        const skipCount = x * y;

        const { data, error } = await supabase
          .from("perp_prices")
          .select("perp_price, timestamp")
          .order("id", { ascending: false }) // Most recent first
          .range(skipCount, skipCount + x - 1); // Skip skipCount and take x entries

        if (error) {
          // following line is just for testing
          // console.error("Error fetching specific data range:", error);
          throw error;
        }

        // If no data returned, might be out of range
        if (!data || data.length === 0) {
          // following line is just for testing
          // console.log("No data points found in the specified range");
          return [];
        }

        // Convert string values back to BigInt
        const formattedData = data.map((item) => ({
          perp_price: item.perp_price,
          timestamp: item.timestamp,
        }));

        // following line is just for testing
        // console.log(
        //   `Retrieved ${formattedData.length} data points after skipping ${skipCount} entries`,
        //   formattedData
        // );

        return formattedData;
      } catch (error) {
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

module.exports = { storePerpData, getLatestBlockNumber, getSpecificDataRange };

// following is a function that tests the functionality of above functions
// async function test() {
//   const sampleData = [
//     { perpPrice: 100, timestamp: 10, blockNumber: 1000 },
//     { perpPrice: 101, timestamp: 11, blockNumber: 1002 },
//     { perpPrice: 105, timestamp: 15, blockNumber: 1006 },
//     { perpPrice: 99, timestamp: 15, blockNumber: 1008 },
//     { perpPrice: 98, timestamp: 15, blockNumber: 1008 },
//     { perpPrice: 90, timestamp: 15, blockNumber: 1008 },
//     { perpPrice: 110, timestamp: 20, blockNumber: 1010 },
//     { perpPrice: 105, timestamp: 20, blockNumber: 1010 },
//     { perpPrice: 90, timestamp: 20, blockNumber: 1010 },
//     { perpPrice: 60, timestamp: 22, blockNumber: 1011 },
//     { perpPrice: 100, timestamp: 22, blockNumber: 1011 },
//     { perpPrice: 100, timestamp: 30, blockNumber: 1020 },
//     { perpPrice: 150, timestamp: 40, blockNumber: 1030 },
//     { perpPrice: 140, timestamp: 50, blockNumber: 1050 },
//     { perpPrice: 120, timestamp: 80, blockNumber: 1090 },
//   ];

//   let latestBlockNumber;
//   let returnedValues;
//   latestBlockNumber = await getLatestBlockNumber();

//   if (latestBlockNumber === null) {
//     console.log(
//       "working correctly, without any entry, the first blocknumber is null"
//     );
//   } else {
//     console.log("something went wrong");
//   }
//   returnedValues = await getSpecificDataRange(2, 3);

//   if (returnedValues.length == 0) {
//     console.log(
//       "working correctly, without any entry, the returned data is null"
//     );
//   }

//   for (let i = 0; i <= 9; i++) {
//     await storePerpData(
//       sampleData[i].perpPrice,
//       sampleData[i].timestamp,
//       sampleData[i].blockNumber
//     );
//   }

//   latestBlockNumber = await getLatestBlockNumber();

//   if (latestBlockNumber !== null) {
//     console.log(
//       "working correctly, with first 10 entries the latest blocknumber is : ",
//       latestBlockNumber
//     );
//   } else {
//     console.log(
//       "something went wrong,even after entries the latestBlockNumber came out to be null"
//     );
//   }
//   returnedValues = await getSpecificDataRange(2, 3);

//   if (returnedValues.length !== 0) {
//     console.log(
//       "working fine. Returned values are not null after insertion. Retrieved values are : ",
//       returnedValues
//     );
//   } else {
//     console.log(
//       "something went wrong, even after entries, returned value is empty array"
//     );
//   }

//   for (let i = 10; i < sampleData.length; i++) {
//     await storePerpData(
//       sampleData[i].perpPrice,
//       sampleData[i].timestamp,
//       sampleData[i].blockNumber
//     );
//   }

//   latestBlockNumber = await getLatestBlockNumber();

//   if (latestBlockNumber !== null) {
//     console.log(
//       "working correctly, with first last entries made the latest blocknumber is : ",
//       latestBlockNumber
//     );
//   } else {
//     console.log(
//       "something went wrong,even after last entries the latestBlockNumber came out to be null"
//     );
//   }
//   returnedValues = await getSpecificDataRange(2, 3);

//   if (returnedValues.length !== 0) {
//     console.log(
//       "working fine. Returned values are not null after last insertions. Retrieved values are : ",
//       returnedValues
//     );
//   } else {
//     console.log(
//       "something went wrong, even after last entries, returned value is empty array"
//     );
//   }
// }

// test();
