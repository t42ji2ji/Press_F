import { TwitterApi } from "twitter-api-v2";
import { createPublicClient, http } from "viem";
import { optimismSepolia } from "viem/chains";
import { TOKEN_FACTORY_ADDRESS, TOKEN_FACTORY_ABI } from "./abi";
import { suggestToken, deployToken } from "./utils";
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

// viem public client for checking token existence
const publicClient = createPublicClient({
  chain: optimismSepolia,
  transport: http(process.env.OPTIMISM_SEPOLIA_RPC_URL!),
});

// Poll mentions timeline
async function startBot() {
  try {
    console.log("Getting bot user info...");
    const me = await userClient.v2.me();
    const botId = me.data.id;
    let sinceId: string | undefined = undefined;

    console.log("Bot started! Polling for mentions...");

    while (true) {
      try {
        const mentions = await userClient.v2.userMentionTimeline(botId, {
          "tweet.fields": [
            "referenced_tweets",
            "author_id",
            "in_reply_to_user_id",
          ],
          expansions: ["referenced_tweets.id", "author_id"],
          max_results: 50,
          since_id: sinceId,
        });
        if (mentions.data?.data && mentions.data.data.length > 0) {
          sinceId = mentions.data.data[mentions.data.data.length - 1].id;
          const tweet = mentions.data.data[mentions.data.data.length - 1];
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
              const originalTweet = await appClient.v2.singleTweet(
                originalTweetId,
                {
                  "tweet.fields": ["author_id", "text"],
                  expansions: ["author_id"],
                }
              );
              const tweetText = originalTweet.data?.text || "";
              const originalAuthor = originalTweet.includes?.users?.[0];
              const xUrl = `https://x.com/${originalAuthor?.username}/status/${originalTweetId}`;
              const xUser = originalAuthor?.username || "";

              // 1. Suggest token
              let symbol = "MEME";
              let name = "MemeCoin";
              try {
                const suggestion = await suggestToken(tweetText);
                symbol = suggestion.symbol;
                name = suggestion.name;
              } catch (e) {
                console.error("OpenAI suggestion failed", e);
                throw e;
              }

              // 2. Check if token already exists for this xUrl
              let tokenExists = false;
              try {
                const tokenInfo = await publicClient.readContract({
                  address: TOKEN_FACTORY_ADDRESS,
                  abi: TOKEN_FACTORY_ABI,
                  functionName: "getTokenByXUrl",
                  args: [xUrl],
                });
                if (
                  tokenInfo &&
                  tokenInfo.tokenAddress &&
                  tokenInfo.tokenAddress !==
                    "0x0000000000000000000000000000000000000000"
                ) {
                  tokenExists = true;
                }
              } catch (e) {
                // If it reverts, token does not exist
                tokenExists = false;
              }
              if (tokenExists) {
                console.log(`Token already exists for xUrl: ${xUrl}`);
                throw new Error("Token already exists");
              }

              // 3. Deploy token using util
              let hash = "";
              let tokenAddress = "";
              try {
                const deployed = await deployToken(name, symbol, xUrl, xUser);
                hash = deployed.hash;
                tokenAddress = deployed.tokenAddress;
              } catch (e) {
                console.error("Token deployment failed.", e);
                throw e;
              }

              // 4. Reply to user with emojis
              const replyText = `🚀 Your token is live!\n\n💎 Name: ${name}\n💫 Symbol: ${symbol}\n🔗 Address: ${tokenAddress}\n\nLFG! 🚀`;
              await userClient.v2.reply(replyText, tweet.id);
              console.log("✨ Replied to user with token details");
            }
          }
        }
      } catch (error) {
        console.error("Error processing mentions:", error);
      }

      // Sleep for 15 minutes
      await new Promise((resolve) => setTimeout(resolve, 15 * 60 * 1000));
    }
  } catch (error) {
    console.error("Error starting bot:", error);
  }
}

// Start the bot
startBot();
