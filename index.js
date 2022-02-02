const express = require("express");
const app = express();
const { createPost } = require("./functions/createPost");
const { TwitterApi } = require("twitter-api-v2");
const { isToday, parseISO } = require("date-fns");
const cron = require("node-cron");
require("dotenv").config();

const port = process.env.PORT || 4000;

const client = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_KEY_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

cron.schedule("0,*/7 14-16 * * *", async () => {
  const tweetsOfBCN = await client.v2.userTimeline("1488719370692050944", {
    exclude: "replies",
    "tweet.fields": ["created_at"],
  });

  if (tweetsOfBCN) {
    if (tweetsOfBCN._realData) {
      if (tweetsOfBCN._realData.data) {
        const mostRecentTweet = tweetsOfBCN._realData.data[0];

        if (mostRecentTweet) {
          if (isToday(parseISO(mostRecentTweet.created_at))) {
            return;
          } else {
            console.log(
              "No tweet posted yet today! Attempting to create post..."
            );
            createPost();
          }
        }
      }
    }
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
