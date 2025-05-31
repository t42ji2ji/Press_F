# 🕯️ Press F (to pay respects)

**Press F** is a decentralized protocol for turning viral tweets into on-chain tokens — a new way to capture, trade, and reward internet attention, and finally gives credit where it's due.

With one keystroke (you guessed it, press F), users can instantly deploy a token tied to any tweet. The original author can later prove authorship using ZK verification and claim a share of the token’s fees — ensuring creators benefit if and when their content goes viral.

## 🧩 What's in the system?

- **Chrome Extension**:  
    Hover over any tweet. Press `F`. Automatically reply with `@payrespectsbot` which triggers token creation.

- **Tag Bot** (`@payrespectsbot`):  
    Listens for tags. When triggered, it:
    1. Deploys a unique token tied to the tweet
    2. Replies with the token contract address

- **Token Registry**:  
    Each coin is canonically linked to one tweet. This creates a "tradable attention asset" for that post.

- **ZK Poster Verification**:  
    The original poster can cryptographically prove authorship via ZK and claim a cut of transaction fees. There is no centralized gatekeeping.

## 💡 Why "Pay Respects"?

In today's memecoin world, iral content drives value in crypto — but creators rarely benefit.

Press F flips the dynamic:

- Memecoins emerge organically from viral moments
- Anyone can mint a coin for a tweet
- If it pops off, the creator shares in the upside

This isn’t just meme culture. It’s attribution economics, powered by trustless tech.

## 🛠️ How It Works

1. User hovers over a tweet and presses `F` (via extension)
2. The extension replies with `@payrespectsbot`
3. The bot:
    - Deploys a memecoin tied to that tweet
    - Replies with `"token live; ca: [address]"`
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
