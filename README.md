# 🕯️ Press F (to pay respects)

**Press F** is a decentralized meme protocol that turns viral tweets into tradable tokens — and finally gives credit where it's due.

At its core, Press F is a system that lets anyone instantly deploy a memecoin tied to a specific tweet. The original tweet author can later prove authorship and **claim a share of the token's transaction fees** — a fairer, more respectful memecoin model.

## 🧩 What's in the system?

- **Chrome Extension**:  
    Lets users interact with tweets directly. Hover over any post on Twitter, press `F`, and automatically reply with `@payrespectsbot`.

- **Tag Bot** (`@payrespectsbot`):  
    Listens for these tags. When triggered, it:

    1. Deploys a new memecoin tied to the tweet
    2. Replies with the token's contract address

- **Token Creation & Registry**:  
    Each token is uniquely tied to a tweet. This creates a canonical "official coin" for that post.

- **ZK Poster Verification**:  
    The original tweet author can use **zero-knowledge proof** to demonstrate they control the account that posted the tweet — and claim a portion of the token's transaction fees.  
No centralized verification is required — just on-chain proof of authorship.

## 💡 Why "Pay Respects"?

In today's memecoin world, viral content often gets used and monetized by others, with the original creators left out.

Press F flips the dynamic:

- Anyone can spin up a coin with one keypress
- The memecoin may still spread organically
- **The poster gets rewarded** if it pops off

It's a remix of meme culture, cryptoeconomics, and attribution — powered by trustless tech.

## 🛠️ How It Works

1. User hovers over a tweet and presses `F` (via extension)
2. The extension replies with `@payrespectsbot`
3. The bot:
    - Deploys a memecoin tied to that tweet
    - Replies with `"contract deployed, ca: [address]"`
4. The original poster can:
    - Visit the redemption platform
    - Prove ownership using ZK verification
    - Claim a share of the transaction fees

## 📝 Contract Deployments

### Optimism Sepolia

- PumpFun Contract: [0xD570bF4598D3ccF214E288dd92222b8Bd3134984](https://optimism-sepolia.blockscout.com/address/0xD570bF4598D3ccF214E288dd92222b8Bd3134984)
- TokenFactory: [0xe7D3930eabD922202B7f9C11084AB4D91444Ba2A](https://optimism-sepolia.blockscout.com/address/0xe7D3930eabD922202B7f9C11084AB4D91444Ba2A)
- Prover Contract: [0x1e66b8a94d368e269c2dc69f929760ad1da70cc9](https://optimism-sepolia.blockscout.com/address/0x1e66b8a94d368e269c2dc69f929760ad1da70cc9)
- Verifier Contract: [0x50947fa2cdeb0f9c97f33318c64d7e7ee10b7d96](https://optimism-sepolia.blockscout.com/address/0x50947fa2cdeb0f9c97f33318c64d7e7ee10b7d96)

### Flow Testnet

- PumpFun Contract: [0x8b3340EFcB90e586Edf0790538c7f3730560D4b3](https://evm-testnet.flowscan.io/address/0x8b3340EFcB90e586Edf0790538c7f3730560D4b3)
- TokenFactory: [0xD570bF4598D3ccF214E288dd92222b8Bd3134984](https://evm-testnet.flowscan.io/address/0xD570bF4598D3ccF214E288dd92222b8Bd3134984)
- Prover Contract: Not supported by vlayer
- Verifier Contract: Not supported by vlayer. Mock verifier is deployed at [0x61aE9259C8dc1Ad08C7786E6158733c42c250e77](https://evm-testnet.flowscan.io/address/0x61aE9259C8dc1Ad08C7786E6158733c42c250e77)
