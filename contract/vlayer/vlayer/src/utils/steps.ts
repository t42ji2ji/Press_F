import React from "react";
import {
  ConnectWalletStep,
  InstallExtension,
  MintStep,
  ProveStep,
  SuccessStep,
  TokenList,
  TradeToken,
  WelcomeScreen,
} from "../components";

export type Step = {
  kind: STEP_KIND;
  path: string;
  backUrl?: string;
  component: React.ComponentType;
  title: string;
  description: string;
  headerIcon?: string;
  index: number;
  gameTitle?: string;
  xpReward?: number;
};

export enum STEP_KIND {
  TOKEN_LIST,
  WELCOME,
  CONNECT_WALLET,
  START_PROVING,
  MINT,
  INSTALL_EXTENSION,
  SUCCESS,
  TRADE,
}
export const steps: Step[] = [
  {
    path: "",
    kind: STEP_KIND.TOKEN_LIST,
    component: TokenList,
    title: "🎮 Available Tokens 🚀",
    gameTitle: "SELECT YOUR TOKEN",
    description:
      "💎 Browse available tokens and start claiming! Each token represents a monetized X post. Pick one to start earning or create your own! 🌟💰",
    headerIcon: "/nft-illustration.svg",
    index: 0,
    xpReward: 0,
  },
  {
    path: "welcome",
    kind: STEP_KIND.WELCOME,
    component: WelcomeScreen,
    title: "🎮 Press F to Tokenize Posts 🕯️",
    gameTitle: "WELCOME TO POST ECONOMY",
    description:
      "💎 Turn your X posts into tradeable tokens! Original creators earn from every trade - no cap! Prove ownership, mint tokens, and let your content work for you. Ready to monetize your posts, anon? 🚀💰",
    headerIcon: "/nft-illustration.svg",
    index: 1,
    xpReward: 0,
  },
  {
    path: "connect-wallet",
    kind: STEP_KIND.CONNECT_WALLET,
    backUrl: "",
    component: ConnectWalletStep,
    title: "🔌 WALLET CONNECTION INITIATED",
    gameTitle: "LEVEL 1: CONNECT YOUR VAULT",
    description:
      "Link your wallet to start earning from your X posts! This is where your creator royalties will flow. Time to plug into the creator economy! 💰✨",
    index: 2,
    xpReward: 100,
  },
  {
    path: "start-proving",
    kind: STEP_KIND.START_PROVING,
    backUrl: "/connect-wallet",
    component: ProveStep,
    title: "🔥 POST OWNERSHIP VERIFICATION",
    gameTitle: "LEVEL 2: PROVE YOUR CREATION",
    description:
      "Time to prove you're the real creator! Use vlayer extension to verify your X account ownership. Only real creators can tokenize their posts - no bots allowed! ⚡🎯",
    index: 3,
    xpReward: 250,
  },
  {
    path: "install-extension",
    kind: STEP_KIND.INSTALL_EXTENSION,
    component: InstallExtension,
    backUrl: "/connect-wallet",
    title: "🛠️ CREATOR TOOLS REQUIRED",
    gameTitle: "DOWNLOAD CREATOR DLC",
    description: `Need the creator toolkit? Install vlayer extension to unlock post tokenization powers. No extension = no monetization, fr! 🔧🚀`,
    index: 3,
    xpReward: 150,
  },
  {
    path: "mint",
    kind: STEP_KIND.MINT,
    backUrl: "/start-proving",
    component: MintStep,
    title: "💎 POST TOKEN FORGE",
    gameTitle: "LEVEL 3: MINT YOUR POST TOKEN",
    description: `Your post is verified and ready to become a tradeable token! Mint it now and start earning royalties from every future trade. Time to make bank from your content! 🌟💸`,
    index: 4,
    xpReward: 500,
  },
  {
    path: "trade",
    kind: STEP_KIND.TRADE,
    backUrl: "",
    component: TradeToken,
    title: "💰 TOKEN TRADING HUB",
    description:
      "Buy tokens from other creators and become part of their success!",
    index: 6,
    xpReward: 200,
  },
  {
    path: "success",
    kind: STEP_KIND.SUCCESS,
    component: SuccessStep,
    title: "🏆 CREATOR ECONOMY UNLOCKED",
    gameTitle: "VICTORY ROYALE!",
    description: "GG EZ! You've successfully minted your post token! 🎉",
    headerIcon: "/success-illustration.svg",
    index: 5,
    xpReward: 1000,
  },
];
