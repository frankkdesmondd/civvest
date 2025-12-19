import express from "express";
import axios from "axios";

const router = express.Router();

router.get("/prices", async (req, res) => {
  try {
    const apiKey = process.env.TWELVE_DATA_KEY;

    const symbols = [
      "CL",
      "BZ",
      "NG",
      "HO",
      "RB",
      "OIL_UK",
      "CL1",
      "DUBAI",
      "OPEC",
      "OVX"
    ];

    // Build the API request URL for multiple symbols
    const url = `https://api.twelvedata.com/price?symbol=${symbols.join(
      ","
    )}&apikey=${apiKey}`;

    const response = await axios.get(url);

    res.json(response.data); // send back all prices
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to fetch oil prices" });
  }
});

export default router;
