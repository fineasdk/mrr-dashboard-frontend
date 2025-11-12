import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Alert, AlertDescription } from '../ui/alert'
import {
  Calendar,
  Download,
  TrendingUp,
  RefreshCw,
  BarChart3,
  Users,
  DollarSign,
  Loader2,
  AlertCircle,
  Plus,
  Link2,
  ArrowUpRight,
} from 'lucide-react'
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
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { formatCurrency } from '../../lib/currency-service'
import { dashboardApi, integrationsApi } from '../../lib/api'
import { CurrencySelector } from '../dashboard/currency-selector'
import { Switch } from '../ui/switch'
import { Currency } from '../../lib/types'

// Platform configuration
const platformConfig = {
  economic: { name: 'E-conomic', icon: '🔗', color: '#3B82F6' },
  shopify: { name: 'Shopify', icon: '🛒', color: '#10B981' },
  stripe: { name: 'Stripe', icon: '💳', color: '#8B5CF6' },
}

const parseIncludeUsage = (value: unknown): boolean => {
  if (typeof value === 'string') {
    return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase())
  }

  return Boolean(value)
}

interface Integration {
  id: number
  platform: string
  platform_name: string
  status: 'pending' | 'active' | 'error' | 'syncing'
  customer_count: number
  revenue: number
  last_sync_at: string | null
}

interface AnalyticsData {
  total_mrr: number
  mrr_growth: number
  customer_growth: number
  platform_breakdown: Array<{
    platform: string
    revenue: number
    customers: number
    percentage: number
  }>
  mrr_trend: Array<{
    date: string
    value: number
    platform_breakdown?: Record<string, number>
  }>
  monthly_growth: Array<{
    month: string
    growth: number
  }>
  customer_trend: Array<{
    month: string
    customers: number
  }>
}

