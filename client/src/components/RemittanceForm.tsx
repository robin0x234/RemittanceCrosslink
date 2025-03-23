import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@/hooks/use-wallet";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CurrencySelector } from "@/components/ui/currency-selector";
import TransactionFlow from "@/components/TransactionFlow";
import { CurrencyData } from "@/types";

// Form validation schema
const remittanceSchema = z.object({
  amount: z.string().min(1, "Amount is required"),
  sourceCurrency: z.string().min(1, "Source currency is required"),
  targetCurrency: z.string().min(1, "Target currency is required"),
  recipientAddress: z.string()
    .min(1, "Recipient address is required")
    .min(42, "Address must be at least 42 characters")
    .max(64, "Address cannot exceed 64 characters"),
});

type RemittanceFormValues = z.infer<typeof remittanceSchema>;

const RemittanceForm = () => {
  const { toast } = useToast();
  const { walletAddress, connectWallet, isConnecting } = useWallet(); // Added connectWallet and isConnecting
  const [sourceParachain, setSourceParachain] = useState("Acala (USDC Stablecoin)");
  const [destinationParachain, setDestinationParachain] = useState("Equilibrium (PHP Stablecoin)");
  const [exchangeRate, setExchangeRate] = useState("1 USD = 55.27 PHP");
  const [fee, setFee] = useState("$2.50");
  const [convertedAmount, setConvertedAmount] = useState<number>(0);
  const [xcmStatus, setXcmStatus] = useState("Ready to initiate");
  const [sourceCurrency, setSourceCurrency] = useState<CurrencyData | null>(null);
  const [targetCurrency, setTargetCurrency] = useState<CurrencyData | null>(null);
  const [showExtensionPrompt, setShowExtensionPrompt] = useState(false); // State for extension prompt

  // Get currencies from API
  const { data: currencies = [] } = useQuery({
    queryKey: ['/api/currencies'],
  });

  // Initialize form
  const form = useForm<RemittanceFormValues>({
    resolver: zodResolver(remittanceSchema),
    defaultValues: {
      amount: "",
      sourceCurrency: "USD",
      targetCurrency: "PHP",
      recipientAddress: "",
    },
  });

  // Calculate transaction values when form values change
  const watchAmount = form.watch("amount");
  const watchSourceCurrency = form.watch("sourceCurrency");
  const watchTargetCurrency = form.watch("targetCurrency");

  // Update parachains when currencies change
  useEffect(() => {
    if (currencies.length > 0) {
      const source = currencies.find((c: CurrencyData) => c.code === watchSourceCurrency);
      const target = currencies.find((c: CurrencyData) => c.code === watchTargetCurrency);

      if (source) {
        setSourceCurrency(source);
        setSourceParachain(`${source.parachainName} (${source.parachainId})`);
      }

      if (target) {
        setTargetCurrency(target);
        setDestinationParachain(`${target.parachainName} (${target.parachainId})`);
      }
    }
  }, [currencies, watchSourceCurrency, watchTargetCurrency]);

  // Calculate exchange rate and converted amount
  useEffect(() => {
    if (watchSourceCurrency && watchTargetCurrency) {
      // Fetch exchange rate from API
      fetchExchangeRate();
    }
  }, [watchSourceCurrency, watchTargetCurrency]);

  const fetchExchangeRate = async () => {
    try {
      const response = await fetch(`/api/exchange-rates/${watchSourceCurrency}/${watchTargetCurrency}`);
      if (response.ok) {
        const data = await response.json();
        setExchangeRate(`1 ${watchSourceCurrency} = ${data.rate.toFixed(2)} ${watchTargetCurrency}`);

        // Calculate converted amount if amount is provided
        if (watchAmount) {
          calculateConvertedAmount(parseFloat(watchAmount), data.rate);
        }
      }
    } catch (error) {
      console.error("Error fetching exchange rate:", error);
    }
  };

  const calculateConvertedAmount = (amount: number, rate: number) => {
    const feeAmount = amount * 0.01; // 1% fee
    setFee(`$${feeAmount.toFixed(2)}`);
    const amountAfterFee = amount - feeAmount;
    const converted = amountAfterFee * rate;
    setConvertedAmount(converted);
  };

  // Handle amount change
  useEffect(() => {
    if (watchAmount && !isNaN(parseFloat(watchAmount))) {
      fetchExchangeRate();
    } else {
      setConvertedAmount(0);
    }
  }, [watchAmount]);

  // Create mutation for submitting transaction
  const sendMoneyMutation = useMutation({
    mutationFn: async (data: RemittanceFormValues) => {
      const sourceCurrency = currencies.find((c: CurrencyData) => c.code === data.sourceCurrency);
      const targetCurrency = currencies.find((c: CurrencyData) => c.code === data.targetCurrency);

      if (!sourceCurrency || !targetCurrency) {
        throw new Error("Currency not found");
      }

      const sourceAmount = parseFloat(data.amount);
      const fee = sourceAmount * 0.01; // 1% fee

      return apiRequest("POST", "/api/transactions", {
        userId: walletAddress ? 1 : null, // In a real app, you'd use the actual user ID
        sourceAmount,
        sourceCurrencyId: sourceCurrency.id,
        targetAmount: convertedAmount,
        targetCurrencyId: targetCurrency.id,
        recipientAddress: data.recipientAddress,
        fee,
        status: "pending"
      });
    },
    onSuccess: () => {
      toast({
        title: "Transaction initiated",
        description: "Your cross-chain transfer has been initiated successfully.",
      });
      setXcmStatus("Processing");

      // Simulate transaction completion
      setTimeout(() => {
        setXcmStatus("Complete");
        queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      }, 3000);
    },
    onError: (error) => {
      toast({
        title: "Transaction failed",
        description: error.message || "An error occurred while processing your transaction.",
        variant: "destructive",
      });
    },
  });

  // Form submission handler
  const onSubmit = (data: RemittanceFormValues) => {
    if (!walletAddress) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to send money.",
        variant: "destructive",
      });
      return;
    }
    if (!window.polkadotjs) {
      setShowExtensionPrompt(true);
      return;
    }
    sendMoneyMutation.mutate(data);
  };

  const WalletPrompt = () => {
    return (
      showExtensionPrompt && (
        <div className="mt-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Polkadot.js Extension Required</strong>
          <span className="block sm:inline">
            This application requires the Polkadot.js extension to be installed in your browser. Please download and install it from{' '}
            <a href="https://polkadot.js.org/extension/" target="_blank" rel="noopener noreferrer" className="underline text-blue-800 hover:text-blue-600">
              here
            </a>
            .
          </span>
          <span className="absolute top-0 bottom-0 right-0 px-4 py-3">
            <svg className="fill-current h-6 w-6 text-yellow-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" onClick={() => setShowExtensionPrompt(false)}>
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </span>
        </div>
      )
    );
  };

  return (
    <section className="bg-white dark:bg-gray-900 rounded-xl shadow-lg mb-12 overflow-hidden border border-gray-100 dark:border-gray-800">
      <div className="flex flex-col md:flex-row">
        <div className="md:w-3/5 p-6 md:p-8">
          <h2 className="text-2xl font-bold mb-6 text-neutral-900 dark:text-neutral-100 bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">Send Money</h2>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Amount Section */}
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-neutral-700 dark:text-neutral-200 font-medium">You Send</FormLabel>
                    <FormControl>
                      <div className="relative group">
                        <Input
                          {...field}
                          type="text"
                          placeholder="0.00"
                          className="block w-full py-3 px-4 bg-neutral-50 dark:bg-gray-800 border border-neutral-200 dark:border-gray-700 rounded-lg text-neutral-900 dark:text-white text-lg font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        />
                        <div className="absolute inset-0 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300"></div>

                        <div className="absolute inset-y-0 right-0 flex items-center">
                          <FormField
                            control={form.control}
                            name="sourceCurrency"
                            render={({ field }) => (
                              <FormControl>
                                <CurrencySelector
                                  value={field.value}
                                  onValueChange={field.onChange}
                                  currencies={currencies.filter((c: CurrencyData) => ['USD', 'EUR', 'GBP', 'SGD'].includes(c.code))}
                                />
                              </FormControl>
                            )}
                          />
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />

              {/* Parachain Info */}
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 transition-all hover:shadow-md">
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center mr-3 shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Source Parachain: <span className="font-semibold">{sourceParachain}</span>
                  </span>
                </div>
                <div className="text-xs text-blue-600 dark:text-blue-300 ml-11">
                  Optimized path using Polkadot's cross-consensus messaging (XCM)
                </div>
              </div>

              {/* Exchange Rate Info */}
              <div className="flex justify-between items-center p-3 text-sm rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  <span className="text-gray-600 dark:text-gray-300 mr-1">Rate: </span>
                  <span className="font-mono font-medium text-gray-900 dark:text-white">{exchangeRate}</span>
                </div>
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-gray-600 dark:text-gray-300 mr-1">Fee: </span>
                  <span className="font-mono font-medium text-gray-900 dark:text-white">{fee}</span>
                </div>
              </div>

              {/* Recipient Gets Section */}
              <FormItem>
                <FormLabel className="text-neutral-700 dark:text-neutral-200 font-medium flex items-center">
                  Recipient Gets
                  <div className="ml-2 px-2 py-0.5 text-xs rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                    Calculated amount
                  </div>
                </FormLabel>
                <div className="relative group">
                  <Input
                    type="text"
                    value={convertedAmount ? convertedAmount.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    }) : "0.00"}
                    disabled
                    className="block w-full py-3 px-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border border-neutral-200 dark:border-gray-700 rounded-lg text-neutral-900 dark:text-white text-lg font-mono"
                  />
                  <div className="absolute inset-0 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300"></div>

                  <div className="absolute inset-y-0 right-0 flex items-center">
                    <FormField
                      control={form.control}
                      name="targetCurrency"
                      render={({ field }) => (
                        <FormControl>
                          <CurrencySelector
                            value={field.value}
                            onValueChange={field.onChange}
                            currencies={currencies.filter((c: CurrencyData) => ['PHP', 'MYR', 'THB', 'IDR'].includes(c.code))}
                          />
                        </FormControl>
                      )}
                    />
                  </div>
                </div>
              </FormItem>

              {/* Destination Parachain Info */}
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 transition-all hover:shadow-md">
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center mr-3 shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Destination Parachain: <span className="font-semibold">{destinationParachain}</span>
                  </span>
                </div>
                <div className="text-xs text-blue-600 dark:text-blue-300 ml-11">
                  Assets will be automatically converted and transferred across chains
                </div>
              </div>

              {/* Recipient Details */}
              <FormField
                control={form.control}
                name="recipientAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-neutral-700 dark:text-neutral-200 font-medium">Recipient's Wallet Address</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          className="block w-full py-3 px-4 bg-neutral-50 dark:bg-gray-800 border border-neutral-200 dark:border-gray-700 rounded-lg text-neutral-900 dark:text-white text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <div className="text-xs bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded text-gray-600 dark:text-gray-300">Polkadot Address</div>
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <>
                <Button
                  type="submit"
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                  disabled={sendMoneyMutation.isPending || isConnecting} // Added isConnecting to disable button while connecting wallet
                >
                  <div className="flex items-center justify-center gap-2">
                    {sendMoneyMutation.isPending ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      <>
                        Continue to Review
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </>
                    )}
                  </div>
                </Button>
                <Button onClick={connectWallet} disabled={isConnecting}>
                  Connect Wallet
                </Button>
                <WalletPrompt />
              </>
            </form>
          </Form>
        </div>

        {/* Transaction Visualization */}
        <div className="md:w-2/5 bg-gradient-to-br from-blue-600 to-blue-800 p-6 md:p-8 text-white">
          <h3 className="text-xl font-semibold mb-6 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
            </svg>
            Transaction Flow
          </h3>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 shadow-lg border border-white/20">
            <TransactionFlow
              sourceAmount={parseFloat(watchAmount) || 0}
              sourceCurrency={sourceCurrency}
              convertedAmount={convertedAmount}
              targetCurrency={targetCurrency}
              xcmStatus={xcmStatus}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default RemittanceForm;