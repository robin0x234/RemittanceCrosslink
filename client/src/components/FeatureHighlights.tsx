
import { Link } from "wouter";
import { ArrowRight, Link as LinkIcon, GitBranch, Layers } from "lucide-react";

const FeatureHighlights = () => {
  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold mb-6 text-neutral-900">How PolkaRemit Works</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Feature 1: Cross-Chain Technology */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-100">
          <div className="w-12 h-12 rounded-lg bg-primary mb-4 flex items-center justify-center">
            <LinkIcon className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold mb-2 text-foreground">Cross-Chain Technology</h3>
          <p className="text-muted-foreground">
            Using Polkadot's XCM protocol for secure cross-chain transfers between parachains, enabling fast and reliable asset movement.
          </p>
        </div>

        {/* Feature 2: Optimal Routing */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-100">
          <div className="w-12 h-12 rounded-lg bg-secondary mb-4 flex items-center justify-center">
            <GitBranch className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold mb-2 text-foreground">Optimal Routing</h3>
          <p className="text-muted-foreground">
            Smart routing algorithm finds the most efficient path across parachains, minimizing fees and transfer time.
          </p>
        </div>

        {/* Feature 3: Liquidity Pools */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-100">
          <div className="w-12 h-12 rounded-lg bg-accent mb-4 flex items-center justify-center">
            <Layers className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold mb-2 text-foreground">Liquidity Pools</h3>
          <p className="text-muted-foreground">
            Decentralized liquidity pools ensure instant availability of assets for cross-chain transfers.
          </p>
        </div>
      </div>

      <div className="mt-8 text-center">
        <Link href="/send" className="inline-flex items-center text-primary hover:text-primary-dark font-medium">
          Start sending money today
          <ArrowRight className="h-5 w-5 ml-1" />
        </Link>
      </div>
    </section>
  );
};

export default FeatureHighlights;
