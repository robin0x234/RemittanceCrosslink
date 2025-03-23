import HeroSection from "@/components/HeroSection";
import RemittanceForm from "@/components/RemittanceForm";
import FeatureHighlights from "@/components/FeatureHighlights";
import LiquidityPoolSection from "@/components/LiquidityPoolSection";
import TransactionHistory from "@/components/TransactionHistory";
import ComparisonSection from "@/components/ComparisonSection";

const Home = () => {
  return (
    <main className="container mx-auto px-4 sm:px-6 py-8">
      <HeroSection />
      <RemittanceForm />
      <FeatureHighlights />
      <LiquidityPoolSection />
      <TransactionHistory />
      <ComparisonSection />
    </main>
  );
};

export default Home;
