import { Link } from "wouter";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  return (
    <section className="mb-12">
      <div className="flex flex-col lg:flex-row items-center">
        <div className="lg:w-1/2 mb-8 lg:mb-0 lg:pr-12">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-neutral-900">
            Fast & Affordable Cross-Chain Remittances
          </h1>
          <p className="text-lg text-neutral-600 mb-6">
            Send money internationally with lower fees and faster settlements using Polkadot's interoperable blockchain network.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button asChild className="px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors">
              <Link href="/send">Send Money Now</Link>
            </Button>
            <Button asChild variant="outline" className="px-6 py-3 border border-primary text-primary font-medium rounded-lg hover:bg-primary-light hover:text-white transition-colors">
              <Link href="/pools">Provide Liquidity</Link>
            </Button>
          </div>
        </div>
        <div className="lg:w-1/2">
          <svg
            viewBox="0 0 600 400"
            className="w-full rounded-xl shadow-lg bg-white p-4"
          >
            <g transform="translate(300, 200)">
              <g>
                {/* World Map (simplified) */}
                <path
                  d="M-180,-80 C-160,-40 -140,-60 -120,-20 C-100,20 -80,-10 -60,30 C-40,70 -20,50 0,90 C20,50 40,70 60,30 C80,-10 100,20 120,-20 C140,-60 160,-40 180,-80 Z"
                  fill="#e5e7f0"
                  stroke="#ccd2e5"
                  strokeWidth="2"
                />
                
                {/* Source Node */}
                <circle cx="-120" cy="0" r="20" fill="#3B5EE5" />
                <text x="-120" y="0" textAnchor="middle" fill="white" dy=".3em">USD</text>
                
                {/* Target Node */}
                <circle cx="120" cy="0" r="20" fill="#7D4CDB" />
                <text x="120" y="0" textAnchor="middle" fill="white" dy=".3em">PHP</text>
                
                {/* Relay Chain */}
                <circle cx="0" cy="-60" r="25" fill="#00C8FF" />
                <text x="0" y="-60" textAnchor="middle" fill="white" dy=".3em">DOT</text>
                
                {/* Connection Lines */}
                <path d="M-120,0 C-80,-60 -40,-60 0,-60" stroke="#3B5EE5" strokeWidth="3" strokeDasharray="5,5" fill="none" />
                <path d="M0,-60 C40,-60 80,-60 120,0" stroke="#7D4CDB" strokeWidth="3" strokeDasharray="5,5" fill="none" />
                
                {/* Transaction animation */}
                <circle className="animate-ping" cx="-80" cy="-40" r="5" fill="#4CAF50" />
                <circle className="animate-ping animation-delay-1000" cx="-40" cy="-40" r="5" fill="#4CAF50" />
                <circle className="animate-ping animation-delay-2000" cx="0" cy="-40" r="5" fill="#4CAF50" />
                <circle className="animate-ping animation-delay-3000" cx="40" cy="-40" r="5" fill="#4CAF50" />
                <circle className="animate-ping animation-delay-4000" cx="80" cy="-40" r="5" fill="#4CAF50" />
                
                {/* Labels */}
                <text x="-120" y="35" textAnchor="middle" fill="#333" fontSize="12">Source Chain</text>
                <text x="120" y="35" textAnchor="middle" fill="#333" fontSize="12">Target Chain</text>
                <text x="0" y="-95" textAnchor="middle" fill="#333" fontSize="12">Polkadot Relay Chain</text>
              </g>
            </g>
          </svg>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
