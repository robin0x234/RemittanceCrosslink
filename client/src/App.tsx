import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import SendMoney from "@/pages/SendMoney";
import LiquidityPools from "@/pages/LiquidityPools";
import History from "@/pages/History";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { WalletProvider } from "@/hooks/use-wallet";
import { ThemeProvider } from "@/hooks/use-theme";

function Router() {
  const [location] = useLocation();

  return (
    <div className="flex flex-col min-h-screen transition-colors duration-300 bg-white dark:bg-gray-900">
      <Header />
      <div className="flex-grow">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/send" component={SendMoney} />
          <Route path="/pools" component={LiquidityPools} />
          <Route path="/history" component={History} />
          <Route component={NotFound} />
        </Switch>
      </div>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <WalletProvider>
          <Router />
          <Toaster />
        </WalletProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
