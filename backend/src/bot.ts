import { TwitterApi } from "twitter-api-v2";
import dotenv from "dotenv";

dotenv.config();

// Initialize Twitter client
const client = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY!,
  appSecret: process.env.TWITTER_API_SECRET!,
  accessToken: process.env.TWITTER_ACCESS_TOKEN!,
  accessSecret: process.env.TWITTER_ACCESS_SECRET!,
});

// Create a stream to listen for mentions
async function startBot() {
  try {
    // Get the bot's user ID
    const me = await client.v2.me();
    const botId = me.data.id;

    // Create a stream for mentions
    const stream = await client.v2.searchStream({
      "tweet.fields": ["referenced_tweets", "author_id", "in_reply_to_user_id"],
      expansions: ["referenced_tweets.id", "author_id"],
    });

    console.log("Bot started! Listening for mentions...");

    // Handle incoming tweets
    stream.on("data", async (tweet) => {
      try {
        // Check if the tweet is a reply and mentions our bot
        if (
          tweet.data.referenced_tweets?.some((ref: any) => ref.type === "replied_to")
        ) {
          // Get the original tweet (the one being replied to)
          const originalTweetId = tweet.data.referenced_tweets.find(
            (ref: any) => ref.type === "replied_to"
          )?.id;

          if (originalTweetId) {
            // Fetch the original tweet
            const originalTweet = await client.v2.singleTweet(originalTweetId, {
              "tweet.fields": ["author_id"],
              expansions: ["author_id"],
            });

            if (originalTweet.data) {
              const originalAuthor = originalTweet.includes?.users?.[0];

              // Construct the reply message
              const replyText = `Original tweet by @${originalAuthor?.username}:\nhttps://twitter.com/${originalAuthor?.username}/status/${originalTweetId}`;

              // Reply to the user
              await client.v2.reply(replyText, tweet.data.id);
            }
          }
        }
      } catch (error) {
        console.error("Error processing tweet:", error);
      }
    });

    stream.on("error", (error) => {
      console.error("Stream error:", error);
    });
  } catch (error) {
    console.error("Error starting bot:", error);
  }
}

// Start the bot
startBot();
