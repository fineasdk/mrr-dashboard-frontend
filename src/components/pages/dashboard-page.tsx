import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  RefreshCw,
  Download,
  TrendingUp,
  Users,
  CreditCard,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  AlertCircle,
  Link2,
  Settings,
  Plus,
  DollarSign,
  Info,
} from 'lucide-react'
// import { MetricCard } from '../dashboard/metric-card';
import { MRRChart } from '../dashboard/mrr-chart'
import { PlatformChart } from '../dashboard/platform-chart'
import { CurrencySelector } from '../dashboard/currency-selector'
import { MonthlyRevenueTable } from '../dashboard/monthly-revenue-table'
import { Button } from '../ui/button'
import { Alert, AlertDescription } from '../ui/alert'
import { Badge } from '../ui/badge'
import { Switch } from '../ui/switch'
import { Currency } from '../../lib/types'
import { dashboardApi, integrationsApi } from '../../lib/api'
import { formatCurrency } from '../../lib/currency-service'
import { config } from '../../lib/config'

const metricIcons = [TrendingUp, Users, CreditCard, Activity]

// Platform configuration for consistent display
const platformConfig = {
  economic: { name: 'E-conomic', icon: '🔗', color: 'blue' },
  shopify: { name: 'Shopify', icon: '🛒', color: 'green' },
  stripe: { name: 'Stripe', icon: '💳', color: 'purple' },
}

const parseIncludeUsage = (value: unknown): boolean => {
  if (typeof value === 'string') {
    return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase())
  }

  return Boolean(value)
}

interface Metrics {
  total_mrr: {
    value: number
    change: number
    change_percentage: number
    formatted: string
  }
  gross_subscription_mrr?: {
    value: number
    currency: string
    formatted: string
  }
  net_subscription_mrr?: {
    value: number
    currency: string
    formatted: string
  }
  total_customers: {
    value: number
    change: number
    change_percentage: number
  }
  arr: {
    value: number
    change_percentage: number
    formatted: string
  }
  arpc: {
    value: number
    formatted: string
  }
}

interface Integration {
  id: number
  platform: string
  platform_name: string
  status: 'pending' | 'active' | 'error' | 'syncing' | 'inactive' | 'disconnected'
  last_sync_at: string | null
  customer_count: number
  revenue: number
  gross_revenue?: number
  currency?: string
  original_currency?: string
  original_revenue?: number
  primary_currency?: string
  using_fallback?: boolean
  currency_breakdown?: Record<string, {
    original_total: number
    converted_total: number
    exchange_rate: number | null
    invoice_count?: number
  }>
  gross_currency_breakdown?: Record<string, {
    original_total: number
    converted_total: number
    exchange_rate: number | null
    invoice_count?: number
  }>
}

interface DashboardPageProps {
  onNavigateToIntegrations?: () => void;
}

