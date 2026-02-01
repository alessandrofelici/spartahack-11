export interface StageConfig {
  id: number;
  title: string;
  description: string;
  carPosition: [number, number, number];
  botPosition: [number, number, number];
  botVisible: boolean;
  tollPrice: number;
  hasProtection: boolean;
  carAtToll: boolean;
  botAtToll: boolean;
  showScanner: boolean;
  question?: {
    text: string;
    options: [string, string];
  };
}

export const STAGES: StageConfig[] = [
  {
    id: 1,
    title: "The Transaction",
    description: "Meet Alice. She wants to swap ETH for a token on a decentralized exchange. Her transaction is waiting in the mempool - a public waiting room where all pending transactions sit.",
    carPosition: [-6, 0.5, 0],
    botPosition: [0, 6, -2],
    botVisible: false,
    tollPrice: 100,
    hasProtection: false,
    carAtToll: false,
    botAtToll: false,
    showScanner: false,
  },
  {
    id: 2,
    title: "The Watcher",
    description: "This is a MEV bot. It constantly monitors the mempool, searching for profitable opportunities. Think of it as a predator watching for prey.",
    carPosition: [-6, 0.5, 0],
    botPosition: [0, 4, -2],
    botVisible: true,
    tollPrice: 100,
    hasProtection: false,
    carAtToll: false,
    botAtToll: false,
    showScanner: false,
  },
  {
    id: 3,
    title: "Target Acquired",
    description: "The bot detects Alice's pending transaction. It sees the token she wants to buy and calculates how to exploit this information.",
    carPosition: [-6, 0.5, 0],
    botPosition: [0, 4, -2],
    botVisible: true,
    tollPrice: 100,
    hasProtection: false,
    carAtToll: false,
    botAtToll: false,
    showScanner: true,
    question: {
      text: "Should Alice proceed without protection?",
      options: ["Yes, trust the system", "No, this seems risky"],
    },
  },
  {
    id: 4,
    title: "The Front-Run",
    description: "By paying higher gas fees, the bot jumps ahead of Alice in the transaction queue. It's like cutting in line at the toll booth.",
    carPosition: [-6, 0.5, 0],
    botPosition: [-4, 0.5, 0],
    botVisible: true,
    tollPrice: 100,
    hasProtection: false,
    carAtToll: false,
    botAtToll: false,
    showScanner: false,
  },
  {
    id: 5,
    title: "The Sandwich",
    description: "The bot buys the token first, driving up the price. Now Alice pays $150 instead of $100. The bot then sells for profit - she's been sandwiched.",
    carPosition: [2, 0.5, 0],
    botPosition: [6, 0.5, 0],
    botVisible: true,
    tollPrice: 150,
    hasProtection: false,
    carAtToll: true,
    botAtToll: true,
    showScanner: false,
  },
  {
    id: 6,
    title: "A Different Path",
    description: "Let's rewind and see how GapWrap changes this scenario...",
    carPosition: [-6, 0.5, 0],
    botPosition: [0, 6, -2],
    botVisible: false,
    tollPrice: 100,
    hasProtection: false,
    carAtToll: false,
    botAtToll: false,
    showScanner: false,
  },
  {
    id: 7,
    title: "Same Threat",
    description: "Same bot, same hungry eyes watching the mempool. But this time, Alice is prepared.",
    carPosition: [-6, 0.5, 0],
    botPosition: [0, 4, -2],
    botVisible: true,
    tollPrice: 100,
    hasProtection: false,
    carAtToll: false,
    botAtToll: false,
    showScanner: false,
  },
  {
    id: 8,
    title: "GapWrap Shield",
    description: "Alice uses GapWrap protection. The optimal slippage tolerance is calculated, minimizing the attack surface for the bot.",
    carPosition: [-6, 0.5, 0],
    botPosition: [0, 4, -2],
    botVisible: true,
    tollPrice: 100,
    hasProtection: true,
    carAtToll: false,
    botAtToll: false,
    showScanner: true,
  },
  {
    id: 9,
    title: "Minimized Impact",
    description: "The bot still front-runs, but the gap between transactions is much smaller. Less room for price manipulation.",
    carPosition: [-3, 0.5, 0],
    botPosition: [-4.5, 0.5, 0],
    botVisible: true,
    tollPrice: 100,
    hasProtection: true,
    carAtToll: false,
    botAtToll: false,
    showScanner: false,
  },
  {
    id: 10,
    title: "Protected Outcome",
    description: "Result: Alice pays $105 instead of $150. GapWrap reduced the attack impact by optimizing her slippage tolerance. Scroll down to learn more.",
    carPosition: [2, 0.5, 0],
    botPosition: [6, 0.5, 0],
    botVisible: true,
    tollPrice: 105,
    hasProtection: true,
    carAtToll: true,
    botAtToll: true,
    showScanner: false,
    question: {
      text: "Would you use GapWrap for your trades?",
      options: ["Yes, protect my transactions", "I'll take my chances"],
    },
  },
];
