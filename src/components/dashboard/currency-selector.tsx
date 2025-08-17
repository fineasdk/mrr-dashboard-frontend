import * as React from 'react';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { ChevronDown, DollarSign, Euro, CreditCard } from 'lucide-react';
import { Currency } from '../../lib/types';

interface CurrencySelectorProps {
  currentCurrency: Currency;
  onCurrencyChange: (currency: Currency) => void;
}

const currencyConfig = {
  'DKK': { label: 'Danish Krone', symbol: 'kr', icon: CreditCard, flag: '🇩🇰' },
  'EUR': { label: 'Euro', symbol: '€', icon: Euro, flag: '🇪🇺' },
  'USD': { label: 'US Dollar', symbol: '$', icon: DollarSign, flag: '🇺🇸' },
};

export function CurrencySelector({ currentCurrency, onCurrencyChange }: CurrencySelectorProps) {
  const current = currencyConfig[currentCurrency];
  const CurrentIcon = current.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="min-w-[140px]">
          <span className="mr-2">{current.flag}</span>
          <CurrentIcon className="mr-2 h-4 w-4" />
          <span className="mr-2">{currentCurrency}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {Object.entries(currencyConfig).map(([code, config]) => {
          const Icon = config.icon;
          return (
            <DropdownMenuItem
              key={code}
              onClick={() => onCurrencyChange(code as Currency)}
              className="flex items-center space-x-3"
            >
              <span>{config.flag}</span>
              <Icon className="h-4 w-4" />
              <div className="flex flex-col">
                <span className="font-medium">{code}</span>
                <span className="text-xs text-muted-foreground">{config.label}</span>
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}