import { useLocation } from "wouter";
import { useWallet } from "@/hooks/use-wallet";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
//import { ThemeToggle } from "@/components/ui/theme-toggle"; //Removed
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";

const Header = () => {
  const [location, navigate] = useLocation();
  const { walletAddress, connectWallet } = useWallet();
  const { theme } = useTheme();

  const isActive = (path: string) => {
    return location === path ? "text-primary" : "text-foreground hover:text-primary";
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Send Money", path: "/send" },
    { name: "Liquidity Pools", path: "/pools" },
    { name: "History", path: "/history" },
  ];

  return (
    <header className="border-b border-border bg-background transition-colors duration-300">
      <div className="container mx-auto px-4 sm:px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 1l4 4-4 4" />
                <path d="M3 11V9a4 4 0 014-4h14" />
                <path d="M7 23l-4-4 4-4" />
                <path d="M21 13v2a4 4 0 01-4 4H3" />
              </svg>
            </div>
            <button 
              className="text-xl font-bold text-foreground cursor-pointer"
              onClick={() => navigate("/")}
            >
              PolkaRemit
            </button>
          </div>

          <nav className="hidden md:flex space-x-8">
            {navLinks.map((link) => (
              <button
                key={link.path}
                className={`font-medium transition-colors ${isActive(link.path)}`}
                onClick={() => navigate(link.path)}
              >
                {link.name}
              </button>
            ))}
          </nav>

          <div className="flex items-center space-x-4">
            {/*Removed ThemeToggle*/}

            <div className="hidden md:block">
              <Button
                variant="outline"
                className="flex items-center space-x-2"
                onClick={connectWallet}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="5" width="20" height="14" rx="2" />
                  <path d="M16 12h.01" />
                  <path d="M13 12h.01" />
                </svg>
                <span>
                  {walletAddress 
                    ? `${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`
                    : "Connect Wallet"}
                </span>
              </Button>
            </div>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="flex flex-col space-y-4 mt-8">
                  {/*Removed ThemeToggle from mobile menu*/}
                  {navLinks.map((link) => (
                    <button
                      key={link.path}
                      className={`font-medium transition-colors text-left ${isActive(link.path)}`}
                      onClick={() => navigate(link.path)}
                    >
                      {link.name}
                    </button>
                  ))}
                  <Button
                    variant="outline"
                    className="flex items-center space-x-2 mt-4"
                    onClick={connectWallet}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="5" width="20" height="14" rx="2" />
                      <path d="M16 12h.01" />
                      <path d="M13 12h.01" />
                    </svg>
                    <span>
                      {walletAddress 
                        ? `${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`
                        : "Connect Wallet"}
                    </span>
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;