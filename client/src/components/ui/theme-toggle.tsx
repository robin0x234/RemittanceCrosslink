import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={toggleTheme}
      className="rounded-full transition-transform hover:scale-110"
    >
      {theme === 'light' ? (
        <>
          <Moon className="h-[1.2rem] w-[1.2rem] transition-all" />
          <span className="sr-only">Switch to dark mode</span>
        </>
      ) : (
        <>
          <Sun className="h-[1.2rem] w-[1.2rem] transition-all" />
          <span className="sr-only">Switch to light mode</span>
        </>
      )}
    </Button>
  );
}