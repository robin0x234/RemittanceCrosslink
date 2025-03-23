import LiquidityPoolSection from "@/components/LiquidityPoolSection";

const LiquidityPools = () => {
  return (
    <main className="container mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-3xl font-bold mb-6">Liquidity Pools</h1>
      <p className="text-lg text-neutral-600 mb-8">
        Provide liquidity to currency pairs and earn passive income while helping to facilitate cross-chain remittances.
      </p>
      <LiquidityPoolSection />
      
      <div className="bg-white rounded-xl shadow-md p-6 md:p-8 mb-12">
        <h2 className="text-2xl font-bold mb-6">How Liquidity Pools Work</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-3">What are Liquidity Pools?</h3>
            <p className="text-neutral-600 mb-4">
              Liquidity pools are collections of funds locked in smart contracts that facilitate efficient token swaps without requiring a buyer and seller to be matched directly.
            </p>
            <p className="text-neutral-600 mb-4">
              By providing liquidity, you're essentially depositing your assets into these pools to help others make conversions between currency pairs.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-3">Earning Rewards</h3>
            <p className="text-neutral-600 mb-4">
              In return for providing liquidity, you earn a portion of the fees generated from transactions that use the pool.
            </p>
            <p className="text-neutral-600 mb-4">
              The Annual Percentage Yield (APY) shown for each pool is an estimate of your potential returns based on current transaction volumes and pool sizes.
            </p>
          </div>
        </div>
        
        <div className="mt-6 border-t border-neutral-100 pt-6">
          <h3 className="text-lg font-semibold mb-3">Risks and Considerations</h3>
          <p className="text-neutral-600 mb-4">
            While providing liquidity can be profitable, it's important to understand the risks:
          </p>
          <ul className="list-disc pl-5 text-neutral-600 space-y-2">
            <li>Impermanent Loss: Changes in the relative prices of the paired assets can result in having less value than if you'd simply held the assets.</li>
            <li>Smart Contract Risk: While our contracts are audited, all smart contracts carry some level of risk.</li>
            <li>Market Volatility: Extreme market conditions can affect pool stability and returns.</li>
          </ul>
        </div>
      </div>
    </main>
  );
};

export default LiquidityPools;
