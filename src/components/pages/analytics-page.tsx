import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Calendar, Download, TrendingUp } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
} from 'recharts';
import { mockMRRData, formatCurrency } from '../../lib/mock-data';

const monthlyGrowthData = [
  { month: 'Sep', growth: 5.2 },
  { month: 'Oct', growth: 9.4 },
  { month: 'Nov', growth: 5.5 },
  { month: 'Dec', growth: 5.3 },
  { month: 'Jan', growth: 5.0 },
  { month: 'Feb', growth: 10.4 },
];

const customerGrowthData = [
  { month: 'Sep', customers: 198 },
  { month: 'Oct', customers: 212 },
  { month: 'Nov', customers: 225 },
  { month: 'Dec', customers: 241 },
  { month: 'Jan', customers: 253 },
  { month: 'Feb', customers: 284 },
];

export function AnalyticsPage() {
  const safeFormatCurrency = (amount: number | undefined): string => {
    if (typeof amount !== 'number' || isNaN(amount)) return 'kr 0';
    return formatCurrency(amount, 'DKK');
  };

  const safeToLocaleString = (value: number | undefined): string => {
    if (typeof value !== 'number' || isNaN(value)) return '0';
    return value.toLocaleString();
  };

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-6 sm:space-y-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* Responsive Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 text-sm sm:text-base lg:text-lg">Historic revenue trends and customer growth</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
          <Button variant="outline" size="sm" className="w-full sm:w-auto bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-violet-50 hover:border-violet-200 text-gray-700 font-medium transition-all duration-200">
            <Calendar className="mr-2 h-4 w-4" />
            <span>Last 12 months</span>
          </Button>
          <Button variant="outline" size="sm" className="w-full sm:w-auto bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-violet-50 hover:border-violet-200 text-gray-700 font-medium transition-all duration-200">
            <Download className="mr-2 h-4 w-4" />
            <span>Export Report</span>
          </Button>
        </div>
      </div>

      {/* Summary Cards - Responsive grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center space-x-3">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-muted-foreground">Avg Monthly Growth</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600">6.8%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-muted-foreground">Total Revenue (6 months)</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold">kr 4,546,000</p>
            </div>
          </CardContent>
        </Card>
        <Card className="sm:col-span-2 lg:col-span-1">
          <CardContent className="p-4 sm:p-6">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-muted-foreground">Customer Growth</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold">+86 customers</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Growth Chart - Mobile optimized */}
      <Card>
        <CardHeader className="pb-4 sm:pb-6">
          <CardTitle className="text-lg sm:text-xl">MRR History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] sm:h-[300px] lg:h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockMRRData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="month" 
                  stroke="#6b7280" 
                  fontSize={10}
                  tick={{ fontSize: 10 }}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  stroke="#6b7280"
                  tickFormatter={(value) => safeFormatCurrency(value)}
                  fontSize={10}
                  tick={{ fontSize: 10 }}
                  width={60}
                />
                <Tooltip 
                  formatter={(value: number) => [safeFormatCurrency(value), 'MRR']}
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="mrr" 
                  stroke="#3b82f6" 
                  fill="#3b82f6" 
                  fillOpacity={0.1}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Secondary Charts - Responsive layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg sm:text-xl">Monthly Growth Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] sm:h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyGrowthData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="month" 
                    stroke="#6b7280" 
                    fontSize={10}
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis 
                    stroke="#6b7280" 
                    fontSize={10}
                    tick={{ fontSize: 10 }}
                    width={40}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`${value}%`, 'Growth']}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }} 
                  />
                  <Bar dataKey="growth" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg sm:text-xl">Customer Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] sm:h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={customerGrowthData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="month" 
                    stroke="#6b7280" 
                    fontSize={10}
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis 
                    stroke="#6b7280" 
                    fontSize={10}
                    tick={{ fontSize: 10 }}
                    width={50}
                  />
                  <Tooltip 
                    formatter={(value: number) => [value, 'Customers']}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="customers" 
                    stroke="#f59e0b" 
                    strokeWidth={3}
                    dot={{ fill: '#f59e0b', r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Breakdown Table - Fully responsive */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg sm:text-xl">Monthly Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Mobile Card View */}
          <div className="lg:hidden space-y-3">
            {mockMRRData.slice().reverse().map((row) => (
              <div key={row.month} className="p-3 sm:p-4 border rounded-lg space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-sm sm:text-base">{row.month || 'N/A'}</span>
                  <span className="text-green-600 text-sm sm:text-base font-medium">+{(row.growth || 0).toFixed(1)}%</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground block text-xs">MRR:</span>
                    <div className="font-medium text-sm sm:text-base">{safeFormatCurrency(row.mrr)}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-xs">Customers:</span>
                    <div className="font-medium text-sm sm:text-base">{safeToLocaleString(row.customers)}</div>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground block text-xs">Avg per Customer:</span>
                    <div className="font-medium text-sm sm:text-base">
                      {safeFormatCurrency(row.customers > 0 ? row.mrr / row.customers : 0)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 text-sm font-medium text-muted-foreground">Month</th>
                  <th className="text-right py-3 text-sm font-medium text-muted-foreground">MRR</th>
                  <th className="text-right py-3 text-sm font-medium text-muted-foreground">Growth</th>
                  <th className="text-right py-3 text-sm font-medium text-muted-foreground">Customers</th>
                  <th className="text-right py-3 text-sm font-medium text-muted-foreground">Avg per Customer</th>
                </tr>
              </thead>
              <tbody>
                {mockMRRData.slice().reverse().map((row) => (
                  <tr key={row.month} className="border-b">
                    <td className="py-3 text-sm">{row.month || 'N/A'}</td>
                    <td className="py-3 text-sm text-right font-medium">
                      {safeFormatCurrency(row.mrr)}
                    </td>
                    <td className="py-3 text-sm text-right text-green-600 font-medium">
                      +{(row.growth || 0).toFixed(1)}%
                    </td>
                    <td className="py-3 text-sm text-right">{safeToLocaleString(row.customers)}</td>
                    <td className="py-3 text-sm text-right">
                      {safeFormatCurrency(row.customers > 0 ? row.mrr / row.customers : 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}