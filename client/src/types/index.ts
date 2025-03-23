export interface CurrencyData {
  id: number;
  code: string;
  name: string;
  symbol: string;
  parachainName: string;
  parachainId: string;
}

export interface ExchangeRateData {
  id: number;
  sourceCurrencyId: number;
  targetCurrencyId: number;
  rate: number;
  updatedAt: string;
}

export interface TransactionData {
  id: number;
  userId: number | null;
  sourceAmount: number;
  sourceCurrencyId: number;
  targetAmount: number;
  targetCurrencyId: number;
  recipientAddress: string;
  fee: number;
  status: "pending" | "completed" | "failed";
  txHash?: string;
  createdAt: string;
}

export interface LiquidityPoolData {
  id: number;
  sourceCurrencyId: number;
  targetCurrencyId: number;
  totalLiquidity: number;
  dailyVolume: number;
  apy: number;
  sourceCurrency?: CurrencyData;
  targetCurrency?: CurrencyData;
}

export interface LiquidityPositionData {
  id: number;
  userId: number;
  poolId: number;
  amount: number;
  createdAt: string;
  pool?: LiquidityPoolData;
}

export interface CalculationResult {
  sourceAmount: number;
  sourceCurrency: CurrencyData;
  targetCurrency: CurrencyData;
  exchangeRate: number;
  fee: number;
  convertedAmount: number;
}

export interface WalletContextType {
  walletAddress: string | null;
  connectWallet: () => void;
  disconnectWallet: () => void;
  walletBalance: string | null;
  isConnecting: boolean;
  selectedAccount: any | null;
  accounts: any[];
}
