const express = require("express");
const app = express();
const { createPost } = require("./functions/createPost");
const { TwitterApi } = require("twitter-api-v2"); 
const cron = require("node-cron");
const { deployToRender } = require("./functions/deployToRender");
require("dotenv").config();

const port = process.env.PORT || 4000;

const client = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_KEY_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

// Try to post every 4 hours
cron.schedule("0 */4 * * *", async () => {
  createPost();
});

app.get("/", (req, res) => {
  res.send("Breaking Casting News is up and running!");
});

app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});

if (process.env.NODE_ENV === "production") {
  // Redeploy render service at: 3:15 AM, 7:15 AM, 11:15 AM, 3:15 PM, 7:15 PM, and 11:15 PM
  cron.schedule("15 3,7,11,15,19,23 * * *", () => {
    deployToRender();
  });
}
