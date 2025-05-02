const dotenv = require("dotenv");
dotenv.config();
const { getSpecificDataRange } = require("./db.js");
const start = require("./handleExecuteFundingRateMechanismFunction.js");
const listenAndRespondToPerpPriceUpdatedEvent = require("./handlePerpPriceUpdatedEvent.js");
const cors = require("cors");

// express app
const express = require("express");
const app = express();
const port = process.env.PORT || 3000; // Default to 3000 if PORT is not set
app.use(cors());

async function startFundingRateAndPerpPriceUpdateHandling() {
  await start();
  await listenAndRespondToPerpPriceUpdatedEvent();
}

app.get("/getPerpPriceData", async (req, res) => {
  const { x, y } = req.query;

  if (!x || !y || isNaN(x) || isNaN(y)) {
    return res.status(400).json({ error: "Invalid x or y value" });
  }

  try {
    const dataPoints = await getSpecificDataRange(parseInt(x), parseInt(y));
    res.json({ dataPoints }); // Send the fetched data points to the frontend
  } catch (err) {
    // console.log("error is :", err);
    res.status(500).json({ error: "Error fetching data points." });
  }
});

// Start the server
app.listen(port, "0.0.0.0", () => {
  console.log(`Server is running on http://0.0.0.0:${port}`);
});
startFundingRateAndPerpPriceUpdateHandling();
