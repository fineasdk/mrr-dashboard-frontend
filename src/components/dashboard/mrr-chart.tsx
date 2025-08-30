import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { MRRData } from '../../lib/types'
import { Currency } from '../../lib/types'

interface MRRChartProps {
  data: MRRData[]
  currency?: Currency
}

export function MRRChart({ data, currency = 'DKK' }: MRRChartProps) {
  const formatCurrency = (value: number) => {
    const currencyMap: Record<Currency, string> = {
      DKK: 'DKK',
      EUR: 'EUR',
      USD: 'USD',
    }

    return new Intl.NumberFormat('da-DK', {
      style: 'currency',
      currency: currencyMap[currency],
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  // Transform data to ensure proper format
  const chartData = data.map((item) => ({
    ...item,
    month: item.month || item.date, // Support both month and date properties
    mrr: item.mrr || item.value, // Support both mrr and value properties
    displayMonth: formatMonthLabel(item.month || item.date), // Format for display
  }))

  function formatMonthLabel(dateStr: string): string {
    try {
      const [year, month] = dateStr.split('-')
      const date = new Date(parseInt(year), parseInt(month) - 1)
      return date.toLocaleDateString('en-US', {
        month: 'short',
        year: '2-digit',
      })
    } catch {
      return dateStr
    }
  }

  // Check if data is flat (all values are the same)
  const isFlat =
    chartData.length > 1 &&
    chartData.every((item) => Math.abs(item.mrr - chartData[0].mrr) < 0.01)

  // For flat data, we'll add some visual improvements
  const minValue = Math.min(...chartData.map((d) => d.mrr))
  const maxValue = Math.max(...chartData.map((d) => d.mrr))
  const padding = maxValue * 0.1 // 10% padding
  const yAxisMin = isFlat ? Math.max(0, minValue - padding) : undefined
  const yAxisMax = isFlat ? maxValue + padding : undefined

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center justify-between'>
          <span>Monthly Recurring Revenue Trend</span>
          {isFlat && (
            <span className='text-sm text-muted-foreground bg-blue-50 px-2 py-1 rounded'>
              Consistent MRR
            </span>
          )}
        </CardTitle>
        {isFlat && (
          <p className='text-sm text-muted-foreground mt-2'>
            Your MRR has been stable at {formatCurrency(chartData[0]?.mrr || 0)}{' '}
            across all months
          </p>
        )}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width='100%' height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray='3 3' stroke='#f0f0f0' />
            <XAxis
              dataKey='displayMonth'
              stroke='#6b7280'
              tick={{ fontSize: 11 }}
              angle={-45}
              textAnchor='end'
              height={80}
            />
            <YAxis
              stroke='#6b7280'
              tick={{ fontSize: 12 }}
              tickFormatter={formatCurrency}
              domain={
                yAxisMin !== undefined ? [yAxisMin, yAxisMax] : ['auto', 'auto']
              }
            />
            <Tooltip
              formatter={(value: number, name: string, props: any) => [
                formatCurrency(value),
                'MRR',
                props.payload?.customers
                  ? `${props.payload.customers} customers`
                  : '',
              ]}
              labelFormatter={(label: string) => `Month: ${label}`}
              labelStyle={{ color: '#374151' }}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              }}
            />
            <Line
              type='monotone'
              dataKey='mrr'
              stroke={isFlat ? '#10b981' : '#3b82f6'}
              strokeWidth={isFlat ? 4 : 3}
              dot={{
                fill: isFlat ? '#10b981' : '#3b82f6',
                strokeWidth: 2,
                r: isFlat ? 5 : 4,
              }}
              activeDot={{
                r: 7,
                stroke: isFlat ? '#10b981' : '#3b82f6',
                strokeWidth: 2,
                fill: 'white',
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
