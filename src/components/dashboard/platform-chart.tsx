import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts'
import { PlatformBreakdown } from '../../lib/types'
import { Currency } from '../../lib/types'
// import { formatCurrency as formatCurrencyService } from '../../lib/currency-service'

// Inline formatCurrency for Platform chart
const formatCurrencyService = (amount: number, currency: string): string => {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    const symbols = { DKK: 'kr', EUR: '€', USD: '$' };
    const symbol = symbols[currency as keyof typeof symbols] || currency;
    return `${symbol}${Math.round(amount).toLocaleString()}`;
  }
};

interface PlatformChartProps {
  data: PlatformBreakdown[]
  currency?: Currency
}

export function PlatformChart({ data, currency = 'DKK' }: PlatformChartProps) {
  const formatCurrency = (value: number) => {
    return formatCurrencyService(value, currency)
  }

  // Calculate total revenue
  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0)
  const hasData = totalRevenue > 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center justify-between'>
          <span>Revenue by Platform</span>
          {hasData && (
            <span className='text-sm text-muted-foreground'>
              Total: {formatCurrency(totalRevenue)}
            </span>
          )}
        </CardTitle>
        {hasData && (
          <p className='text-sm text-muted-foreground mt-2'>
            Revenue distribution across {data.length} connected platform
            {data.length !== 1 ? 's' : ''}
          </p>
        )}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width='100%' height={300}>
          <PieChart>
            <Pie
              data={data}
              cx='50%'
              cy='50%'
              innerRadius={60}
              outerRadius={100}
              dataKey='revenue'
              nameKey='platform'
              label={({ platform, percentage }) =>
                `${platform} ${percentage.toFixed(1)}%`
              }
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number, name: string, props: any) => {
                const percentage =
                  totalRevenue > 0
                    ? ((value / totalRevenue) * 100).toFixed(1)
                    : '0'
                return [
                  formatCurrency(value),
                  'Revenue',
                  `${percentage}% of total`,
                ]
              }}
              labelFormatter={(label: string) => `${label} Platform`}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        <div className='mt-4 space-y-3'>
          {data.map((item) => {
            const percentage =
              totalRevenue > 0
                ? ((item.revenue / totalRevenue) * 100).toFixed(1)
                : '0'
            return (
              <div
                key={item.platform}
                className='flex items-center justify-between p-3 rounded-lg border bg-gray-50/50 hover:bg-gray-100/50 transition-colors'
              >
                <div className='flex items-center'>
                  <div
                    className='w-4 h-4 rounded-full mr-3 border-2 border-white shadow-sm'
                    style={{ backgroundColor: item.color }}
                  />
                  <div>
                    <span className='font-medium'>{item.platform}</span>
                    <div className='text-xs text-muted-foreground'>
                      {item.customers} customers
                    </div>
                  </div>
                </div>
                <div className='text-right'>
                  <div className='font-medium'>
                    {formatCurrency(item.revenue)}
                  </div>
                  <div className='text-xs text-muted-foreground'>
                    {percentage}% of total
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
