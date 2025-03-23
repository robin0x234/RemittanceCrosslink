import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CurrencyData } from "@/types";

interface CurrencySelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  currencies: CurrencyData[];
}

export const CurrencySelector = ({ 
  value, 
  onValueChange,
  currencies
}: CurrencySelectorProps) => {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="h-full py-0 pl-2 pr-7 border-transparent bg-transparent text-neutral-800 font-medium rounded-md focus:ring-primary focus:border-primary w-auto">
        <SelectValue placeholder="Select currency" />
      </SelectTrigger>
      <SelectContent>
        {currencies.map((currency) => (
          <SelectItem key={currency.code} value={currency.code}>
            {currency.code}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
