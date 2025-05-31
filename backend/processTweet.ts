import dotenv from "dotenv";
dotenv.config();

import { TwitterApi } from "twitter-api-v2";
import { suggestToken, deployToken } from "./src/utils";
import { createPublicClient, http } from "viem";
import { optimismSepolia } from "viem/chains";
import { TOKEN_FACTORY_ADDRESS, TOKEN_FACTORY_ABI } from "./src/abi";

const appClient = new TwitterApi(process.env.TWITTER_BEARER_TOKEN!);
const userClient = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY!,
  appSecret: process.env.TWITTER_API_SECRET!,
  accessToken: process.env.TWITTER_ACCESS_TOKEN!,
  accessSecret: process.env.TWITTER_ACCESS_SECRET!,
});
const publicClient = createPublicClient({
  chain: optimismSepolia,
  transport: http(process.env.OPTIMISM_SEPOLIA_RPC_URL!),
});

async function processTweet(tweetId: string, originalTweetId: string) {
  try {
    // 1. Fetch the original tweet
    const originalTweet = await appClient.v2.singleTweet(originalTweetId, {
      "tweet.fields": ["author_id", "text"],
      expansions: ["author_id"],
    });
    const tweetText = originalTweet.data?.text || "";
    const originalAuthor = originalTweet.includes?.users?.[0];
    const xUrl = `https://x.com/${originalAuthor?.username}/status/${originalTweetId}`;
    const xUser = originalAuthor?.username || "";
    console.log("Original tweet text:", tweetText);
    console.log("Original author:", xUser);
    console.log("xUrl:", xUrl);

    // 2. Suggest token
    let symbol = "MEME";
    let name = "MemeCoin";
    try {
      const suggestion = await suggestToken(tweetText);
      symbol = suggestion.symbol;
      name = suggestion.name;
      console.log("Suggested token:", suggestion);
    } catch (e) {
      console.error("OpenAI suggestion failed", e);
      throw e;
    }

    // 3. Check if token already exists for this xUrl
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
        tokenInfo.tokenAddress !== "0x0000000000000000000000000000000000000000"
      ) {
        tokenExists = true;
        console.log(
          "Token already exists for this xUrl:",
          tokenInfo.tokenAddress
        );
      }
    } catch (e) {
      tokenExists = false;
    }
    if (tokenExists) {
      console.log("Token already exists, skipping deployment.");
      return;
    }

    // 4. Deploy token
    let hash = "";
    let tokenAddress = "";
    try {
      const deployed = await deployToken(name, symbol, xUrl, xUser);
      hash = deployed.hash;
      tokenAddress = deployed.tokenAddress;
      console.log("Deployed token:", { hash, tokenAddress });
    } catch (e) {
      console.error("Token deployment failed.", e);
      throw e;
    }

    // 5. Reply to the tweet
    const replyText = `🚀 Your token is live!\n\n💎 Name: ${name}\n💫 Symbol: ${symbol}\n🔗 Address: ${tokenAddress}\n\nLFG! 🚀`;
    await userClient.v2.reply(replyText, tweetId);
    console.log("✨ Replied to user with token details");
  } catch (error) {
    console.error("Error in processTweet:", error);
  }
}

// Example usage: node processTweet.js <tweetId> <originalTweetId>
const [, , tweetId, originalTweetId] = process.argv;
if (!tweetId || !originalTweetId) {
  console.error("Usage: ts-node processTweet.ts <tweetId> <originalTweetId>");
  process.exit(1);
}
processTweet(tweetId, originalTweetId);
