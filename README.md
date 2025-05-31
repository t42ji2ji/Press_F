# 🕯️ Press F (to pay respects)

**Press F** is a decentralized meme protocol that turns viral tweets into tradable tokens — and finally gives credit where it’s due.

At its core, Press F is a system that lets anyone instantly deploy a memecoin tied to a specific tweet. The original tweet author can later prove authorship and **claim a share of the token’s transaction fees** — a fairer, more respectful memecoin model.

## 🧩 What’s in the system?

-   **Chrome Extension**:  
    Lets users interact with tweets directly. Hover over any post on Twitter, press `F`, and automatically reply with `@payrespectsbot`.
    
-   **Tag Bot** (`@payrespectsbot`):  
    Listens for these tags. When triggered, it:
    
    1.  Deploys a new memecoin tied to the tweet
    2.  Replies with the token’s contract address
        
-   **Token Creation & Registry**:  
    Each token is uniquely tied to a tweet. This creates a canonical “official coin” for that post.
    
-   **ZK Poster Verification**:  
    The original tweet author can use **zero-knowledge proof** to demonstrate they control the account that posted the tweet — and claim a portion of the token’s transaction fees.  
No centralized verification is required — just on-chain proof of authorship.

## 💡 Why “Pay Respects”?

In today's memecoin world, viral content often gets used and monetized by others, with the original creators left out.

Press F flips the dynamic:

-   Anyone can spin up a coin with one keypress
-   The memecoin may still spread organically
-   **The poster gets rewarded** if it pops off
    
It’s a remix of meme culture, cryptoeconomics, and attribution — powered by trustless tech.

## 🛠️ How It Works

1.  User hovers over a tweet and presses `F` (via extension)
2.  The extension replies with `@payrespectsbot`
3.  The bot:
    -   Deploys a memecoin tied to that tweet
    -   Replies with `“contract deployed, ca: [address]”`
4.  The original poster can:
    -   Visit the redemption platform
    -   Prove ownership using ZK verification
    -   Claim a share of the transaction fees