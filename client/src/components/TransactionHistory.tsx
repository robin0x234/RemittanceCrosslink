import { useQuery } from "@tanstack/react-query";
import { useWallet } from "@/hooks/use-wallet";
import { CurrencyData } from "@/types";

interface Transaction {
  id: number;
  sourceAmount: number;
  sourceCurrencyId: number;
  targetAmount: number;
  targetCurrencyId: number;
  recipientAddress: string;
  status: string;
  createdAt: string;
  txHash?: string;
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "completed":
      return (
        <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center mr-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-success" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
      );
    case "pending":
      return (
        <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center mr-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-warning" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
        </div>
      );
    case "failed":
      return (
        <div className="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center mr-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-error" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
      );
    default:
      return (
        <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center mr-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-neutral-500" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
          </svg>
        </div>
      );
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "text-success";
    case "pending":
      return "text-warning";
    case "failed":
      return "text-error";
    default:
      return "text-neutral-500";
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString();
};

const TransactionHistory = () => {
  const { walletAddress } = useWallet();

  // Fetch transactions
  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['/api/transactions'],
  });

  // Fetch currencies
  const { data: currencies = [] } = useQuery({
    queryKey: ['/api/currencies'],
  });

  const getCurrencyById = (id: number): CurrencyData | undefined => {
    return currencies.find((currency: CurrencyData) => currency.id === id);
  };

  return (
    <section className="bg-white rounded-xl shadow-md mb-12 overflow-hidden">
      <div className="p-6 md:p-8">
        <h2 className="text-2xl font-bold text-neutral-900 mb-6">Transaction History</h2>
        
        {!walletAddress ? (
          <div className="mb-6 bg-neutral-50 rounded-lg p-4 text-center text-neutral-500">
            <p>Connect your wallet to view transaction history</p>
          </div>
        ) : isLoading ? (
          <div className="flex justify-center p-8">
            <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : transactions.length === 0 ? (
          <div className="mb-6 bg-neutral-50 rounded-lg p-4 text-center text-neutral-500">
            <p>No transactions found</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {transactions.map((tx: Transaction) => {
              const sourceCurrency = getCurrencyById(tx.sourceCurrencyId);
              const targetCurrency = getCurrencyById(tx.targetCurrencyId);
              
              return (
                <div key={tx.id} className="py-4 flex flex-col md:flex-row justify-between">
                  <div className="flex items-start">
                    {getStatusIcon(tx.status)}
                    <div>
                      <div className="font-medium text-neutral-900">
                        Sent to {tx.recipientAddress.substring(0, 6)}...
                        {tx.recipientAddress.substring(tx.recipientAddress.length - 4)}
                      </div>
                      <div className="text-sm text-neutral-500">{formatDate(tx.createdAt)}</div>
                    </div>
                  </div>
                  <div className="mt-3 md:mt-0 text-right">
                    <div className="font-mono font-medium text-neutral-900">
                      {sourceCurrency?.symbol || '$'}{tx.sourceAmount.toFixed(2)} → {targetCurrency?.symbol || '₱'}{tx.targetAmount.toFixed(2)}
                    </div>
                    <div className={`text-sm ${getStatusColor(tx.status)}`}>
                      {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default TransactionHistory;
