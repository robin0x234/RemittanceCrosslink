
import { useState, useEffect, useCallback, useRef } from 'react';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { web3Enable, web3AccountsSubscribe, web3FromAddress } from '@polkadot/extension-dapp';
import { formatBalance } from '@polkadot/util';
import { useToast } from './use-toast';
import { NETWORK_INFO } from '@/lib/constants';

export const usePolkadot = () => {
  const [api, setApi] = useState<ApiPromise | null>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [networkName, setNetworkName] = useState<string>('');
  const [networkInfo, setNetworkInfo] = useState<any>(null);
  const reconnectAttempts = useRef(0);
  const { toast } = useToast();
  
  // Configure network properties
  const setupNetworkProperties = useCallback(async (api: ApiPromise) => {
    try {
      // Get chain information
      const chainProperties = await api.rpc.system.properties();
      const tokenSymbol = chainProperties.tokenSymbol.unwrapOr(['UNIT'])[0].toString();
      
      // Handle both number and u32 types (which have toNumber method)
      let decimals = 12; // Default
      const rawDecimals = chainProperties.tokenDecimals.unwrapOr([decimals])[0];
      if (typeof rawDecimals === 'number') {
        decimals = rawDecimals;
      } else if (typeof rawDecimals === 'object' && 'toNumber' in rawDecimals) {
        // Handle u32 type which has toNumber method
        decimals = rawDecimals.toNumber();
      }
      
      // Set up the formatting for the balance display
      formatBalance.setDefaults({
        decimals,
        unit: tokenSymbol,
      });
      
      // Get network name
      const chain = await api.rpc.system.chain();
      setNetworkName(chain.toString());
      
      // Store network information
      setNetworkInfo({
        symbol: tokenSymbol,
        decimals,
        name: chain.toString()
      });
      
      return true;
    } catch (error) {
      console.error('Error setting up network properties:', error);
      return false;
    }
  }, []);
  
  // Connect to the local testnet (or fallback to Westend testnet if local is not available)
  const connect = useCallback(async () => {
    try {
      setIsConnecting(true);
      
      // Try to connect to local testnet first
      let wsProvider = new WsProvider('ws://127.0.0.1:9944');
      let connected = false;
      
      try {
        // Try to connect to local node with a timeout
        const localApi = await Promise.race([
          ApiPromise.create({ provider: wsProvider }),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Connection timeout')), 3000)
          )
        ]) as ApiPromise;
        
        // Setup network properties
        const propertiesSetup = await setupNetworkProperties(localApi);
        
        if (propertiesSetup) {
          setApi(localApi);
          connected = true;
          toast({
            title: "Connected to local testnet",
            description: `Successfully connected to ${networkName || 'the local Polkadot testnet'}.`
          });
        }
      } catch (error) {
        console.log('Could not connect to local testnet, using Westend testnet instead:', error);
        
        // Fallback to Westend testnet
        wsProvider = new WsProvider(NETWORK_INFO.WESTEND_RPC_URL);
        const api = await ApiPromise.create({ provider: wsProvider });
        
        // Setup network properties
        const propertiesSetup = await setupNetworkProperties(api);
        
        if (propertiesSetup) {
          setApi(api);
          connected = true;
          toast({
            title: "Connected to Westend testnet",
            description: `Fallback connection to ${networkName || 'Westend testnet'} successful.`
          });
        }
      }
      
      if (connected) {
        // Enable web3 extensions
        const extensions = await web3Enable('PolkaRemit');
        
        if (extensions.length === 0) {
          toast({
            title: "No wallet extension found",
            description: "Please install the Polkadot.js extension to use this application.",
            variant: "destructive"
          });
        } else {
          // Subscribe to accounts
          const unsubscribe = await web3AccountsSubscribe((injectedAccounts) => {
            setAccounts(injectedAccounts);
          });
          
          setIsReady(true);
        }
      }
      
      // Reset reconnect attempts on successful connection
      reconnectAttempts.current = 0;
    } catch (error) {
      console.error('Failed to connect to Polkadot network:', error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect to Polkadot network. Attempting to reconnect...",
        variant: "destructive"
      });
      
      // Implement auto-reconnect logic with exponential backoff
      reconnectAttempts.current += 1;
      const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000); // Max 30 seconds
      
      setTimeout(() => {
        if (reconnectAttempts.current < 5) {
          connect();
        } else {
          toast({
            title: "Connection Failed",
            description: "Maximum reconnection attempts reached. Please try again later.",
            variant: "destructive"
          });
        }
      }, delay);
    } finally {
      setIsConnecting(false);
    }
  }, [toast, setupNetworkProperties, networkName]);
  
  // Listen for network connection changes
  useEffect(() => {
    if (api) {
      // Set up event listeners
      const setupListeners = () => {
        // Connection established
        api.on('connected', () => {
          console.log('API has been connected to the node');
          setIsReady(true);
        });
        
        // Connection lost
        api.on('disconnected', () => {
          console.log('API has been disconnected from the node');
          setIsReady(false);
          
          // Attempt to reconnect if disconnected
          setTimeout(() => {
            if (reconnectAttempts.current < 5) {
              connect();
            }
          }, 2000);
        });
        
        // Connection error
        api.on('error', (error) => {
          console.error('API connection error:', error);
        });
      };
      
      // Setup listeners
      setupListeners();
      
      // Cleanup function
      return () => {
        // ApiPromise doesn't have a way to remove specific listeners,
        // but it will clean up all listeners when disconnected
        if (api && api.isConnected) {
          console.log('Cleaning up API connection listeners');
          // No specific unsubscribe needed, the api.disconnect() in main useEffect will handle it
        }
      };
    }
  }, [api, connect]);
  
  // Initialize connection on component mount
  useEffect(() => {
    connect();
    
    // Cleanup function
    return () => {
      if (api) {
        api.disconnect();
      }
    };
  }, [connect]);
  
  // Transfer tokens between accounts
  const transferTokens = async (
    senderAddress: string,
    recipientAddress: string,
    amount: number
  ) => {
    if (!api || !isReady) {
      toast({
        title: "Network not ready",
        description: "Polkadot network connection is not ready.",
        variant: "destructive"
      });
      return { success: false, hash: null };
    }
    
    try {
      // Format the amount according to the chain's decimals
      const formattedAmount = amount * Math.pow(10, networkInfo?.decimals || 12);
      
      // Get the injector for the sender address
      const injector = await web3FromAddress(senderAddress);
      
      // Create a transfer transaction
      const transfer = api.tx.balances.transfer(recipientAddress, formattedAmount);
      
      // Show pending toast
      toast({
        title: "Sending Transaction",
        description: "Please confirm the transaction in your wallet extension."
      });
      
      // Sign and send the transaction
      const txResult = await new Promise<any>((resolve, reject) => {
        transfer.signAndSend(
          senderAddress,
          { signer: injector.signer },
          ({ status, events, dispatchError }) => {
            // Transaction has been included in a block
            if (status.isInBlock) {
              console.log(`Transaction included in blockHash ${status.asInBlock.toHex()}`);
            }
            
            // Transaction has been finalized
            if (status.isFinalized) {
              console.log(`Transaction finalized in blockHash ${status.asFinalized.toHex()}`);
              
              // Check if there was an error
              if (dispatchError) {
                let errorMessage;
                
                if (dispatchError.isModule) {
                  const decoded = api.registry.findMetaError(dispatchError.asModule);
                  errorMessage = `${decoded.section}.${decoded.method}: ${decoded.docs.join(' ')}`;
                } else {
                  errorMessage = dispatchError.toString();
                }
                
                reject(new Error(`Transaction failed: ${errorMessage}`));
              } else {
                // Success, return the transaction hash
                resolve({
                  success: true,
                  hash: status.asFinalized.toHex(),
                  blockHash: status.asFinalized.toHex()
                });
              }
            }
          }
        ).catch(error => {
          reject(error);
        });
      });
      
      // Show success message
      toast({
        title: "Transaction Sent",
        description: `Transaction confirmed in block: ${txResult.blockHash}`
      });
      
      return txResult;
    } catch (error: any) {
      console.error('Transfer failed:', error);
      toast({
        title: "Transfer Failed",
        description: error.message || "Transaction could not be completed. Please try again.",
        variant: "destructive"
      });
      return { success: false, hash: null, error: error.message };
    }
  };
  
  // Get account balance
  const getBalance = async (address: string) => {
    if (!api || !isReady) return null;
    
    try {
      const accountInfo = await api.query.system.account(address);
      
      // Handle type safety with proper type assertion
      if (accountInfo && typeof accountInfo === 'object') {
        // Handle different API responses based on chain
        const accountInfoObj = accountInfo as any; // Type assertion
        
        if ('data' in accountInfoObj && accountInfoObj.data && 'free' in accountInfoObj.data) {
          // Format balance according to network properties
          return formatBalance(accountInfoObj.data.free, { withUnit: networkInfo?.symbol || true });
        } else if ('free' in accountInfoObj) {
          // Alternative structure used in some chains
          return formatBalance(accountInfoObj.free, { withUnit: networkInfo?.symbol || true });
        }
      }
      
      // Fallback for other formats
      return formatBalance(0, { withUnit: networkInfo?.symbol || true });
    } catch (error) {
      console.error('Failed to get balance:', error);
      return null;
    }
  };
  
  // XCM transfer (cross-chain)
  const xcmTransfer = async (
    senderAddress: string, 
    paraId: number, 
    recipientAddress: string, 
    amount: number
  ) => {
    if (!api || !isReady) {
      toast({
        title: "Network not ready",
        description: "Polkadot network connection is not ready.",
        variant: "destructive"
      });
      return { success: false, hash: null };
    }
    
    try {
      // Format the amount according to the chain's decimals
      const formattedAmount = amount * Math.pow(10, networkInfo?.decimals || 12);
      
      // Get the injector for the sender address
      const injector = await web3FromAddress(senderAddress);
      
      // Show pending toast
      toast({
        title: "Preparing XCM Transfer",
        description: "Initiating cross-chain transfer. Please confirm in your wallet."
      });
      
      // Check if the API supports XCM transfers
      if (!api.tx.xcmPallet || !api.tx.xcmPallet.reserveTransferAssets) {
        throw new Error("This network does not support XCM transfers. Please use Polkadot mainnet or a compatible parachain.");
      }
      
      // Create an XCM transfer transaction to a parachain
      const transfer = api.tx.xcmPallet.reserveTransferAssets(
        { X1: { ParaChain: paraId } }, // destination
        { X1: { AccountId32: { id: recipientAddress, network: 'Any' } } }, // beneficiary
        { X1: { PalletInstance: 1 } }, // assets location
        formattedAmount
      );
      
      // Sign and send the transaction with status tracking
      const txResult = await new Promise<any>((resolve, reject) => {
        transfer.signAndSend(
          senderAddress,
          { signer: injector.signer },
          ({ status, events, dispatchError }) => {
            // Transaction has been included in a block
            if (status.isInBlock) {
              toast({
                title: "XCM Transfer In Progress",
                description: `Transaction included in block. Waiting for finalization...`
              });
            }
            
            // Transaction has been finalized
            if (status.isFinalized) {
              // Check if there was an error
              if (dispatchError) {
                let errorMessage;
                
                if (dispatchError.isModule) {
                  const decoded = api.registry.findMetaError(dispatchError.asModule);
                  errorMessage = `${decoded.section}.${decoded.method}: ${decoded.docs.join(' ')}`;
                } else {
                  errorMessage = dispatchError.toString();
                }
                
                reject(new Error(`XCM transaction failed: ${errorMessage}`));
              } else {
                // Check for relevant events
                events.forEach(({ event }) => {
                  if (api.events.xcmPallet && event.section === 'xcmPallet') {
                    console.log(`XCM event: ${event.section}.${event.method}`);
                  }
                });
                
                // Success, return the transaction hash
                resolve({
                  success: true,
                  hash: status.asFinalized.toHex(),
                  blockHash: status.asFinalized.toHex()
                });
              }
            }
          }
        ).catch(error => {
          reject(error);
        });
      });
      
      // Show success message
      toast({
        title: "XCM Transfer Complete",
        description: `Cross-chain transaction confirmed in block: ${txResult.blockHash.substring(0, 10)}...`,
      });
      
      return txResult;
    } catch (error: any) {
      console.error('XCM transfer failed:', error);
      toast({
        title: "XCM Transfer Failed",
        description: error.message || "Cross-chain transaction could not be completed. Please try again.",
        variant: "destructive"
      });
      return { success: false, hash: null, error: error.message };
    }
  };
  
  return { 
    api, 
    accounts, 
    isConnecting, 
    isReady,
    networkName,
    networkInfo,
    connect, 
    transferTokens, 
    getBalance,
    xcmTransfer
  };
};
