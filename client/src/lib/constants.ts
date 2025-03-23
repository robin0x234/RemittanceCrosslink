// Parachain Information
export const PARACHAINS = {
  USD: { name: "Acala", id: "USDC Stablecoin" },
  EUR: { name: "Moonbeam", id: "EUR Stablecoin" },
  GBP: { name: "Astar", id: "GBP Stablecoin" },
  SGD: { name: "Parallel Finance", id: "SGD Stablecoin" },
  PHP: { name: "Equilibrium", id: "PHP Stablecoin" },
  MYR: { name: "Phala", id: "MYR Stablecoin" },
  THB: { name: "Centrifuge", id: "THB Stablecoin" },
  IDR: { name: "HydraDX", id: "IDR Stablecoin" },
};

// Transaction Status
export const TX_STATUS = {
  PENDING: "pending",
  COMPLETED: "completed",
  FAILED: "failed",
};

// Default Fee Percentage
export const DEFAULT_FEE_PERCENTAGE = 0.01; // 1%

// Source Currencies (Shown in dropdown)
export const SOURCE_CURRENCIES = ["USD", "EUR", "GBP", "SGD"];

// Target Currencies (Shown in dropdown)
export const TARGET_CURRENCIES = ["PHP", "MYR", "THB", "IDR"];

// Polkadot Network Information
export const NETWORK_INFO = {
  name: "Polkadot",
  token: "DOT",
  logo: "polkadot-logo.svg",
  blockExplorer: "https://polkadot.subscan.io/",
  xcmDocumentation: "https://wiki.polkadot.network/docs/learn-xcm",
  WESTEND_RPC_URL: "wss://westend-rpc.polkadot.io",
  RELAY_CHAIN_ID: 0,
  PARACHAIN_IDS: {
    USD: 2000,
    PHP: 2001
  }
};

// Benefits of using the platform
export const REMITTANCE_BENEFITS = [
  {
    title: "Lower Fees",
    description: "80% lower fees than traditional services",
    icon: "dollar-sign",
  },
  {
    title: "Faster Settlements",
    description: "Settlements in minutes, not days",
    icon: "clock",
  },
  {
    title: "Blockchain Security",
    description: "Secured by Polkadot's blockchain technology",
    icon: "shield",
  },
];

// Comparison with Traditional Services
export const SERVICE_COMPARISON = {
  fees: {
    ours: "0.5 - 1%",
    banks: "3 - 5%",
    moneyTransfer: "5 - 10%",
  },
  settlementTime: {
    ours: "Minutes",
    banks: "2-5 Days",
    moneyTransfer: "Hours to Days",
  },
  transparency: {
    ours: "Full blockchain transparency",
    banks: "Limited",
    moneyTransfer: "Partial",
  },
  earningPotential: {
    ours: "Yes (Liquidity Pools)",
    banks: "No",
    moneyTransfer: "No",
  },
};