export function AnalyticsPage() {
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('DKK')
  const [includeUsage, setIncludeUsage] = useState(false)
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [dateRange, setDateRange] = useState('last_6_months')
  const [forceUpdate, setForceUpdate] = useState(0)

  const loadAnalyticsData = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const startDate = getDateRangeStart(dateRange)
      const endDate = new Date().toISOString()

      console.log('📅 Analytics API Call:', {
        dateRange,
        startDate,
        endDate,
        granularity: 'monthly',
        currency: selectedCurrency,
        includeUsage,
      })

      const [analyticsResponse, integrationsResponse] = await Promise.all([
        dashboardApi.getAnalytics({
          granularity: 'monthly',
          start_date: startDate,
          end_date: endDate,
          currency: selectedCurrency, // CRITICAL: Pass currency to backend
          include_usage: includeUsage,
        }),
        integrationsApi.getAll({ currency: selectedCurrency }), // CRITICAL: Pass currency to backend
      ])

      if (integrationsResponse.data.success) {
        setIntegrations(integrationsResponse.data.data)
      }

      // Use real analytics data from the API
      if (
        analyticsResponse.data &&
        integrationsResponse.data.success &&
        integrationsResponse.data.data.length > 0
      ) {
        const integrationData = integrationsResponse.data.data

        // Map the real analytics API response
        const analyticsData = analyticsResponse.data

        // Transform MRR trend data
        const mrrTrend =
          analyticsData.mrr_trend?.map((item: any) => ({
            date: item.date,
            value: item.value || item.mrr || 0,
          })) || []

        // Transform customer trend data
        const customerTrend =
          analyticsData.customer_trend?.map((item: any) => ({
            month: item.month || item.date,
            customers: item.customers || item.total_customers || 0,
          })) || []

        // Calculate monthly growth from MRR trend
        const monthlyGrowth = mrrTrend.map((item: any, index: number) => {
          if (index === 0) return { month: item.date, growth: 0 }
          const prevValue = mrrTrend[index - 1]?.value || 0
          const currentValue = item.value || 0
          const growth =
            prevValue > 0 ? ((currentValue - prevValue) / prevValue) * 100 : 0
          return { month: item.date, growth: Math.round(growth * 10) / 10 }
        })

        // Use the LAST data point from time-period-filtered trend for totals
        const lastMRRValue =
          mrrTrend.length > 0 ? mrrTrend[mrrTrend.length - 1]?.value || 0 : 0
        const lastCustomerValue =
          customerTrend.length > 0
            ? customerTrend[customerTrend.length - 1]?.customers || 0
            : 0

        // Backend already returns values in selected currency - NO CONVERSION NEEDED
        const totalMRRInSelectedCurrency = lastMRRValue

        // For growth calculations: Compare first vs last in the time period
        const firstMRRValue = mrrTrend.length > 0 ? mrrTrend[0]?.value || 0 : 0
        const firstCustomerValue =
          customerTrend.length > 0 ? customerTrend[0]?.customers || 0 : 0

        console.log('📊 Analytics Data Calculation:', {
          dateRange,
          startDate,
          endDate,
          selectedCurrency,
          mrrTrendPoints: mrrTrend.length,
          mrrTrendData: mrrTrend,
          firstMRRValue,
          lastMRRValue,
          totalMRRInSelectedCurrency,
          customerTrendPoints: customerTrend.length,
          customerTrendData: customerTrend,
          firstCustomerValue,
          lastCustomerValue,
          rawAnalyticsResponse: analyticsData,
        })

        setAnalyticsData({
          total_mrr: totalMRRInSelectedCurrency, // Backend returns in selected currency
          mrr_growth:
            firstMRRValue > 0 && lastMRRValue > 0
              ? ((lastMRRValue - firstMRRValue) / firstMRRValue) * 100
              : 0,
          customer_growth:
            firstCustomerValue > 0 && lastCustomerValue > 0
              ? ((lastCustomerValue - firstCustomerValue) /
                  firstCustomerValue) *
                100
              : 0,
          platform_breakdown: integrationData.map(
            (integration: Integration) => ({
              platform: integration.platform,
              revenue: integration.revenue || 0, // Backend already returns in selected currency
              customers: integration.customer_count || 0,
              percentage:
                totalMRRInSelectedCurrency > 0
                  ? ((integration.revenue || 0) / totalMRRInSelectedCurrency) *
                    100
                  : 0,
            })
          ),
          mrr_trend: mrrTrend,
          monthly_growth: monthlyGrowth,
          customer_trend: customerTrend,
        })

        const includeUsageFromApi = parseIncludeUsage(analyticsResponse.data?.filters?.include_usage)
        if (
          analyticsResponse.data?.filters?.include_usage !== undefined &&
          includeUsageFromApi !== includeUsage
        ) {
          setIncludeUsage(includeUsageFromApi)
        }
      } else {
        // No integrations connected - set empty data
        setAnalyticsData({
          total_mrr: 0,
          mrr_growth: 0,
          customer_growth: 0,
          platform_breakdown: [],
          mrr_trend: [],
          monthly_growth: [],
          customer_trend: [],
        })
        setError(
          'No integrations connected. Connect your platforms to see analytics data.'
        )
      }
    } catch (err: any) {
      console.error('Failed to load analytics data:', err)
      setError(
        'Failed to load analytics data. Please check your API connection.'
      )
      setAnalyticsData({
        total_mrr: 0,
        mrr_growth: 0,
        customer_growth: 0,
        platform_breakdown: [],
        mrr_trend: [],
        monthly_growth: [],
        customer_trend: [],
      })
    } finally {
      setLoading(false)
    }
  }, [selectedCurrency, dateRange, includeUsage])

  useEffect(() => {
    loadAnalyticsData()
  }, [loadAnalyticsData])

  // Force re-render when currency changes to update computed values
  useEffect(() => {
    console.log('📈 Analytics: Currency changed to:', selectedCurrency)
    setForceUpdate((prev) => prev + 1)
  }, [selectedCurrency])

  // Log when date range changes
  useEffect(() => {
    console.log('📅 Analytics: Date range changed to:', dateRange)
  }, [dateRange])

  const getDateRangeStart = (range: string): string => {
    const now = new Date()
    switch (range) {
      case 'last_3_months':
      case '90d':
        const threeMonthsAgo = new Date(now)
        threeMonthsAgo.setMonth(now.getMonth() - 3)
        return threeMonthsAgo.toISOString()
      case 'last_6_months':
      case '6m':
        const sixMonthsAgo = new Date(now)
        sixMonthsAgo.setMonth(now.getMonth() - 6)
        return sixMonthsAgo.toISOString()
      case 'last_12_months':
      case '1y':
        const oneYearAgo = new Date(now)
        oneYearAgo.setFullYear(now.getFullYear() - 1)
        return oneYearAgo.toISOString()
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
      default:
        // Default to 6 months of historical data
        const defaultStart = new Date(now)
        defaultStart.setMonth(now.getMonth() - 6)
        return defaultStart.toISOString()
    }
  }

  const handleSyncIntegration = async (integrationId: number) => {
    try {
      await integrationsApi.sync(integrationId.toString())
      await loadAnalyticsData()
    } catch (err: any) {
      console.error('Sync failed:', err)
      setError('Sync failed. Please try again.')
    }
  }

  const safeFormatCurrency = (amount: number | undefined): string => {
    if (typeof amount !== 'number' || isNaN(amount))
      return formatCurrency(0, selectedCurrency)
    return formatCurrency(amount, selectedCurrency)
  }

  const safeToLocaleString = (value: number | undefined): string => {
    if (typeof value !== 'number' || isNaN(value)) return '0'
    return value.toLocaleString()
  }

  // Calculate platform breakdown with percentages - backend already returns converted values
  const platformBreakdownWithPercentages =
    analyticsData?.platform_breakdown.map((item) => {
      const config = platformConfig[
        item.platform as keyof typeof platformConfig
      ] || { name: item.platform, icon: '🔗', color: '#6B7280' }

      return {
        ...item,
        revenue: item.revenue, // Backend already returns in selected currency
        name: config.name,
        icon: config.icon,
        color: config.color,
      }
    }) || []

  // Calculate percentages after currency conversion
  const totalConvertedRevenue = platformBreakdownWithPercentages.reduce(
    (sum, p) => sum + p.revenue,
    0
  )
  platformBreakdownWithPercentages.forEach((platform) => {
    platform.percentage =
      totalConvertedRevenue > 0
        ? Math.round((platform.revenue / totalConvertedRevenue) * 100 * 10) / 10
        : 0
  })

  const connectedIntegrations = integrations.filter(
    (i) => i.status === 'active'
  )

  return (
    <div className='p-3 sm:p-4 md:p-6 space-y-6 sm:space-y-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen'>
      {/* Responsive Header */}
      <div className='flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 gap-4'>
        <div>
          <h1 className='text-xl sm:text-2xl md:text-3xl font-bold text-foreground'>
            Analytics
          </h1>
          <p className='text-muted-foreground text-sm sm:text-base'>
            Deep insights into your revenue performance across all platforms
          </p>
        </div>
        <div className='flex flex-col sm:flex-row items-stretch sm:items-center gap-3'>
          <div className='flex w-full items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm sm:w-auto'>
            <Switch
              id='analytics-include-usage-switch'
              checked={includeUsage}
              onCheckedChange={(checked) => setIncludeUsage(Boolean(checked))}
            />
            <label
              htmlFor='analytics-include-usage-switch'
              className='text-sm text-gray-600 whitespace-nowrap'
            >
              Include usage-based payouts
            </label>
          </div>
          <CurrencySelector
            currentCurrency={selectedCurrency}
            onCurrencyChange={setSelectedCurrency}
          />
          <select
            value={dateRange}
            onChange={(e) => {
              console.log('📅 Time period changed to:', e.target.value)
              setDateRange(e.target.value)
            }}
            className='px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
          >
            <option value='last_3_months'>Last 3 Months</option>
            <option value='last_6_months'>Last 6 Months</option>
            <option value='last_12_months'>Last 12 Months</option>
          </select>
          <Button variant='outline' size='sm' onClick={loadAnalyticsData}>
            <RefreshCw className='mr-2 h-4 w-4' />
            Refresh
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert className='border-orange-200 bg-orange-50'>
          <AlertCircle className='h-4 w-4 text-orange-600' />
          <AlertDescription className='text-orange-700'>
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <div className='flex items-center justify-center py-12'>
          <Loader2 className='h-8 w-8 animate-spin mr-2' />
          <span>Loading analytics...</span>
        </div>
      )}

      {!loading && (
        <>
          {/* No Integrations State */}
          {integrations.length === 0 && (
            <div className='text-center py-16'>
              <div className='max-w-md mx-auto'>
                <div className='mb-6'>
                  <div className='w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                    <BarChart3 className='w-8 h-8 text-blue-600' />
                  </div>
                  <h3 className='text-xl font-semibold text-gray-900 mb-2'>
                    No Analytics Data
                  </h3>
                  <p className='text-gray-600 mb-6'>
                    Connect your integrations to unlock live analytics and revenue insights powered by your actual business data.
                  </p>
                </div>

                <div className='space-y-3'>
                  <Button
                    className='w-full btn-primary py-4'
                    onClick={() => {
                      // Navigate to integrations page
                      if (typeof window !== 'undefined') {
                        window.location.href = '/integrations'
                      }
                    }}
                  >
                    <Plus className='mr-2 h-4 w-4' />
                    Connect Your First Integration
                  </Button>

                  <div className='grid grid-cols-2 gap-4 mt-6'>
                    <div className='card-elevated p-4 text-center interactive'>
                      <div className='text-3xl mb-3'>💳</div>
                      <p className='font-semibold text-gray-900 mb-1'>Stripe</p>
                      <p className='text-xs text-gray-500'>Payment data</p>
                    </div>
                    <div className='card-elevated p-4 text-center interactive'>
                      <div className='text-3xl mb-3'>🔗</div>
                      <p className='font-semibold text-gray-900 mb-1'>E-conomic</p>
                      <p className='text-xs text-gray-500'>Accounting data</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Analytics Content - Only show if integrations exist */}
          {integrations.length > 0 && (
            <>
              {/* Integration Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center space-x-2'>
                    <BarChart3 className='h-5 w-5' />
                    <span>Platform Performance</span>
                    <Badge variant='secondary'>
                      {connectedIntegrations.length} Active
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                    {integrations.map((integration) => {
                      const config = platformConfig[
                        integration.platform as keyof typeof platformConfig
                      ] || {
                        name: integration.platform_name,
                        icon: '🔗',
                        color: '#6B7280',
                      }

                      return (
                        <div
                          key={integration.id}
                          className='p-4 rounded-lg border bg-white'
                        >
                          <div className='flex items-center justify-between mb-3'>
                            <div className='flex items-center space-x-2'>
                              <span className='text-xl'>{config.icon}</span>
                              <div>
                                <p className='font-medium text-sm'>
                                  {config.name}
                                </p>
                                <Badge
                                  variant={
                                    integration.status === 'active'
                                      ? 'default'
                                      : 'secondary'
                                  }
                                  className={`text-xs ${
                                    integration.status === 'active'
                                      ? 'bg-green-100 text-green-800'
                                      : integration.status === 'error'
                                      ? 'bg-red-100 text-red-800'
                                      : integration.status === 'syncing'
                                      ? 'bg-blue-100 text-blue-800'
                                      : 'bg-gray-100 text-gray-800'
                                  }`}
                                >
                                  {integration.status === 'active'
                                    ? 'Connected'
                                    : integration.status}
                                </Badge>
                              </div>
                            </div>
                            {integration.status === 'active' && (
                              <Button
                                size='sm'
                                variant='outline'
                                onClick={() =>
                                  handleSyncIntegration(integration.id)
                                }
                                className='h-8 w-8 p-0'
                              >
                                <RefreshCw className='h-3 w-3' />
                              </Button>
                            )}
                          </div>
                          <div className='space-y-2'>
                            <div className='flex justify-between items-center'>
                              <span className='text-sm text-muted-foreground'>
                                Revenue:
                              </span>
                              <span className='font-semibold'>
                                {safeFormatCurrency(integration.revenue || 0)}
                              </span>
                            </div>
                            <div className='flex justify-between items-center'>
                              <span className='text-sm text-muted-foreground'>
                                Customers:
                              </span>
                              <span className='font-semibold'>
                                {integration.customer_count || 0}
                              </span>
                            </div>
                            {integration.last_sync_at && (
                              <div className='flex justify-between items-center'>
                                <span className='text-sm text-muted-foreground'>
                                  Last Sync:
                                </span>
                                <span className='text-sm'>
                                  {new Date(
                                    integration.last_sync_at
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Enhanced Key Metrics */}
              {/* <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 animate-slide-up'>
                <div className='card-elevated p-6'>
                  <div className='flex items-center justify-between mb-4'>
                    <div className='p-3 rounded-md bg-gray-600 shadow-sm'>
                      <DollarSign className='h-6 w-6 text-white' />
                    </div>
                    {analyticsData?.mrr_growth && analyticsData.mrr_growth > 0 && (
                      <div className='flex items-center text-sm font-medium text-gray-600'>
                        <ArrowUpRight className='w-4 h-4' />
                      </div>
                    )}
                  </div>
                  <div className='space-y-2'>
                    <p className='text-sm font-medium text-slate-600'>Total MRR</p>
                    <p className='text-2xl sm:text-3xl font-bold text-slate-900'>
                      {safeFormatCurrency(
                        analyticsData?.total_mrr ||
                        integrations.reduce(
                          (sum, int) => sum + (int.revenue || 0),
                          0
                        )
                      )}
                    </p>
                    <p className='text-xs font-medium text-slate-500'>
                      {analyticsData?.mrr_growth
                        ? `+${analyticsData.mrr_growth.toFixed(1)}% from last period`
                        : 'Current total from integrations'}
                    </p>
                  </div>
                </div>

                <div className='card-elevated p-6'>
                  <div className='flex items-center justify-between mb-4'>
                    <div className='p-3 rounded-md bg-gray-600 shadow-sm'>
                      <Users className='h-6 w-6 text-white' />
                    </div>
                    {analyticsData?.customer_growth && analyticsData.customer_growth > 0 && (
                      <div className='flex items-center text-sm font-medium text-gray-600'>
                        <ArrowUpRight className='w-4 h-4' />
                      </div>
                    )}
                  </div>
                  <div className='space-y-2'>
                    <p className='text-sm font-medium text-slate-600'>Total Customers</p>
                    <p className='text-2xl sm:text-3xl font-bold text-slate-900'>
                      {safeToLocaleString(
                        analyticsData?.customer_trend &&
                          analyticsData.customer_trend.length > 0
                          ? analyticsData.customer_trend[
                              analyticsData.customer_trend.length - 1
                            ]?.customers || 0
                          : integrations.reduce(
                              (sum, int) => sum + (int.customer_count || 0),
                              0
                            )
                      )}
                    </p>
                    <p className='text-xs font-medium text-slate-500'>
                      {analyticsData?.customer_growth
                        ? `+${analyticsData.customer_growth.toFixed(1)}% growth`
                        : 'Across all platforms'}
                    </p>
                  </div>
                </div>

                <div className='card-elevated p-6'>
                  <div className='flex items-center justify-between mb-4'>
                    <div className='p-3 rounded-md bg-gray-600 shadow-sm'>
                      <TrendingUp className='h-6 w-6 text-white' />
                    </div>
                  </div>
                  <div className='space-y-2'>
                    <p className='text-sm font-medium text-slate-600'>Avg per Customer</p>
                    <p className='text-2xl sm:text-3xl font-bold text-slate-900'>
                      {safeFormatCurrency(
                        analyticsData &&
                          analyticsData.total_mrr &&
                          analyticsData.customer_trend &&
                          analyticsData.customer_trend.length > 0
                          ? analyticsData.total_mrr /
                              Math.max(
                                1,
                                analyticsData.customer_trend[
                                  analyticsData.customer_trend.length - 1
                                ]?.customers || 1
                              )
                          : 0
                      )}
                    </p>
                    <p className='text-xs font-medium text-slate-500'>
                      Monthly average revenue per customer
                    </p>
                  </div>
                </div>
              </div> */}

              {/* Charts Grid */}
              <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                {/* MRR Growth Trend */}
                <Card>
                  <CardHeader>
                    <CardTitle className='flex items-center justify-between'>
                      <span>MRR Growth Trend</span>
                      <Badge variant='outline' className='text-xs'>
                        {dateRange.replace('last_', '').replace('_', ' ')}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {analyticsData?.mrr_trend &&
                    analyticsData.mrr_trend.length > 0 ? (
                      <ResponsiveContainer width='100%' height={300}>
                        <AreaChart data={analyticsData.mrr_trend}>
                          <CartesianGrid strokeDasharray='3 3' />
                          <XAxis
                            dataKey='date'
                            fontSize={12}
                            tickFormatter={(value) => {
                              if (
                                typeof value === 'string' &&
                                value.includes('-')
                              ) {
                                const [year, month] = value.split('-')
                                const monthNames = [
                                  'Jan',
                                  'Feb',
                                  'Mar',
                                  'Apr',
                                  'May',
                                  'Jun',
                                  'Jul',
                                  'Aug',
                                  'Sep',
                                  'Oct',
                                  'Nov',
                                  'Dec',
                                ]
                                return (
                                  monthNames[parseInt(month) - 1] ||
                                  value.slice(0, 3)
                                )
                              }
                              return value.slice(0, 3)
                            }}
                          />
                          <YAxis
                            fontSize={12}
                            tickFormatter={(value) =>
                              `${(value / 1000).toFixed(0)}k`
                            }
                          />
                          <Tooltip
                            formatter={(value: any) => [
                              safeFormatCurrency(value),
                              'MRR',
                            ]}
                            labelFormatter={(label) => `Month: ${label}`}
                          />
                          <Area
                            type='monotone'
                            dataKey='value'
                            stroke='#3B82F6'
                            fill='#3B82F6'
                            fillOpacity={0.1}
                            strokeWidth={2}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className='text-center py-12'>
                        <TrendingUp className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                        <p className='text-muted-foreground'>
                          No historical MRR data available
                        </p>
                        <p className='text-sm text-muted-foreground mt-1'>
                          Sync more data or wait for historical tracking
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Platform Revenue Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue by Platform</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {platformBreakdownWithPercentages.length > 0 ? (
                      <div className='space-y-4'>
                        <ResponsiveContainer width='100%' height={200}>
                          <PieChart>
                            <Pie
                              data={platformBreakdownWithPercentages}
                              cx='50%'
                              cy='50%'
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey='revenue'
                            >
                              {platformBreakdownWithPercentages.map(
                                (entry, index) => (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={entry.color}
                                  />
                                )
                              )}
                            </Pie>
                            <Tooltip
                              formatter={(value: any) => [
                                safeFormatCurrency(value),
                                'Revenue',
                              ]}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className='space-y-2'>
                          {platformBreakdownWithPercentages.map(
                            (platform, index) => (
                              <div
                                key={index}
                                className='flex items-center justify-between'
                              >
                                <div className='flex items-center space-x-2'>
                                  <div
                                    className='w-3 h-3 rounded-full'
                                    style={{ backgroundColor: platform.color }}
                                  ></div>
                                  <span className='text-sm font-medium'>
                                    {platform.icon} {platform.name}
                                  </span>
                                </div>
                                <div className='text-right'>
                                  <p className='text-sm font-semibold'>
                                    {safeFormatCurrency(platform.revenue)}
                                  </p>
                                  <p className='text-xs text-muted-foreground'>
                                    {platform.percentage}%
                                  </p>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className='text-center py-8'>
                        <p className='text-muted-foreground'>
                          No platform data available
                        </p>
                        <p className='text-sm text-muted-foreground mt-1'>
                          Connect integrations to see revenue breakdown
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Monthly Growth Rate */}
                <Card>
                  <CardHeader>
                    <CardTitle className='flex items-center justify-between'>
                      <span>Monthly Growth Rate</span>
                      <Badge variant='outline' className='text-xs'>
                        {dateRange.replace('last_', '').replace('_', ' ')}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {analyticsData?.monthly_growth &&
                    analyticsData.monthly_growth.length > 0 ? (
                      <ResponsiveContainer width='100%' height={300}>
                        <BarChart data={analyticsData.monthly_growth}>
                          <CartesianGrid strokeDasharray='3 3' />
                          <XAxis
                            dataKey='month'
                            fontSize={12}
                            tickFormatter={(value) => {
                              if (
                                typeof value === 'string' &&
                                value.includes('-')
                              ) {
                                const [year, month] = value.split('-')
                                const monthNames = [
                                  'Jan',
                                  'Feb',
                                  'Mar',
                                  'Apr',
                                  'May',
                                  'Jun',
                                  'Jul',
                                  'Aug',
                                  'Sep',
                                  'Oct',
                                  'Nov',
                                  'Dec',
                                ]
                                return (
                                  monthNames[parseInt(month) - 1] ||
                                  value.slice(0, 3)
                                )
                              }
                              return value.slice(0, 3)
                            }}
                          />
                          <YAxis
                            fontSize={12}
                            tickFormatter={(value) => `${value}%`}
                          />
                          <Tooltip
                            formatter={(value: any) => [`${value}%`, 'Growth']}
                          />
                          <Bar
                            dataKey='growth'
                            fill='#10B981'
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className='text-center py-12'>
                        <BarChart3 className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                        <p className='text-muted-foreground'>
                          No growth data available
                        </p>
                        <p className='text-sm text-muted-foreground mt-1'>
                          Historical data needed to calculate growth rates
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Customer Growth */}
                <Card>
                  <CardHeader>
                    <CardTitle className='flex items-center justify-between'>
                      <span>Customer Growth</span>
                      <Badge variant='outline' className='text-xs'>
                        {dateRange.replace('last_', '').replace('_', ' ')}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {analyticsData?.customer_trend &&
                    analyticsData.customer_trend.length > 0 ? (
                      <ResponsiveContainer width='100%' height={300}>
                        <LineChart data={analyticsData.customer_trend}>
                          <CartesianGrid strokeDasharray='3 3' />
                          <XAxis
                            dataKey='month'
                            fontSize={12}
                            tickFormatter={(value) => {
                              if (
                                typeof value === 'string' &&
                                value.includes('-')
                              ) {
                                const [year, month] = value.split('-')
                                const monthNames = [
                                  'Jan',
                                  'Feb',
                                  'Mar',
                                  'Apr',
                                  'May',
                                  'Jun',
                                  'Jul',
                                  'Aug',
                                  'Sep',
                                  'Oct',
                                  'Nov',
                                  'Dec',
                                ]
                                return (
                                  monthNames[parseInt(month) - 1] ||
                                  value.slice(0, 3)
                                )
                              }
                              return value.slice(0, 3)
                            }}
                          />
                          <YAxis fontSize={12} />
                          <Tooltip
                            formatter={(value: any) => [value, 'Customers']}
                          />
                          <Line
                            type='monotone'
                            dataKey='customers'
                            stroke='#8B5CF6'
                            strokeWidth={3}
                            dot={{ fill: '#8B5CF6', r: 6 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className='text-center py-12'>
                        <Users className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                        <p className='text-muted-foreground'>
                          No customer trend data available
                        </p>
                        <p className='text-sm text-muted-foreground mt-1'>
                          Need historical customer data to show trends
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Platform Comparison Table */}
              {platformBreakdownWithPercentages.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Platform Performance Comparison</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className='overflow-x-auto'>
                      <table className='w-full'>
                        <thead>
                          <tr className='border-b'>
                            <th className='text-left py-2'>Platform</th>
                            <th className='text-right py-2'>Revenue</th>
                            <th className='text-right py-2'>Customers</th>
                            <th className='text-right py-2'>
                              Avg per Customer
                            </th>
                            <th className='text-right py-2'>Share</th>
                          </tr>
                        </thead>
                        <tbody>
                          {platformBreakdownWithPercentages
                            .sort((a, b) => b.revenue - a.revenue)
                            .map((platform, index) => (
                              <tr
                                key={index}
                                className='border-b last:border-b-0'
                              >
                                <td className='py-3'>
                                  <div className='flex items-center space-x-2'>
                                    <span>{platform.icon}</span>
                                    <span className='font-medium'>
                                      {platform.name}
                                    </span>
                                  </div>
                                </td>
                                <td className='text-right py-3 font-semibold'>
                                  {safeFormatCurrency(platform.revenue)}
                                </td>
                                <td className='text-right py-3'>
                                  {safeToLocaleString(platform.customers)}
                                </td>
                                <td className='text-right py-3'>
                                  {safeFormatCurrency(
                                    platform.customers > 0
                                      ? platform.revenue / platform.customers
                                      : 0
                                  )}
                                </td>
                                <td className='text-right py-3'>
                                  <Badge variant='secondary'>
                                    {platform.percentage}%
                                  </Badge>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}
