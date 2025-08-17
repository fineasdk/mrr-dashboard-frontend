import { useState } from 'react';
import { RefreshCw, Download, TrendingUp, Users, CreditCard, Activity, ArrowUpRight, ArrowDownRight } from 'lucide-react';
// import { MetricCard } from '../dashboard/metric-card';
import { MRRChart } from '../dashboard/mrr-chart';
import { PlatformChart } from '../dashboard/platform-chart';
import { CurrencySelector } from '../dashboard/currency-selector';
import { Button } from '../ui/button';
import { mockMetrics, mockMRRData, mockPlatformBreakdown, convertCurrency } from '../../lib/mock-data';
import { Currency } from '../../lib/types';

const metricIcons = [TrendingUp, Users, CreditCard, Activity];

export function DashboardPage() {
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('DKK');
  const [isLoading, setIsLoading] = useState(false);

  // Convert metrics to selected currency
  const convertedMetrics = mockMetrics.map((metric, index) => {
    if (metric.value && typeof metric.value === 'string' && metric.value.includes('DKK')) {
      const numericValue = parseFloat(metric.value.replace(/[^0-9.-]/g, ''));
      const convertedValue = convertCurrency(numericValue, 'DKK', selectedCurrency);
      return {
        ...metric,
        value: `${convertedValue.toLocaleString('da-DK')} ${selectedCurrency}`,
        currency: selectedCurrency,
      };
    }
    return metric;
  });

  const handleSyncData = async () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="page-container">
      <div className="layout-container section-padding">
        <div className="space-y-6 sm:space-y-8">
          {/* Responsive Header */}
          <div className="page-header">
            <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 gap-4">
              <div>
                <h1 className="page-title text-xl sm:text-2xl">Dashboard</h1>
                <p className="page-description text-sm sm:text-base">Monitor your monthly recurring revenue and business metrics</p>
              </div>
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <CurrencySelector 
                  currentCurrency={selectedCurrency} 
                  onCurrencyChange={setSelectedCurrency} 
                />
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleSyncData}
                  disabled={isLoading}
                  className="btn-secondary w-full sm:w-auto"
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                  {isLoading ? 'Syncing...' : 'Sync Data'}
                </Button>
              </div>
            </div>
          </div>
          
          {/* Responsive Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {convertedMetrics.map((metric, index) => {
              const Icon = metricIcons[index];
              const isPositive = metric.change && metric.change.startsWith('+');
              const isNegative = metric.change && metric.change.startsWith('-');
              
              return (
                <div key={metric.title} className="metric-card">
                  <div className="card-content p-4 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="p-2 bg-indigo-50 rounded-lg flex-shrink-0">
                          <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="metric-label text-xs sm:text-sm">{metric.title}</p>
                          <p className="metric-value text-lg sm:text-xl lg:text-2xl">{metric.value}</p>
                        </div>
                      </div>

                    </div>
                    {metric.change && (
                        <div className={`flex items-center gap-1 metric-change text-xs sm:text-sm mx-3 text-end w-full   justify-end ${
                          isPositive ? 'positive' : isNegative ? 'negative' : ''
                        } flex-shrink-0 ml-2`}>
                          {isPositive && <ArrowUpRight className="h-3 w-3" />}
                          {isNegative && <ArrowDownRight className="h-3 w-3" />}
                          <span>{metric.change}</span>
                        </div>
                      )}
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Responsive Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div className="card">
              <div className="card-content p-4 sm:p-6">
                <div className="mb-4 sm:mb-6">
                  <h3 className="text-base sm:text-lg font-semibold text-slate-900">MRR Trend</h3>
                  <p className="text-xs sm:text-sm text-slate-600">Monthly recurring revenue over time</p>
                </div>
                <div className="">
                  <MRRChart data={mockMRRData} />
                </div>
              </div>
            </div>
            
            <div className="card">
              <div className="card-content p-4 sm:p-6">
                <div className="mb-4 sm:mb-6">
                  <h3 className="text-base sm:text-lg font-semibold text-slate-900">Platform Breakdown</h3>
                  <p className="text-xs sm:text-sm text-slate-600">Revenue distribution by platform</p>
                </div>
                <div className="">
                  <PlatformChart data={mockPlatformBreakdown} />
                </div>
              </div>
            </div>
          </div>
          
          {/* Responsive Bottom Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Platform Status */}
            <div className="card">
              <div className="card-content p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h3 className="text-base sm:text-lg font-semibold text-slate-900">Platform Status</h3>
                </div>
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-between p-3 sm:p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                        <span className="text-base sm:text-lg">🔗</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-slate-900 text-sm sm:text-base">E-conomic</p>
                        <p className="text-xs sm:text-sm text-slate-600">Last sync: 5 min ago</p>
                      </div>
                    </div>
                    <div className="status-dot status-active flex-shrink-0"></div>
                  </div>
                  <div className="flex items-center justify-between p-3 sm:p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="p-2 bg-purple-100 rounded-lg flex-shrink-0">
                        <span className="text-base sm:text-lg">🛒</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-slate-900 text-sm sm:text-base">Shopify</p>
                        <p className="text-xs sm:text-sm text-slate-600">Last sync: 1 hour ago</p>
                      </div>
                    </div>
                    <div className="status-dot status-warning flex-shrink-0"></div>
                  </div>
                  <div className="flex items-center justify-between p-3 sm:p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
                        <span className="text-base sm:text-lg">💳</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-slate-900 text-sm sm:text-base">Stripe</p>
                        <p className="text-xs sm:text-sm text-slate-600">Last sync: 15 min ago</p>
                      </div>
                    </div>
                    <div className="status-dot status-active flex-shrink-0"></div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Recent Activity */}
            <div className="card">
              <div className="card-content p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h3 className="text-base sm:text-lg font-semibold text-slate-900">Recent Activity</h3>
                </div>
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="status-dot status-active mt-2 flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 text-sm sm:text-base">New customer added</p>
                      <p className="text-xs sm:text-sm text-slate-600">ACME Corp - 16,400 DKK/month</p>
                      <p className="text-xs text-slate-500 mt-1">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="status-dot status-warning mt-2 flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 text-sm sm:text-base">Customer excluded</p>
                      <p className="text-xs sm:text-sm text-slate-600">Test Corp - 4,500 DKK/month</p>
                      <p className="text-xs text-slate-500 mt-1">Yesterday</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="status-dot status-active mt-2 flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 text-sm sm:text-base">Payment received</p>
                      <p className="text-xs sm:text-sm text-slate-600">Manufacturing Co - 21,900 DKK</p>
                      <p className="text-xs text-slate-500 mt-1">2 days ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Responsive Insights Section */}
          <div className="card">
            <div className="card-content p-4 sm:p-6">
              <div className="flex flex-col lg:flex-row items-start justify-between gap-6">
                <div className="flex-1 w-full">
                  <div className="flex items-center gap-3 mb-4 sm:mb-6">
                    <div className="p-2 sm:p-3 bg-indigo-100 rounded-lg flex-shrink-0">
                      <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-slate-900">Performance Insights</h3>
                      <p className="text-xs sm:text-sm text-slate-600">Your MRR is growing steadily this month</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    <div className="text-center p-3 sm:p-4 bg-slate-50 rounded-lg">
                      <p className="text-xs sm:text-sm text-slate-600 mb-1">Growth Rate</p>
                      <p className="text-xl sm:text-2xl font-semibold text-green-600">+12.5%</p>
                      <p className="text-xs text-slate-500">vs last month</p>
                    </div>
                    <div className="text-center p-3 sm:p-4 bg-slate-50 rounded-lg">
                      <p className="text-xs sm:text-sm text-slate-600 mb-1">New Customers</p>
                      <p className="text-xl sm:text-2xl font-semibold text-blue-600">23</p>
                      <p className="text-xs text-slate-500">this month</p>
                    </div>
                    <div className="text-center p-3 sm:p-4 bg-slate-50 rounded-lg sm:col-span-2 lg:col-span-1">
                      <p className="text-xs sm:text-sm text-slate-600 mb-1">Churn Rate</p>
                      <p className="text-xl sm:text-2xl font-semibold text-indigo-600">2.1%</p>
                      <p className="text-xs text-slate-500">below target</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}