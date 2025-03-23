
import { useEffect, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { web3Enable } from '@polkadot/extension-dapp';

export const WalletPrompt = () => {
  const [needsExtension, setNeedsExtension] = useState(true);

  useEffect(() => {
    const checkExtension = async () => {
      const extensions = await web3Enable('PolkaRemit');
      setNeedsExtension(extensions.length === 0);
    };
    checkExtension();
  }, []);

  if (!needsExtension) return null;

  return (
    <div className="p-4 bg-secondary/20 rounded-lg">
      <h3 className="text-lg font-semibold mb-2">First Time Setup</h3>
      <p className="mb-4">To use PolkaRemit, you'll need the Polkadot.js browser extension:</p>
      <a 
        href="https://polkadot.js.org/extension/"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-primary hover:underline"
      >
        Install Polkadot.js Extension <ExternalLink size={16} />
      </a>
      <p className="mt-4 text-sm text-muted-foreground">
        If you've already installed the extension, please refresh the page.
      </p>
    </div>
  );
};