export function DashboardPage({ onNavigateToIntegrations }: DashboardPageProps = {}) {
  const router = useRouter()
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('DKK')
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })
  const [includeUsage, setIncludeUsage] = useState(false)
  const [mrrBasis, setMrrBasis] = useState<'net' | 'gross'>('gross')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [mrrTrend, setMrrTrend] = useState<
    Array<{ date: string; value: number }>
  >([])
  const [isAutoSyncing, setIsAutoSyncing] = useState(false)
  const [autoSyncPlatforms, setAutoSyncPlatforms] = useState<string[]>([])

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true)
    setError('')

    // Check if user is authenticated
    const token = localStorage.getItem('auth_token')
    console.log('🔑 Auth token check:', token ? 'Token found' : 'No token')
    if (!token) {
      setError('No authentication token found. Please log in.')
      setIsLoading(false)
      return
    }

    try {
      console.log('🔍 Loading dashboard data...')
      console.log('🔍 API Base URL:', config.apiUrl)
      console.log('🔍 Selected Currency:', selectedCurrency)
      console.log('🔍 Auth Token:', token ? token.substring(0, 20) + '...' : 'No token')
      
      const metricsResponse = await dashboardApi.getMetrics({
        currency: selectedCurrency,
        include_usage: includeUsage,
        month: selectedMonth && selectedMonth.length === 7 ? selectedMonth : undefined,
        mrr_basis: mrrBasis,
      })

      console.log('📊 Metrics response status:', metricsResponse.status)
      console.log('📊 Metrics response data:', metricsResponse.data)

      if (metricsResponse.data.success) {
        const data = metricsResponse.data.data
        console.log('✅ Setting metrics:', data.metrics)
        setMetrics(data.metrics)
        setMrrTrend(data.mrr_trend || [])

        const responseMonth = data.filters?.month as string | undefined
        if (responseMonth && responseMonth.length === 7 && responseMonth !== selectedMonth) {
          setSelectedMonth(responseMonth)
        }

        const responseBasis = (data.filters?.mrr_basis as 'net' | 'gross' | undefined) ?? mrrBasis
        if (responseBasis !== mrrBasis) {
          setMrrBasis(responseBasis)
        }

        const includeUsageFromApi = parseIncludeUsage(data.filters?.include_usage)
        if (
          data.filters?.include_usage !== undefined &&
          includeUsageFromApi !== includeUsage
        ) {
          setIncludeUsage(includeUsageFromApi)
        }

        // Handle auto-sync status
        if (data.sync_status?.syncing && data.sync_status?.auto_synced_platforms?.length > 0) {
          setIsAutoSyncing(true)
          setAutoSyncPlatforms(data.sync_status.auto_synced_platforms)
          console.log('🔄 Auto-sync triggered for:', data.sync_status.auto_synced_platforms)

          // Auto-refresh after 30 seconds to pick up synced data
          setTimeout(() => {
            setIsAutoSyncing(false)
            setAutoSyncPlatforms([])
            // Reload data to get fresh synced data
            loadDashboardData()
          }, 30000)
        }
      } else {
        console.log('❌ Metrics response not successful:', metricsResponse.data)
      }

      let mergedIntegrations: Integration[] = []

      if (metricsResponse.data.success && metricsResponse.data.data.integration_status) {
        const integrationStatus = Object.values(
          metricsResponse.data.data.integration_status
        ).map((integration: any, index: number) => ({
          id: integration.id ?? -(index + 1),
          platform: integration.platform,
          platform_name:
            integration.platform === 'economic'
              ? 'E-conomic'
              : integration.platform === 'stripe'
              ? 'Stripe'
              : 'Shopify',
          status: integration.status ?? 'inactive',
          last_sync_at: integration.last_sync ?? null,
          customer_count: integration.customer_count ?? 0,
          revenue: integration.revenue ?? 0,
          gross_revenue: integration.gross_revenue ?? integration.revenue ?? 0,
          currency: integration.currency,
          original_currency: integration.original_currency,
          original_revenue: integration.original_revenue,
          primary_currency: integration.primary_currency,
          using_fallback: integration.using_fallback,
          currency_breakdown: integration.currency_breakdown,
          gross_currency_breakdown: integration.gross_currency_breakdown,
        }))

        mergedIntegrations = integrationStatus
        setIntegrations(integrationStatus)
      }

      // Fetch full integration details asynchronously to avoid blocking dashboard render
      integrationsApi
        .getAll({ currency: selectedCurrency })
        .then((integrationResponse) => {
          if (integrationResponse.data.success) {
            const fetched = Array.isArray(integrationResponse.data.data)
              ? integrationResponse.data.data
              : []

            if (fetched.length) {
              const fetchedByPlatform = new Map(
                fetched.map((entry: any) => [entry.platform ?? entry.platform_name ?? entry.id, entry])
              )

              const merged = mergedIntegrations.map((integration) => {
                const fetchedEntry = fetchedByPlatform.get(integration.platform)
                  ?? fetchedByPlatform.get(integration.platform_name ?? integration.platform)

                if (!fetchedEntry) {
                  return integration
                }

                return {
                  ...integration,
                  ...(typeof fetchedEntry === 'object' && fetchedEntry !== null ? {
                    id: (fetchedEntry as { id?: number }).id ?? integration.id,
                    status: (fetchedEntry as { status?: Integration['status'] }).status ?? integration.status,
                    last_sync_at: (fetchedEntry as { last_sync_at?: string | null; last_sync?: string | null }).last_sync_at
                      ?? (fetchedEntry as { last_sync?: string | null }).last_sync
                      ?? integration.last_sync_at,
                    customer_count: (fetchedEntry as { customer_count?: number }).customer_count ?? integration.customer_count,
                  } : {}),
                }
              })

              const additional = fetched.filter((entry: any) => {
                const platformKey = entry?.platform ?? entry?.platform_name ?? entry?.id
                if (!platformKey) {
                  return false
                }

                return !merged.some((integration) => integration.platform === platformKey)
              })

              const normalizedAdditional = additional
                .filter((entry: unknown): entry is Record<string, unknown> => entry !== null && typeof entry === 'object')
                .map((entry: Record<string, unknown>) => {
                  const platform = (entry.platform as string | undefined)
                    ?? (entry.platform_name as string | undefined)
                    ?? 'unknown'

                  return {
                    id: typeof entry.id === 'number' ? entry.id : -Date.now(),
                    platform,
                    platform_name: (entry.platform_name as string | undefined) ?? platform,
                    status: (entry.status as Integration['status']) ?? 'inactive',
                    last_sync_at: (entry.last_sync_at as string | null | undefined)
                      ?? (entry.last_sync as string | null | undefined)
                      ?? null,
                    customer_count: typeof entry.customer_count === 'number' ? entry.customer_count : 0,
                    revenue: typeof entry.revenue === 'number' ? entry.revenue : 0,
                    currency: entry.currency as string | undefined,
                    original_currency: entry.original_currency as string | undefined,
                    original_revenue: typeof entry.original_revenue === 'number' ? entry.original_revenue : undefined,
                    primary_currency: entry.primary_currency as string | undefined,
                    using_fallback: entry.using_fallback as boolean | undefined,
                    currency_breakdown: entry.currency_breakdown as Integration['currency_breakdown'],
                    gross_currency_breakdown: entry.gross_currency_breakdown as Integration['gross_currency_breakdown'],
                    gross_revenue: typeof entry.gross_revenue === 'number' ? entry.gross_revenue : undefined,
                  } satisfies Integration
                })

              setIntegrations([...merged, ...normalizedAdditional])
            } else {
              setIntegrations(mergedIntegrations)
            }
          } else {
            console.warn('Integrations response not successful:', integrationResponse.data)
          }
        })
        .catch((err) => {
          console.warn('Integrations fetch failed:', err)
        })

      if (!mergedIntegrations.length) {
        setError(
          'No integrations connected. Please connect your platforms to start seeing data.'
        )
      }
    } catch (err: any) {
      console.error('Failed to load dashboard data:', err)
      if (err.response?.status === 401) {
        setError('Authentication failed. Please log in again.')
        // Clear invalid token
        localStorage.removeItem('auth_token')
        window.location.href = '/login'
      } else {
        setError(
          'Failed to load dashboard data: ' +
            (err.response?.data?.message || err.message)
        )
      }
    } finally {
      setIsLoading(false)
    }
  }, [selectedCurrency, includeUsage, selectedMonth, mrrBasis])

  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  const handleSyncData = async () => {
    await loadDashboardData()
  }

  const handleSyncIntegration = async (integrationId: number) => {
    try {
      await integrationsApi.sync(integrationId.toString())
      await loadDashboardData() // Refresh data
    } catch (err: any) {
      console.error('Sync failed:', err)
      setError('Sync failed. Please try again.')
    }
  }

  // Create metrics array from real data or fallback to mock data
  const getMetricsData = () => {
    console.log('📈 Getting metrics data, current metrics:', metrics)
    console.log('📈 Selected currency:', selectedCurrency)
    console.log('📈 Integrations data:', integrations)

    // Primary: Use API metrics if available
    const apiMrrValue = metrics?.total_mrr?.value || 0
    const apiCustomersValue = metrics?.total_customers?.value || 0
    const arrValue = metrics?.arr?.value || 0
    const grossMrrValue = metrics?.gross_subscription_mrr?.value ?? null
    const netMrrValue = metrics?.net_subscription_mrr?.value ?? null
    
    // Get change percentages and actual changes
    const mrrChangePercentage = metrics?.total_mrr?.change_percentage ?? null
    const mrrChange = metrics?.total_mrr?.change ?? null
    const customersChangePercentage = metrics?.total_customers?.change_percentage ?? null
    const customersChange = metrics?.total_customers?.change ?? null

    // Fallback: Calculate from integrations data using precise currency breakdowns
    const integrationMrrValue = integrations.reduce((sum, integration) => {
      if (integration.currency_breakdown) {
        const convertedTotal = Object.values(integration.currency_breakdown).reduce(
          (currencySum, entry) => currencySum + (entry?.converted_total ?? 0),
          0
        )
        return sum + convertedTotal
      }
      return sum + (integration.revenue || 0)
    }, 0)

    const integrationGrossValue = integrations.reduce((sum, integration) => {
      const gross = typeof integration.gross_revenue === 'number'
        ? integration.gross_revenue
        : integration.revenue || 0
      return sum + gross
    }, 0)

    const integrationCustomerCount = integrations.reduce(
      (sum, integration) => sum + (integration.customer_count || 0),
      0
    )

    // Use API data when present, otherwise rely on integration aggregation
    let totalMrrValue = apiMrrValue && apiMrrValue > 0
      ? apiMrrValue
      : mrrBasis === 'gross'
        ? integrationGrossValue
        : integrationMrrValue
    if (mrrBasis === 'gross' && grossMrrValue && grossMrrValue > 0) {
      totalMrrValue = grossMrrValue
    }
    const totalCustomersValue =
      apiCustomersValue && apiCustomersValue > 0 ? apiCustomersValue : integrationCustomerCount

    console.log('📈 Metrics comparison:', {
      api: { mrr: apiMrrValue, customers: apiCustomersValue },
      integrationDerived: { mrr: integrationMrrValue, customers: integrationCustomerCount },
      final: { mrr: totalMrrValue, customers: totalCustomersValue },
      changes: { mrrChangePercentage, mrrChange, customersChangePercentage, customersChange }
    })
    
    // Helper function to format change text
    const formatChangeText = (changePercentage: number | null, absoluteChange: number | null, isCustomer: boolean = false) => {
      // Case 1: No data to calculate percentage
      if (changePercentage === null || changePercentage === undefined) {
        return 'No previous data'
      }
      
      // Case 2: Truly no change (both percentage and absolute are 0)
      if (changePercentage === 0 && (!absoluteChange || absoluteChange === 0)) {
        return 'No change from last month'
      }
      
      // Case 3: EDGE CASE - Percentage is 0% but there IS a change
      // This happens when previous month was 0 (can't calculate %, but there is growth)
      if (changePercentage === 0 && absoluteChange && absoluteChange !== 0) {
        const changeText = isCustomer 
          ? `${Math.abs(absoluteChange)} ${Math.abs(absoluteChange) === 1 ? 'customer' : 'customers'}`
          : formatCurrency(Math.abs(absoluteChange), selectedCurrency)
        return `New data (+${changeText})`
      }
      
      // Case 4: Normal percentage with absolute change
      const percentageText = changePercentage > 0 ? `+${changePercentage.toFixed(1)}%` : `${changePercentage.toFixed(1)}%`
      
      if (absoluteChange && absoluteChange !== 0) {
        const changeText = isCustomer 
          ? `${Math.abs(absoluteChange)} ${Math.abs(absoluteChange) === 1 ? 'customer' : 'customers'}`
          : formatCurrency(Math.abs(absoluteChange), selectedCurrency)
        return `${percentageText} (${changePercentage >= 0 ? '+' : '-'}${changeText})`
      }
      
      return `${percentageText} from last month`
    }

    const metricsList = [
      {
        title: 'Total MRR',
        value: formatCurrency(totalMrrValue, selectedCurrency),
        change: formatChangeText(mrrChangePercentage, mrrChange, false),
        trend: mrrChangePercentage === null 
          ? 'neutral' as const 
          : (mrrChangePercentage === 0 && mrrChange && mrrChange > 0)
            ? 'up' // New data with positive change
            : (mrrChangePercentage >= 0 ? 'up' : 'down'),
        icon: TrendingUp,
      },
      {
        title: 'Total Customers',
        value: totalCustomersValue.toLocaleString(),
        change: formatChangeText(customersChangePercentage, customersChange, true),
        trend: customersChangePercentage === null 
          ? 'neutral' as const
          : (customersChangePercentage === 0 && customersChange && customersChange > 0)
            ? 'up' // New data with positive change
            : (customersChangePercentage >= 0 ? 'up' : 'down'),
        icon: Users,
      },
      {
        title: 'Active Integrations',
        value: integrations
          .filter((i) => i.status === 'active')
          .length.toString(),
        change: `${integrations.length} total platforms`,
        trend: 'neutral' as const,
        icon: Link2,
      },
      {
        title: 'ARR',
        value: formatCurrency(arrValue > 0 ? arrValue : totalMrrValue * 12, selectedCurrency),
        change: 'Annual Recurring Revenue',
        trend: 'neutral' as const,
        icon: DollarSign,
      },
    ]

    if (
      netMrrValue !== null &&
      grossMrrValue !== null &&
      Math.abs(grossMrrValue - netMrrValue) > 0.01
    ) {
      const delta = grossMrrValue - netMrrValue
      const changeLabel = delta >= 0
        ? `-${formatCurrency(Math.abs(delta), selectedCurrency)} Shopify fees/refunds`
        : `+${formatCurrency(Math.abs(delta), selectedCurrency)} adjustments`
      const trend: 'up' | 'down' = delta >= 0 ? 'down' : 'up'

      metricsList.splice(1, 0, {
        title: 'Net Subscription MRR',
        value: formatCurrency(netMrrValue, selectedCurrency),
        change: changeLabel,
        trend,
        icon: DollarSign,
      })
    }

    return metricsList
  }

  const metricsData = getMetricsData()

  const resolveIntegrationRevenue = (integration: Integration): number => {
    // Use GROSS revenue (before platform fees) for consistency with dashboard Total MRR
    if (integration.gross_currency_breakdown) {
      return Object.values(integration.gross_currency_breakdown).reduce(
        (sum, entry) => sum + (entry?.converted_total ?? 0),
        0
      )
    }
    // Fallback to gross_revenue or revenue (backend now returns GROSS as revenue)
    return integration.gross_revenue || integration.revenue || 0
  }

  const totalIntegrationRevenue = integrations.reduce(
    (sum, integration) => sum + resolveIntegrationRevenue(integration),
    0
  )

  // Get platform breakdown from integrations
  const platformBreakdown = integrations.map((integration) => {
    const config = platformConfig[
      integration.platform as keyof typeof platformConfig
    ] || { name: integration.platform_name, icon: '🔗', color: 'gray' }
    const integrationRevenue = resolveIntegrationRevenue(integration)
    const percentage =
      totalIntegrationRevenue > 0
        ? (integrationRevenue / totalIntegrationRevenue) * 100
        : 0

    return {
      platform: config.name,
      icon: config.icon,
      revenue: integrationRevenue,
      customers: integration.customer_count || 0,
      percentage: Math.round(percentage * 10) / 10,
      color: config.color,
      currency: selectedCurrency,
      lastSync: integration.last_sync_at || new Date().toISOString(),
      status: (integration.status === 'active'
        ? 'connected'
        : integration.status === 'error'
        ? 'error'
        : 'syncing') as 'connected' | 'error' | 'syncing',
    }
  })

  const connectedIntegrations = integrations.filter(
    (i) => i.status === 'active'
  )
  const hasIntegrations = integrations.length > 0

  console.log('🔍 Dashboard state check:')
  console.log('  - integrations.length:', integrations.length)
  console.log('  - hasIntegrations:', hasIntegrations)
  console.log('  - connectedIntegrations.length:', connectedIntegrations.length)
  console.log('  - metrics:', metrics)
  console.log('  - isLoading:', isLoading)
  console.log('  - error:', error)

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='layout-container section-padding'>
        <div className='space-y-6 sm:space-y-8'>
          {/* Enhanced Responsive Header */}
          <div className='page-header animate-fade-in'>
            <div className='flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 gap-4'>
              <div className='space-y-2'>
              <h1 className='text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900'>
                Dashboard
              </h1>
                <p className='text-gray-600 text-sm sm:text-base lg:text-lg'>
                  Monitor your monthly recurring revenue and business metrics
                </p>
              </div>
              <div className='flex items-center gap-3'>
                <Button 
                  variant='outline' 
                  size='sm' 
                  onClick={handleSyncData}
                  className='btn-secondary'
                  disabled={isLoading}
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <div className='flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm'>
                  <label htmlFor='dashboard-month-picker' className='text-sm text-gray-600 whitespace-nowrap'>
                    Month
                  </label>
                  <input
                    id='dashboard-month-picker'
                    type='month'
                    value={selectedMonth}
                    onChange={(event) => {
                      const value = event.target.value
                      if (value && value.length === 7) {
                        setSelectedMonth(value)
                      }
                    }}
                    className='text-sm rounded-md border border-gray-200 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500'
                  />
                </div>
                <div className='flex w-full items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm sm:w-auto'>
                  <Switch
                    id='include-usage-switch'
                    checked={includeUsage}
                    onCheckedChange={(checked) => setIncludeUsage(Boolean(checked))}
                  />
                  <label htmlFor='include-usage-switch' className='text-sm text-gray-600 whitespace-nowrap'>
                    Include usage-based payouts
                  </label>
                </div>
                <CurrencySelector
                  currentCurrency={selectedCurrency}
                  onCurrencyChange={setSelectedCurrency}
                />
              </div>
            </div>
          </div>

          {/* Auto-Syncing Banner */}
          {isAutoSyncing && autoSyncPlatforms.length > 0 && (
            <Alert className='bg-green-50 border-green-200'>
              <RefreshCw className='h-4 w-4 text-green-600 animate-spin' />
              <AlertDescription className='text-green-800'>
                <span className='font-medium'>Syncing data...</span> Updating {autoSyncPlatforms.join(', ')} in the background. Dashboard will refresh automatically.
              </AlertDescription>
            </Alert>
          )}

          {/* Sync Info Banner */}
          {!isAutoSyncing && (
            <Alert className='bg-blue-50 border-blue-200'>
              <Info className='h-4 w-4 text-blue-600' />
              <AlertDescription className='text-blue-800 flex items-center justify-between flex-wrap gap-2'>
                <span>
                  Not seeing the latest data? Sync your integrations to fetch the most recent transactions.
                </span>
                <Button
                  variant='outline'
                  size='sm'
                  className='border-blue-300 text-blue-700 hover:bg-blue-100'
                  onClick={() => onNavigateToIntegrations ? onNavigateToIntegrations() : router.push('/integrations')}
                >
                  <Link2 className='mr-2 h-4 w-4' />
                  Go to Integrations
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Enhanced Loading State */}
          {isLoading && (
            <div className='flex flex-col items-center justify-center py-16 animate-fade-in'>
              <div className='relative'>
                <div className='loading-spinner h-12 w-12 mb-4'></div>
                <div className='absolute inset-0 loading-spinner h-12 w-12 animate-ping opacity-20'></div>
              </div>
              <div className='text-center space-y-2'>
                <p className='text-lg font-medium text-slate-700'>Loading dashboard data...</p>
                <p className='text-sm text-slate-500'>Fetching your latest metrics and insights</p>
              </div>
            </div>
          )}

          {/* Error Alert */}
          {error && (
            <Alert
              className={`${
                error.includes('Authentication')
                  ? 'border-red-200 bg-red-50'
                  : 'border-orange-200 bg-orange-50'
              }`}
            >
              <AlertCircle
                className={`h-4 w-4 ${
                  error.includes('Authentication')
                    ? 'text-red-600'
                    : 'text-orange-600'
                }`}
              />
              <AlertDescription
                className={`${
                  error.includes('Authentication')
                    ? 'text-red-700'
                    : 'text-orange-700'
                }`}
              >
                {error}
                {error.includes('Authentication') && (
                  <Button
                    size='sm'
                    className='ml-4'
                    onClick={() => (window.location.href = '/login')}
                  >
                    Log In
                  </Button>
                )}
              </AlertDescription>
            </Alert>
          )}


          {/* Enhanced No Integrations State */}
          {!hasIntegrations && !isLoading && (
            <div className='text-center py-20 animate-fade-in'>
              <div className='max-w-lg mx-auto'>
                <div className='mb-8'>
                  <div className='relative mb-6'>
                    <div className='w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-bounce-gentle'>
                      <Link2 className='w-10 h-10 text-indigo-600' />
                    </div>
                    <div className='absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center animate-pulse'>
                      <Plus className='w-3 h-3 text-white' />
                    </div>
                  </div>
                  <h3 className='text-2xl font-bold text-gray-900 mb-3'>
                    Connect Your Platforms
                  </h3>
                  <p className='text-gray-600 text-lg mb-8 leading-relaxed'>
                    Connect your integrations—Shopify Partners, E-conomic, Stripe, or any future platform we support—to pull live revenue and customer data straight into your dashboard.
                  </p>
                </div>

                <div className='space-y-4'>
                  <Button
                    className='w-full btn-primary py-6 text-base font-semibold'
                    onClick={() => onNavigateToIntegrations?.()}
                  >
                    <Plus className='mr-2 h-5 w-5' />
                    Connect Your First Integration
                  </Button>

                  <div className='grid grid-cols-2 gap-4 mt-6'>
                    <div className='card-elevated p-4 text-center interactive'>
                      <div className='text-3xl mb-3'>💳</div>
                      <p className='font-semibold text-gray-900 mb-1'>Stripe</p>
                      <p className='text-xs text-gray-500'>Payment processing</p>
                    </div>
                    <div className='card-elevated p-4 text-center interactive'>
                      <div className='text-3xl mb-3'>🔗</div>
                      <p className='font-semibold text-gray-900 mb-1'>E-conomic</p>
                      <p className='text-xs text-gray-500'>Accounting system</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Integration Status Alert */}
          {!hasIntegrations && !isLoading && (
            <Alert className='border-blue-200 bg-blue-50'>
              <Plus className='h-4 w-4 text-blue-600' />
              <AlertDescription className='text-blue-700'>
                <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
                  <span>
                    No integrations connected yet. Connect your platforms to
                    start tracking MRR.
                  </span>
                  <Button
                    size='sm'
                    className='w-full sm:w-auto'
                    onClick={() => onNavigateToIntegrations?.()}
                  >
                    <Plus className='mr-2 h-4 w-4' />
                    Connect Platforms
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {integrations.some(
            (integration) => integration.status === 'syncing'
          ) && (
            <Alert className='border-blue-200 bg-blue-50'>
              <RefreshCw className='h-4 w-4 text-blue-600 animate-spin' />
              <AlertDescription className='text-blue-700'>
                Data synchronization in progress. This may take a few minutes
                for large datasets.
              </AlertDescription>
            </Alert>
          )}

          {integrations.some(
            (integration) => integration.status === 'error'
          ) && (
            <Alert className='border-red-200 bg-red-50'>
              <AlertCircle className='h-4 w-4 text-red-600' />
              <AlertDescription className='text-red-700'>
                <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
                  <span>
                    Some integrations have errors. Check your integration
                    settings.
                  </span>
                  <Button
                    variant='outline'
                    size='sm'
                    className='w-full sm:w-auto'
                  >
                    <Settings className='mr-2 h-4 w-4' />
                    Manage Integrations
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {!isLoading && (
            <>
              {/* Enhanced Key Metrics */}
              {hasIntegrations && (
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 animate-slide-up'>
                  {metricsData.map((metric, index) => {
                    const Icon = metric.icon
                    return (
                      <div
                        key={metric.title}
                        className="card-elevated p-6"
                      >
                        <div className='flex items-center justify-between mb-4'>
                          <div className="p-3 rounded-md bg-gray-600 shadow-sm">
                            <Icon className='w-6 h-6 text-white' />
                          </div>
                          {metric.trend !== 'neutral' && (
                            <div className="flex items-center text-sm font-medium text-gray-600">
                              {metric.trend === 'up' ? (
                                <ArrowUpRight className='w-4 h-4' />
                              ) : (
                                <ArrowDownRight className='w-4 h-4' />
                              )}
                            </div>
                          )}
                        </div>
                        <div className='space-y-2'>
                          <p className='text-sm font-medium text-gray-600'>
                            {metric.title}
                          </p>
                          <p className='text-2xl sm:text-3xl font-bold text-gray-900'>
                            {metric.value}
                          </p>
                          <p className="text-xs font-medium text-gray-500">
                            {metric.change}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Enhanced MRR Trend Chart */}
              <div className='card-elevated animate-slide-up delay-200'>
                <div className='p-6 border-b border-slate-100'>
                  <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
                    <div className='flex items-center gap-3'>
                      <div className='w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center'>
                        <TrendingUp className='w-5 h-5 text-white' />
                      </div>
                      <div>
                        <h3 className='text-lg font-semibold text-slate-900'>MRR Trend</h3>
                        <p className='text-sm text-slate-500'>Monthly recurring revenue over time</p>
                      </div>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <Button variant='outline' size='sm' className='btn-secondary'>
                        <Download className='mr-2 h-4 w-4' />
                        Export
                      </Button>
                    </div>
                  </div>
                </div>
                <div className='p-6'>
                  {mrrTrend && mrrTrend.length > 0 ? (
                    <MRRChart
                      data={mrrTrend.map((item) => ({
                        month: item.date,
                        date: item.date,
                        mrr: item.value,
                        value: item.value,
                        growth: 0,
                        newRevenue: 0,
                        churn: 0,
                        netNew: 0,
                        customers: 0,
                        currency: selectedCurrency,
                      }))}
                      currency={selectedCurrency}
                    />
                  ) : (
                    <div className='text-center py-12 animate-fade-in'>
                      <div className='w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-4'>
                        <TrendingUp className='w-8 h-8 text-slate-400' />
                      </div>
                      <p className='text-slate-600 font-medium mb-2'>
                        No MRR data available
                      </p>
                      <p className='text-sm text-slate-500'>
                        Connect integrations and sync data to see your MRR trend
                      </p>
                    </div>
                  )}
                </div>
              </div>

    
                  {/* Monthly Revenue Breakdown Table for Bookkeeping */}
                  {hasIntegrations && (
                <div className='animate-slide-up delay-400'>
                  <MonthlyRevenueTable currency={selectedCurrency} />
                </div>
              )}

              {/* Enhanced Platform Breakdown */}
              {hasIntegrations && (
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 animate-slide-up'>
                  {/* Enhanced Connected Platforms */}
                  <div className='card-elevated'>
                    <div className='p-6 border-b border-slate-100'>
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-3'>
                          
                          <div>
                            <h3 className='text-lg font-semibold text-slate-900'>
                              Connected Platforms
                            </h3>
                            <p className='text-sm text-slate-500'>Active integrations</p>
                          </div>
                        </div>
                        <Badge className='status-success'>
                          {connectedIntegrations.length} Active
                        </Badge>
                      </div>
                    </div>
                    <div className='p-6 space-y-4'>
                      {platformBreakdown.map((platform, index) => (
                        <div
                          key={index}
                          className={`flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-gradient-to-r from-white to-slate-50/50 hover:shadow-md transition-all duration-300 animate-slide-up delay-${index * 75}`}
                        >
                          <div className='flex items-center space-x-4'>
                            <div className='w-12 h-12 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-xl'>
                              {platform.icon}
                            </div>
                            <div>
                              <p className='font-semibold text-slate-900'>{platform.platform}</p>
                              <p className='text-sm text-slate-500 flex items-center gap-1'>
                                <Users className='w-3 h-3' />
                                {platform.customers} customers
                              </p>
                            </div>
                          </div>
                          <div className='text-right space-y-2'>
                            <p className='font-bold text-lg text-slate-900'>
                              {formatCurrency(
                                platform.revenue,
                                selectedCurrency
                              )}
                            </p>
                            <div className='flex items-center justify-end'>
                              <Badge
                                className={`text-xs font-medium ${
                                  platform.status === 'connected'
                                    ? 'status-success'
                                    : platform.status === 'error'
                                    ? 'status-error'
                                    : platform.status === 'syncing'
                                    ? 'status-info'
                                    : 'bg-gray-100 text-gray-800'
                                }`}
                              >
                                {platform.status === 'connected'
                                  ? 'Connected'
                                  : platform.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Revenue Distribution */}
                  <div className='bg-white rounded-lg shadow-sm border'>
                    <div className='p-4 sm:p-6 border-b'>
                      <h3 className='text-lg font-semibold'>
                        Revenue Distribution
                      </h3>
                    </div>
                    <div className='p-4 sm:p-6'>
                      <PlatformChart
                        data={platformBreakdown}
                        currency={selectedCurrency}
                      />
                    </div>
                  </div>
                </div>
              )}


            </>
          )}
        </div>
      </div>
    </div>
  )
}
