import TransactionHistory from "@/components/TransactionHistory";
import { useWallet } from "@/hooks/use-wallet";
import { Button } from "@/components/ui/button";

const History = () => {
  const { walletAddress, connectWallet } = useWallet();

  return (
    <main className="container mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-3xl font-bold mb-6">Transaction History</h1>
      
      {!walletAddress ? (
        <div className="bg-white rounded-xl shadow-md p-8 mb-12 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-neutral-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          
          <h2 className="text-xl font-semibold mb-2">Connect Your Wallet</h2>
          <p className="text-neutral-600 mb-6">
            Please connect your wallet to view your transaction history.
          </p>
          
          <Button onClick={connectWallet} className="px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition-colors">
            Connect Wallet
          </Button>
        </div>
      ) : (
        <>
          <p className="text-lg text-neutral-600 mb-8">
            View the status and details of all your cross-chain remittance transactions.
          </p>
          <TransactionHistory />
        </>
      )}
    </main>
  );
};

export default History;
