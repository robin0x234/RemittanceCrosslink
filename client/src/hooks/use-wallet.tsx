import React, { createContext, useContext, useState, ReactNode, useEffect, useRef } from "react";
import { WalletContextType } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { web3Enable, web3Accounts } from "@polkadot/extension-dapp";
import { keyring } from "@polkadot/ui-keyring";
import { cryptoWaitReady } from "@polkadot/util-crypto";
import { usePolkadot } from "./use-polkadot";

// Create context with default values
const WalletContext = createContext<WalletContextType>({
  walletAddress: null,
  connectWallet: () => {},
  disconnectWallet: () => {},
  walletBalance: null,
  isConnecting: false,
  selectedAccount: null,
  accounts: []
});

interface WalletProviderProps {
  children: ReactNode;
}

// Provider component
export const WalletProvider = ({ children }: WalletProviderProps) => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [polkadotAccounts, setPolkadotAccounts] = useState<any[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const keyringInitialized = useRef(false);
  const { toast } = useToast();
  const { getBalance } = usePolkadot();

  // Initialize keyring on component mount
  useEffect(() => {
    const initKeyring = async () => {
      if (keyringInitialized.current) return;

      try {
        await cryptoWaitReady();
        keyring.loadAll({ ss58Format: 42, type: 'sr25519' });
        keyringInitialized.current = true;
      } catch (err) {
        console.error("Error initializing keyring:", err);
      }
    };

    initKeyring();
  }, []);

  // Update balance when account changes
  useEffect(() => {
    const fetchBalance = async () => {
      if (walletAddress) {
        await updateBalance();
      }
    };

    fetchBalance();
  }, [walletAddress]);

  // Update balance function
  const updateBalance = async () => {
    if (!walletAddress) return;

    try {
      const balance = await getBalance(walletAddress);
      setWalletBalance(balance);
    } catch (error) {
      console.error("Error fetching balance:", error);
      setWalletBalance(null);
    }
  };

  // Connect to Polkadot.js extension
  const connectWallet = async () => {
    if (walletAddress) {
      return;
    }

    setIsConnecting(true);

    try {
      // Wait for keyring to be initialized
      if (!keyringInitialized.current) {
        await cryptoWaitReady();
        keyring.loadAll({ ss58Format: 42, type: 'sr25519' });
        keyringInitialized.current = true;
      }

      // Enable the extension
      const extensions = await web3Enable('PolkaRemit');

      if (extensions.length === 0) {
        toast({
          title: "No Extension Found",
          description: "Please install the Polkadot.js extension from polkadot.js.org/extension to connect your wallet. After installing, refresh this page.",
          variant: "destructive"
        });
        setIsConnecting(false);
        return;
      }

      // Get accounts from extension
      const accounts = await web3Accounts();

      if (accounts.length === 0) {
        toast({
          title: "No Accounts Found",
          description: "Please create an account in the Polkadot.js extension.",
          variant: "destructive"
        });
        setIsConnecting(false);
        return;
      }

      setPolkadotAccounts(accounts);

      // Use the first account by default
      const account = accounts[0];
      setSelectedAccount(account);
      setWalletAddress(account.address);

      toast({
        title: "Wallet Connected",
        description: `Connected to ${account.meta.name || 'Polkadot wallet'}`,
      });
    } catch (error) {
      console.error("Error connecting wallet:", error);
      toast({
        title: "Connection Error",
        description: "Failed to connect to Polkadot wallet. Please try again.",
        variant: "destructive"
      });

      // Fallback to mock address for development
      if (import.meta.env.DEV) {
        const randomAddress = "5" + Array(47)
          .fill(0)
          .map(() => "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789"[
            Math.floor(Math.random() * 58)
          ])
          .join("");

        setWalletAddress(randomAddress);
        setSelectedAccount({ address: randomAddress, meta: { name: 'Dev Wallet' }});

        toast({
          title: "Development Mode",
          description: "Connected to a simulated wallet for development.",
        });
      }
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setWalletAddress(null);
    setWalletBalance(null);
    setSelectedAccount(null);

    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected.",
    });
  };

  return (
    <WalletContext.Provider
      value={{ 
        walletAddress, 
        connectWallet, 
        disconnectWallet,
        walletBalance,
        isConnecting,
        selectedAccount,
        accounts: polkadotAccounts
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

// Custom hook to use the wallet context
export const useWallet = () => useContext(WalletContext);