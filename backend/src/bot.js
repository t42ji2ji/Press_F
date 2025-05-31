"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const twitter_api_v2_1 = require("twitter-api-v2");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Initialize Twitter client
const client = new twitter_api_v2_1.TwitterApi({
    appKey: process.env.TWITTER_API_KEY,
    appSecret: process.env.TWITTER_API_SECRET,
    accessToken: process.env.TWITTER_ACCESS_TOKEN,
    accessSecret: process.env.TWITTER_ACCESS_SECRET,
});
// Create a stream to listen for mentions
function startBot() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Get the bot's user ID
            const me = yield client.v2.me();
            const botId = me.data.id;
            // Create a stream for mentions
            const stream = yield client.v2.searchStream({
                "tweet.fields": ["referenced_tweets", "author_id", "in_reply_to_user_id"],
                expansions: ["referenced_tweets.id", "author_id"],
            });
            console.log("Bot started! Listening for mentions...");
            // Handle incoming tweets
            stream.on("data", (tweet) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b, _c, _d;
                try {
                    // Check if the tweet is a reply and mentions our bot
                    if ((_a = tweet.data.referenced_tweets) === null || _a === void 0 ? void 0 : _a.some((ref) => ref.type === "replied_to")) {
                        // Get the original tweet (the one being replied to)
                        const originalTweetId = (_b = tweet.data.referenced_tweets.find((ref) => ref.type === "replied_to")) === null || _b === void 0 ? void 0 : _b.id;
                        if (originalTweetId) {
                            // Fetch the original tweet
                            const originalTweet = yield client.v2.singleTweet(originalTweetId, {
                                "tweet.fields": ["author_id"],
                                expansions: ["author_id"],
                            });
                            if (originalTweet.data) {
                                const originalAuthor = (_d = (_c = originalTweet.includes) === null || _c === void 0 ? void 0 : _c.users) === null || _d === void 0 ? void 0 : _d[0];
                                // Construct the reply message
                                const replyText = `Original tweet by @${originalAuthor === null || originalAuthor === void 0 ? void 0 : originalAuthor.username}:\nhttps://twitter.com/${originalAuthor === null || originalAuthor === void 0 ? void 0 : originalAuthor.username}/status/${originalTweetId}`;
                                // Reply to the user
                                yield client.v2.reply(replyText, tweet.data.id);
                            }
                        }
                    }
                }
                catch (error) {
                    console.error("Error processing tweet:", error);
                }
            }));
            stream.on("error", (error) => {
                console.error("Stream error:", error);
            });
        }
        catch (error) {
            console.error("Error starting bot:", error);
        }
    });
}
// Start the bot
startBot();
