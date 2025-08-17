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
        <div className="space-y-8">
          {/* Modern Header */}
          <div className="page-header">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="page-title">Dashboard</h1>
                <p className="page-description">Monitor your monthly recurring revenue and business metrics</p>
              </div>
              
              <div className="flex items-center gap-3">
                <CurrencySelector 
                  currentCurrency={selectedCurrency} 
                  onCurrencyChange={setSelectedCurrency} 
                />
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleSyncData}
                  disabled={isLoading}
                  className="btn-secondary"
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                  {isLoading ? 'Syncing...' : 'Sync Data'}
                </Button>
             
              </div>
            </div>
          </div>
          
          {/* Modern Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {convertedMetrics.map((metric, index) => {
              const Icon = metricIcons[index];
              const isPositive = metric.change && metric.change.startsWith('+');
              const isNegative = metric.change && metric.change.startsWith('-');
              
              return (
                <div key={metric.title} className="metric-card">
                  <div className="card-content">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 rounded-lg">
                          <Icon className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div>
                          <p className="metric-label">{metric.title}</p>
                          <p className="metric-value">{metric.value}</p>
                        </div>
                      </div>
                      {metric.change && (
                        <div className={`flex items-center gap-1 metric-change ${
                          isPositive ? 'positive' : isNegative ? 'negative' : ''
                        }`}>
                          {isPositive && <ArrowUpRight className="h-3 w-3" />}
                          {isNegative && <ArrowDownRight className="h-3 w-3" />}
                          <span>{metric.change}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Modern Charts Section */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="card">
              <div className="card-content">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-slate-900">MRR Trend</h3>
                  <p className="text-sm text-slate-600">Monthly recurring revenue over time</p>
                </div>
                <MRRChart data={mockMRRData} />
              </div>
            </div>
            
            <div className="card">
              <div className="card-content">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-slate-900">Platform Breakdown</h3>
                  <p className="text-sm text-slate-600">Revenue distribution by platform</p>
                </div>
                <PlatformChart data={mockPlatformBreakdown} />
              </div>
            </div>
          </div>
          
          {/* Modern Bottom Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Platform Status */}
            <div className="card">
              <div className="card-content">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-slate-900">Platform Status</h3>
                  {/* <Button variant="ghost" size="sm" className="btn-ghost">
                    View All
                  </Button> */}
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <span className="text-lg">🔗</span>
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">E-conomic</p>
                        <p className="text-sm text-slate-600">Last sync: 5 min ago</p>
                      </div>
                    </div>
                    <div className="status-dot status-active"></div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <span className="text-lg">🛒</span>
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">Shopify</p>
                        <p className="text-sm text-slate-600">Last sync: 1 hour ago</p>
                      </div>
                    </div>
                    <div className="status-dot status-warning"></div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <span className="text-lg">💳</span>
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">Stripe</p>
                        <p className="text-sm text-slate-600">Last sync: 15 min ago</p>
                      </div>
                    </div>
                    <div className="status-dot status-active"></div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Recent Activity */}
            <div className="card">
              <div className="card-content">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-slate-900">Recent Activity</h3>
                  {/* <Button variant="ghost" size="sm" className="btn-ghost">
                    View All
                  </Button> */}
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="status-dot status-active mt-2"></div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">New customer added</p>
                      <p className="text-sm text-slate-600">ACME Corp - 16,400 DKK/month</p>
                      <p className="text-xs text-slate-500 mt-1">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="status-dot status-warning mt-2"></div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">Customer excluded</p>
                      <p className="text-sm text-slate-600">Test Corp - 4,500 DKK/month</p>
                      <p className="text-xs text-slate-500 mt-1">Yesterday</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="status-dot status-active mt-2"></div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">Payment received</p>
                      <p className="text-sm text-slate-600">Manufacturing Co - 21,900 DKK</p>
                      <p className="text-xs text-slate-500 mt-1">2 days ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Modern Insights Section */}
          <div className="card">
            <div className="card-content">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-indigo-100 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">Performance Insights</h3>
                      <p className="text-sm text-slate-600">Your MRR is growing steadily this month</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-slate-50 rounded-lg">
                      <p className="text-sm text-slate-600 mb-1">Growth Rate</p>
                      <p className="text-2xl font-semibold text-green-600">+12.5%</p>
                      <p className="text-xs text-slate-500">vs last month</p>
                    </div>
                    <div className="text-center p-4 bg-slate-50 rounded-lg">
                      <p className="text-sm text-slate-600 mb-1">New Customers</p>
                      <p className="text-2xl font-semibold text-blue-600">23</p>
                      <p className="text-xs text-slate-500">this month</p>
                    </div>
                    <div className="text-center p-4 bg-slate-50 rounded-lg">
                      <p className="text-sm text-slate-600 mb-1">Churn Rate</p>
                      <p className="text-2xl font-semibold text-indigo-600">2.1%</p>
                      <p className="text-xs text-slate-500">below target</p>
                    </div>
                  </div>
                </div>
                
                {/* <Button className="btn-primary ml-6">
                  View Details
                </Button> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}