# Press F Twitter Bot

This is the backend service for the Press F Twitter bot. The bot listens for mentions and replies with information about the original tweet being replied to.

## Setup

1. Create a `.env` file in the root directory with the following variables:

```env
TWITTER_API_KEY=your_api_key_here
TWITTER_API_SECRET=your_api_secret_here
TWITTER_ACCESS_TOKEN=your_access_token_here
TWITTER_ACCESS_SECRET=your_access_secret_here
TWITTER_BEARER_TOKEN=your_bearer_token_here
```

2. Install dependencies:

```bash
pnpm install
```

3. Build the project:

```bash
pnpm build
```

4. Start the bot:

```bash
pnpm start
```

For development with hot reload:

```bash
pnpm dev
```

## How it works

1. The bot listens for mentions using Twitter's streaming API
2. When mentioned in a reply, it:
   - Identifies the original tweet being replied to
   - Gets the original tweet's author
   - Replies with the original tweet's link and author information

## Development

- Source code is in `src/bot.ts`
- Built files will be in `dist/`
- Use `pnpm dev` for development with hot reload
