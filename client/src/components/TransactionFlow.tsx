import { CurrencyData } from "@/types";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface TransactionFlowProps {
  sourceAmount: number;
  sourceCurrency: CurrencyData | null;
  convertedAmount: number;
  targetCurrency: CurrencyData | null;
  xcmStatus: string;
}

const TransactionFlow = ({
  sourceAmount,
  sourceCurrency,
  convertedAmount,
  targetCurrency,
  xcmStatus
}: TransactionFlowProps) => {
  const [animationComplete, setAnimationComplete] = useState<{
    step1: boolean;
    step2: boolean;
    step3: boolean;
  }>({
    step1: false,
    step2: false,
    step3: false
  });

  // Animate steps in sequence
  useEffect(() => {
    if (sourceAmount > 0) {
      const timer1 = setTimeout(() => setAnimationComplete(prev => ({ ...prev, step1: true })), 500);
      const timer2 = setTimeout(() => setAnimationComplete(prev => ({ ...prev, step2: true })), 1500);
      const timer3 = setTimeout(() => setAnimationComplete(prev => ({ ...prev, step3: true })), 2500);
      
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    } else {
      setAnimationComplete({ step1: false, step2: false, step3: false });
    }
  }, [sourceAmount]);

  // Update animation on status change
  useEffect(() => {
    if (xcmStatus === "Processing") {
      setAnimationComplete(prev => ({ ...prev, step2: true }));
    } else if (xcmStatus === "Complete") {
      setAnimationComplete({ step1: true, step2: true, step3: true });
    }
  }, [xcmStatus]);

  return (
    <div className="relative">
      {/* Flow Step 1 */}
      <motion.div 
        className="flex items-start mb-8"
        initial={{ opacity: 0.5, x: -10 }}
        animate={{ 
          opacity: 1, 
          x: 0,
          scale: animationComplete.step1 ? 1 : 0.98
        }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex flex-col items-center mr-4">
          <motion.div 
            className={`w-8 h-8 rounded-full ${animationComplete.step1 ? 'bg-blue-500 text-white' : 'bg-white/20 text-white/80'} flex items-center justify-center font-bold`}
            animate={{ 
              backgroundColor: animationComplete.step1 ? 'rgb(59, 130, 246)' : 'rgba(255,255,255,0.2)',
              color: animationComplete.step1 ? '#ffffff' : 'rgba(255,255,255,0.8)'
            }}
          >1</motion.div>
          <motion.div 
            className={`h-full border-l-2 ${animationComplete.step1 && animationComplete.step2 ? 'border-blue-500' : 'border-white/30'} border-dashed mt-2 ml-0.5`}
            initial={{ height: 0 }}
            animate={{ height: animationComplete.step1 ? 60 : 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          ></motion.div>
        </div>
        <div className="w-full">
          <h4 className="font-medium mb-1 text-white">Source Wallet</h4>
          <p className="text-sm text-white/80 mb-2">Your wallet on the source parachain</p>
          <motion.div 
            className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/10"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <div className="text-xs mb-1 text-white/70">Balance:</div>
            <div className="font-mono font-medium text-white">
              {sourceAmount ? (
                `${sourceCurrency?.symbol || '$'}${sourceAmount.toFixed(2)} ${sourceCurrency?.code || 'USD'}`
              ) : (
                `${sourceCurrency?.symbol || '$'}0.00 ${sourceCurrency?.code || 'USD'}`
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Flow Step 2 */}
      <motion.div 
        className="flex items-start mb-8"
        initial={{ opacity: 0.5, x: -10 }}
        animate={{ 
          opacity: animationComplete.step1 ? 1 : 0.5, 
          x: animationComplete.step1 ? 0 : -10,
          scale: animationComplete.step2 ? 1 : 0.98
        }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className="flex flex-col items-center mr-4">
          <motion.div 
            className={`w-8 h-8 rounded-full ${animationComplete.step2 ? 'bg-blue-500 text-white' : 'bg-white/20 text-white/80'} flex items-center justify-center font-bold`}
            animate={{ 
              backgroundColor: animationComplete.step2 ? 'rgb(59, 130, 246)' : 'rgba(255,255,255,0.2)',
              color: animationComplete.step2 ? '#ffffff' : 'rgba(255,255,255,0.8)'
            }}
          >2</motion.div>
          <motion.div 
            className={`h-full border-l-2 ${animationComplete.step2 && animationComplete.step3 ? 'border-blue-500' : 'border-white/30'} border-dashed mt-2 ml-0.5`}
            initial={{ height: 0 }}
            animate={{ height: animationComplete.step2 ? 60 : 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          ></motion.div>
        </div>
        <div className="w-full">
          <h4 className="font-medium mb-1 text-white">Cross-Chain Transfer (XCM)</h4>
          <p className="text-sm text-white/80 mb-2">Assets move between parachains via XCM</p>
          <motion.div 
            className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/10"
            whileHover={{ scale: 1.02 }}
            animate={{ 
              borderColor: xcmStatus === "Processing" ? 'rgba(239, 219, 111, 0.5)' : 
                          xcmStatus === "Complete" ? 'rgba(110, 231, 183, 0.5)' : 
                          'rgba(255, 255, 255, 0.1)'
            }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <div className="text-xs mb-1 text-white/70">Status:</div>
            <div className="font-medium text-white flex items-center">
              {xcmStatus === "Processing" && (
                <motion.div 
                  className="w-2 h-2 bg-yellow-300 rounded-full mr-2"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                ></motion.div>
              )}
              {xcmStatus === "Complete" && (
                <motion.div 
                  className="w-2 h-2 bg-green-400 rounded-full mr-2"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring" }}
                ></motion.div>
              )}
              {xcmStatus || "Ready to initiate"}
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Flow Step 3 */}
      <motion.div 
        className="flex items-start"
        initial={{ opacity: 0.5, x: -10 }}
        animate={{ 
          opacity: animationComplete.step2 ? 1 : 0.5, 
          x: animationComplete.step2 ? 0 : -10,
          scale: animationComplete.step3 ? 1 : 0.98
        }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <div className="flex flex-col items-center mr-4">
          <motion.div 
            className={`w-8 h-8 rounded-full ${animationComplete.step3 ? 'bg-blue-500 text-white' : 'bg-white/20 text-white/80'} flex items-center justify-center font-bold`}
            animate={{ 
              backgroundColor: animationComplete.step3 ? 'rgb(59, 130, 246)' : 'rgba(255,255,255,0.2)',
              color: animationComplete.step3 ? '#ffffff' : 'rgba(255,255,255,0.8)'
            }}
          >3</motion.div>
        </div>
        <div className="w-full">
          <h4 className="font-medium mb-1 text-white">Recipient Wallet</h4>
          <p className="text-sm text-white/80 mb-2">Final destination on target parachain</p>
          <motion.div 
            className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/10"
            whileHover={{ scale: 1.02 }}
            animate={{
              borderColor: animationComplete.step3 ? 'rgba(110, 231, 183, 0.5)' : 'rgba(255, 255, 255, 0.1)'
            }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <div className="text-xs mb-1 text-white/70">Will receive:</div>
            <motion.div 
              className="font-mono font-medium text-white"
              animate={{ 
                scale: animationComplete.step3 && convertedAmount > 0 ? [1, 1.05, 1] : 1
              }}
              transition={{ duration: 0.5 }}
            >
              {convertedAmount ? (
                `${targetCurrency?.symbol || '₱'}${convertedAmount.toFixed(2)} ${targetCurrency?.code || 'PHP'}`
              ) : (
                `${targetCurrency?.symbol || '₱'}0.00 ${targetCurrency?.code || 'PHP'}`
              )}
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Visual cue for XCM transfer */}
      {animationComplete.step2 && (
        <motion.div 
          className="absolute left-4 top-1/2 -translate-y-1/2 w-0.5 h-[60%] bg-gradient-to-b from-blue-400 to-blue-600 opacity-70"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 0.7 }}
        />
      )}
    </div>
  );
};

export default TransactionFlow;