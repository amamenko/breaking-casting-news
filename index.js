const express = require("express");
const app = express();
const { createPost } = require("./functions/createPost");
const { TwitterApi } = require("twitter-api-v2");
const { parseISO, subHours, compareAsc } = require("date-fns");
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

// Try to post every 50 minutes every 4-5 hours
cron.schedule("*/50 0,1,4,5,8,9,12,13,16,17,20,21 * * *", async () => {
  const tweetsOfBCN = await client.v2.userTimeline("1488719370692050944", {
    exclude: "replies",
    "tweet.fields": ["created_at"],
  });
  if (tweetsOfBCN) {
    if (tweetsOfBCN._realData) {
      if (tweetsOfBCN._realData.data) {
        const mostRecentTweet = tweetsOfBCN._realData.data[0];

        if (mostRecentTweet) {
          const mostRecentTimePosted = parseISO(mostRecentTweet.created_at);
          const twoHoursAgo = subHours(new Date(), 2);

          // Returns -1 if tweet was made more than two hours ago and 1 if most recent tweet was made less than two hours ago
          const comparison = compareAsc(mostRecentTimePosted, twoHoursAgo);

          if (comparison === -1) {
            console.log(
              "No tweet posted yet in the last two hours! Attempting to create post..."
            );
            createPost();
          } else {
            console.log("Already posted in the last two hours!");
            return;
          }
        } else {
          console.log("Couldn't find most recent tweet!");
          return;
        }
      } else {
        createPost();
      }
    }
  }
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
