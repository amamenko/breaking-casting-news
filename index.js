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

// Try to post every 10 minutes past every 4th hour
cron.schedule("*/10 */4 * * *", async () => {
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
  // Redeploy render service at: 2:15 AM, 6:15 AM, 10:15 AM, 2:15 PM, 6:15 PM, and 10:15 PM
  cron.schedule("15 2,6,10,14,18,22 * * *", () => {
    deployToRender();
  });
}
