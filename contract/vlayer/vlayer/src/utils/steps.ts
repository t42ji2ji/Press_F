import {
  ConnectWalletStep,
  InstallExtension,
  MintStep,
  ProveStep,
  SuccessStep,
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
  WELCOME,
  CONNECT_WALLET,
  START_PROVING,
  MINT,
  INSTALL_EXTENSION,
  SUCCESS,
}
export const steps: Step[] = [
  {
    path: "",
    kind: STEP_KIND.WELCOME,
    component: WelcomeScreen,
    title: "🎮 Press F to Tokenize Posts 🕯️",
    gameTitle: "WELCOME TO POST ECONOMY",
    description:
      "💎 Turn your X posts into tradeable tokens! Original creators earn from every trade - no cap! Prove ownership, mint tokens, and let your content work for you. Ready to monetize your posts, anon? 🚀💰",
    headerIcon: "/nft-illustration.svg",
    index: 0,
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
    index: 1,
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
    index: 2,
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
    index: 2,
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
    index: 3,
    xpReward: 500,
  },
  {
    path: "success",
    kind: STEP_KIND.SUCCESS,
    component: SuccessStep,
    title: "🏆 CREATOR ECONOMY UNLOCKED",
    gameTitle: "VICTORY ROYALE!",
    description:
      "GG EZ! Your X post is now a tradeable token and you'll earn from every trade! Welcome to the future of content monetization! 🎉👑💎",
    headerIcon: "/success-illustration.svg",
    index: 4,
    xpReward: 1000,
  },
];
