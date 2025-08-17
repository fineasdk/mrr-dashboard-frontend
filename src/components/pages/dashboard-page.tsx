import { useState } from 'react';
import { DollarSign, Users, TrendingUp, Calendar, RefreshCw, Download } from 'lucide-react';
import { MetricCard } from '../dashboard/metric-card';
import { MRRChart } from '../dashboard/mrr-chart';
import { PlatformChart } from '../dashboard/platform-chart';
import { CurrencySelector } from '../dashboard/currency-selector';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  mockMetrics, 
  mockMRRData, 
  mockPlatformBreakdown, 
  formatCurrency, 
  convertCurrency 
} from '../../lib/mock-data';
import { Currency } from '../../lib/types';

const metricIcons = [DollarSign, Users, TrendingUp, Calendar];

export function DashboardPage() {
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('DKK');

  // Convert metrics to selected currency
  const convertedMetrics = mockMetrics.map(metric => {
    if (metric.currency && metric.currency !== selectedCurrency) {
      // Parse the numeric values and convert them
      const valueMatch = metric.value.match(/[\d,]+/);
      const changeMatch = metric.change.match(/[\d,]+/);
      
      if (valueMatch) {
        const numericValue = parseInt(valueMatch[0].replace(/,/g, ''));
        const convertedValue = convertCurrency(numericValue, metric.currency, selectedCurrency);
        const formattedValue = formatCurrency(convertedValue, selectedCurrency);
        
        return {
          ...metric,
          value: formattedValue,
          change: changeMatch ? 
            metric.change.replace(valueMatch[0], Math.round(convertCurrency(parseInt(changeMatch[0].replace(/,/g, '')), metric.currency, selectedCurrency)).toLocaleString()) : 
            metric.change
        };
      }
    }
    return metric;
  });

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">MRR Dashboard</h1>
          <p className="text-muted-foreground">Overview of your monthly recurring revenue</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
          <CurrencySelector 
            currentCurrency={selectedCurrency} 
            onCurrencyChange={setSelectedCurrency} 
          />
          <Button variant="outline" size="sm" className="w-full sm:w-auto">
            <RefreshCw className="mr-2 h-4 w-4" />
            <span className="sm:inline">Sync Data</span>
          </Button>
          <Button variant="outline" size="sm" className="w-full sm:w-auto">
            <Download className="mr-2 h-4 w-4" />
            <span className="sm:inline">Export</span>
          </Button>
        </div>
      </div>
      
      {/* Main Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {convertedMetrics.map((metric, index) => (
          <MetricCard
            key={metric.title}
            {...metric}
            icon={metricIcons[index]}
          />
        ))}
      </div>
      
      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <MRRChart data={mockMRRData} />
        <PlatformChart data={mockPlatformBreakdown} />
      </div>
      
      {/* Bottom Row: Platform Status & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <RefreshCw className="h-5 w-5" />
              <span>Platform Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">🔗 E-conomic</span>
                </div>
                <span className="text-xs text-muted-foreground">5 min ago</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm">🛒 Shopify</span>
                </div>
                <span className="text-xs text-muted-foreground">1 hour ago</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">💳 Stripe</span>
                </div>
                <span className="text-xs text-muted-foreground">15 min ago</span>
              </div>
            </div>
            <Button variant="outline" className="w-full mt-4">
              <RefreshCw className="mr-2 h-4 w-4" />
              Sync All Platforms
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Recent Changes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">New customer added</p>
                  <p className="text-xs text-muted-foreground truncate">ACME Corp - kr 16,400/month</p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Customer excluded</p>
                  <p className="text-xs text-muted-foreground truncate">Test Corp - kr 4,500/month</p>
                  <p className="text-xs text-muted-foreground">Yesterday</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Payment received</p>
                  <p className="text-xs text-muted-foreground truncate">Manufacturing Co - kr 21,900</p>
                  <p className="text-xs text-muted-foreground">2 days ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}