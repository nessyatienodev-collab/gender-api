const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(cors());

// API endpoint
app.get("/api/classify", async (req, res) => {
  const name = req.query.name;

  // missing name
  if (!name) {
    return res.status(400).json({
      status: "error",
      message: "Missing name parameter"
    });
  }

  // call Genderize API
  try {
    const response = await axios.get(
      "https://api.genderize.io?name=" + name
    );

    const data = response.data;

    // edge case
    if (!data.gender || data.count === 0) {
      return res.status(422).json({
        status: "error",
        message: "No prediction available for the provided name"
      });
    }

    const sample_size = data.count;

    const is_confident =
      data.probability >= 0.7 && sample_size >= 100;

    res.json({
      status: "success",
      data: {
        name: data.name,
        gender: data.gender,
        probability: data.probability,
        sample_size: sample_size,
        is_confident: is_confident,
        processed_at: new Date().toISOString()
      }
    });

  } catch (error) {
    res.status(502).json({
      status: "error",
      message: "Upstream or server failure"
    });
  }
});

// start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});