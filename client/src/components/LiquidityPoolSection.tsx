import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useWallet } from "@/hooks/use-wallet";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

interface LiquidityPool {
  id: number;
  totalLiquidity: number;
  dailyVolume: number;
  apy: number;
  sourceCurrency: {
    id: number;
    code: string;
    symbol: string;
  };
  targetCurrency: {
    id: number;
    code: string;
    symbol: string;
  };
}

const LiquidityPoolSection = () => {
  const { toast } = useToast();
  const { walletAddress } = useWallet();
  const [selectedPool, setSelectedPool] = useState<LiquidityPool | null>(null);
  const [amount, setAmount] = useState("");

  // Fetch liquidity pools
  const { data: liquidityPools = [], isLoading } = useQuery({
    queryKey: ['/api/liquidity-pools'],
  });

  // Fetch user positions if wallet is connected
  const { data: userPositions = [] } = useQuery({
    queryKey: ['/api/liquidity-positions/user/1'],
    enabled: !!walletAddress,
  });

  // Add liquidity mutation
  const addLiquidityMutation = useMutation({
    mutationFn: async (data: { poolId: number; amount: number }) => {
      return apiRequest("POST", "/api/liquidity-positions", {
        userId: 1, // Mock user ID for demo
        poolId: data.poolId,
        amount: data.amount
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/liquidity-pools'] });
      queryClient.invalidateQueries({ queryKey: ['/api/liquidity-positions/user/1'] });
      toast({
        title: "Liquidity Added",
        description: `You have successfully added ${amount} to the pool.`,
      });
      setAmount("");
    },
    onError: (error) => {
      toast({
        title: "Failed to add liquidity",
        description: error.message || "An error occurred while adding liquidity.",
        variant: "destructive",
      });
    },
  });

  const handleAddLiquidity = () => {
    if (!selectedPool) return;
    
    if (!walletAddress) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to add liquidity.",
        variant: "destructive",
      });
      return;
    }
    
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount.",
        variant: "destructive",
      });
      return;
    }
    
    addLiquidityMutation.mutate({
      poolId: selectedPool.id,
      amount: parseFloat(amount)
    });
  };

  // Get user stake in a pool
  const getUserStake = (poolId: number) => {
    if (!userPositions.length) return 0;
    
    const position = userPositions.find((pos: any) => pos.poolId === poolId);
    return position ? position.amount : 0;
  };

  return (
    <section className="bg-white rounded-xl shadow-md mb-12 overflow-hidden">
      <div className="p-6 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h2 className="text-2xl font-bold text-neutral-900 mb-4 md:mb-0">Liquidity Pools</h2>
          <Button className="px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition-colors">
            Add Liquidity
          </Button>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center p-8">
            <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-neutral-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Currency Pair
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Total Liquidity
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    24h Volume
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    APY
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Your Stake
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {liquidityPools.map((pool: LiquidityPool) => (
                  <tr key={pool.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex -space-x-2 mr-3">
                          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-medium z-10">
                            {pool.sourceCurrency?.code || 'USD'}
                          </div>
                          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-white text-xs font-medium">
                            {pool.targetCurrency?.code || 'PHP'}
                          </div>
                        </div>
                        <div className="text-sm font-medium text-neutral-900">
                          {pool.sourceCurrency?.code || 'USD'}/{pool.targetCurrency?.code || 'PHP'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-800 font-mono">
                      ${pool.totalLiquidity.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-800 font-mono">
                      ${pool.dailyVolume.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-success">{pool.apy.toFixed(1)}%</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-800 font-mono">
                      ${getUserStake(pool.id).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="link"
                            className="text-primary hover:text-primary-dark"
                            onClick={() => setSelectedPool(pool)}
                          >
                            Provide
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>Add Liquidity</DialogTitle>
                            <DialogDescription>
                              Provide liquidity to the {pool.sourceCurrency?.code || 'USD'}/{pool.targetCurrency?.code || 'PHP'} pool and earn {pool?.apy}% APY.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="amount" className="text-right">
                                Amount
                              </Label>
                              <div className="col-span-3">
                                <Input
                                  id="amount"
                                  value={amount}
                                  onChange={(e) => setAmount(e.target.value)}
                                  placeholder="0.00"
                                  className="font-mono"
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label className="text-right">
                                Currency
                              </Label>
                              <div className="col-span-3">
                                <div className="flex items-center space-x-2">
                                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white text-xs font-medium">
                                    {selectedPool?.sourceCurrency?.code || 'USD'}
                                  </div>
                                  <span>{selectedPool?.sourceCurrency?.code || 'USD'}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button
                              type="submit"
                              onClick={handleAddLiquidity}
                              disabled={addLiquidityMutation.isPending}
                            >
                              {addLiquidityMutation.isPending ? "Adding..." : "Add Liquidity"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
};

export default LiquidityPoolSection;
