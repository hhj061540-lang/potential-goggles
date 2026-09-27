const express = require("express");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

const VPN_API =
  process.env.VPN_API ||
  "https://atlas-vpn-console--hjh267981.replit.app";

app.use(express.json());

// GET / -> redirect to Replit app
app.get("/", (req, res) => {
  res.redirect(VPN_API);
});

// /api/* -> proxy to Replit /api/*
app.use("/api", async (req, res) => {
  try {
    const target = `${VPN_API}${req.originalUrl}`;

    console.log(`${req.method} ${target}`);

    const response = await axios({
      method: req.method,
      url: target,
      params: req.query,
      data: req.body,
      headers: {
        "Content-Type": "application/json",
        Accept: req.headers.accept || "application/json"
      },
      timeout: 30000,
      validateStatus: () => true
    });

    res.status(response.status);

    if (response.headers["content-type"]) {
      res.set("Content-Type", response.headers["content-type"]);
    }

    res.send(response.data);
  } catch (error) {
    console.error("Proxy error:", error.message);

    res.status(502).json({
      error: "VPN API unavailable",
      message: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`VPN proxy running on port ${PORT}`);
  console.log(`Target: ${VPN_API}`);
});
