import { TwitterApi } from "twitter-api-v2";
import dotenv from "dotenv";

dotenv.config();

// For polling/searching (OAuth 2.0 Bearer Token)
const appClient = new TwitterApi(process.env.TWITTER_BEARER_TOKEN!);

// For posting/replying as the bot (OAuth 1.0a User Context)
const userClient = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY!,
  appSecret: process.env.TWITTER_API_SECRET!,
  accessToken: process.env.TWITTER_ACCESS_TOKEN!,
  accessSecret: process.env.TWITTER_ACCESS_SECRET!,
});

// Poll mentions timeline
async function startBot() {
  try {
    console.log("Getting bot user info...");
    const me = await userClient.v2.me();
    const botId = me.data.id;
    console.log("Bot ID:", botId);
    let sinceId: string | undefined = undefined;

    console.log("Bot started! Polling for mentions...");

    setInterval(async () => {
      try {
        const mentions = await userClient.v2.userMentionTimeline(botId, {
          "tweet.fields": [
            "referenced_tweets",
            "author_id",
            "in_reply_to_user_id",
          ],
          expansions: ["referenced_tweets.id", "author_id"],
          max_results: 10,
          since_id: sinceId,
        });
        console.log("Got mentions");

        if (mentions.data?.data && mentions.data.data.length > 0) {
          console.log("Found mentions:", mentions.data.data.length);

          // Update sinceId to the newest mention
          sinceId = mentions.data.data[0].id;

          for (const tweet of mentions.data.data) {
            console.log("Processing tweet:", tweet.id, "data:", tweet);

            // Check if the tweet is a reply
            if (
              tweet.referenced_tweets?.some(
                (ref: any) => ref.type === "replied_to"
              )
            ) {
              const originalTweetId = tweet.referenced_tweets.find(
                (ref: any) => ref.type === "replied_to"
              )?.id;

              if (originalTweetId) {
                // Fetch the original tweet (with app context)
                console.log("Getting original tweet");
                const originalTweet = await appClient.v2.singleTweet(
                  originalTweetId,
                  {
                    "tweet.fields": ["author_id"],
                    expansions: ["author_id"],
                  }
                );
                console.log("Got original tweet");

                if (originalTweet.data) {
                  const originalAuthor = originalTweet.includes?.users?.[0];

                  // Construct the reply message
                  const replyText = `Thank you @${originalAuthor?.username} for using the bot! The CA is`;

                  // Reply to the user (with user context)
                  console.log("Replying to user");
                  await userClient.v2.reply(replyText, tweet.id);
                  console.log("Replied to user");
                }
              }
            }
          }
        }
      } catch (error) {
        console.error("Error processing mentions:", error);
      }
    }, 3 * 1000); // Poll every 3 seconds
  } catch (error) {
    console.error("Error starting bot:", error);
  }
}

// Start the bot
startBot();
