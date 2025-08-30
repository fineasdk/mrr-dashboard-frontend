import { useState, useEffect } from 'react'
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
} from 'lucide-react'
// import { MetricCard } from '../dashboard/metric-card';
import { MRRChart } from '../dashboard/mrr-chart'
import { PlatformChart } from '../dashboard/platform-chart'
import { CurrencySelector } from '../dashboard/currency-selector'
import { Button } from '../ui/button'
import { Alert, AlertDescription } from '../ui/alert'
import { Badge } from '../ui/badge'
import {
  mockMetrics,
  mockMRRData,
  mockPlatformBreakdown,
  convertCurrency,
} from '../../lib/mock-data'
import { Currency } from '../../lib/types'
import { dashboardApi, integrationsApi } from '../../lib/api'
import { formatCurrency } from '../../lib/mock-data'

const metricIcons = [TrendingUp, Users, CreditCard, Activity]

// Platform configuration for consistent display
const platformConfig = {
  'e-conomic': { name: 'E-conomic', icon: '🔗', color: 'blue' },
  economic: { name: 'E-conomic', icon: '🔗', color: 'blue' },
  shopify: { name: 'Shopify', icon: '🛒', color: 'green' },
  stripe: { name: 'Stripe', icon: '💳', color: 'purple' },
}

interface Metrics {
  total_mrr: {
    value: number
    change_percentage: number
    formatted: string
  }
  total_customers: {
    value: number
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
  status: 'pending' | 'active' | 'error' | 'syncing'
  last_sync_at: string | null
  customer_count: number
  revenue: number
}

export function DashboardPage() {
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('DKK')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [mrrTrend, setMrrTrend] = useState<
    Array<{ date: string; value: number }>
  >([])

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
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
      const [metricsResponse, integrationsResponse] = await Promise.all([
        dashboardApi.getMetrics({ currency: selectedCurrency }),
        integrationsApi.getAll(),
      ])

      console.log('📊 Metrics response:', metricsResponse.data)
      console.log('🔗 Integrations response:', integrationsResponse.data)

      if (metricsResponse.data.success) {
        const data = metricsResponse.data.data
        console.log('✅ Setting metrics:', data.metrics)
        setMetrics(data.metrics) // Access the metrics from the correct nested path
        setMrrTrend(data.mrr_trend || []) // Store MRR trend separately
      } else {
        console.log('❌ Metrics response not successful:', metricsResponse.data)
      }

      if (integrationsResponse.data.success) {
        console.log('✅ Setting integrations:', integrationsResponse.data.data)
        setIntegrations(integrationsResponse.data.data)
      } else {
        console.log(
          '❌ Integrations response not successful:',
          integrationsResponse.data
        )
      }

      // Only show error if no integrations are connected
      if (
        !integrationsResponse.data.success ||
        integrationsResponse.data.data.length === 0
      ) {
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
  }

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
    return [
      {
        title: 'Total MRR',
        value:
          metrics?.total_mrr?.formatted || formatCurrency(0, selectedCurrency),
        change: `${
          metrics?.total_mrr?.change_percentage || 0
        }% from last month`,
        trend:
          (metrics?.total_mrr?.change_percentage || 0) >= 0 ? 'up' : 'down',
        icon: TrendingUp,
      },
      {
        title: 'Total Customers',
        value: (metrics?.total_customers?.value || 0).toLocaleString(),
        change: `${
          metrics?.total_customers?.change_percentage || 0
        }% from last month`,
        trend:
          (metrics?.total_customers?.change_percentage || 0) >= 0
            ? 'up'
            : 'down',
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
        value: metrics?.arr?.formatted || formatCurrency(0, selectedCurrency),
        change: 'Annual Recurring Revenue',
        trend: 'neutral' as const,
        icon: DollarSign,
      },
    ]
  }

  const metricsData = getMetricsData()

  // Get platform breakdown from integrations
  const platformBreakdown = integrations.map((integration, index) => {
    const config = platformConfig[
      integration.platform as keyof typeof platformConfig
    ] || { name: integration.platform_name, icon: '🔗', color: 'gray' }
    const totalRevenue = integrations.reduce(
      (sum, int) => sum + (int.revenue || 0),
      0
    )
    const percentage =
      totalRevenue > 0 ? ((integration.revenue || 0) / totalRevenue) * 100 : 0

    return {
      platform: config.name,
      icon: config.icon,
      revenue: integration.revenue || 0,
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
    <div className='page-container'>
      <div className='layout-container section-padding'>
        <div className='space-y-6 sm:space-y-8'>
          {/* Responsive Header */}
          <div className='page-header'>
            <div className='flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 gap-4'>
              <div>
                <h1 className='page-title text-xl sm:text-2xl'>Dashboard</h1>
                <p className='page-description text-sm sm:text-base'>
                  Monitor your monthly recurring revenue and business metrics
                </p>
              </div>

              <div className='flex flex-col sm:flex-row items-stretch sm:items-center gap-3'>
                <CurrencySelector
                  currentCurrency={selectedCurrency}
                  onCurrencyChange={setSelectedCurrency}
                />
                <Button
                  variant='outline'
                  size='sm'
                  onClick={handleSyncData}
                  disabled={isLoading}
                  className='btn-secondary w-full sm:w-auto'
                >
                  <RefreshCw
                    className={`mr-2 h-4 w-4 ${
                      isLoading ? 'animate-spin' : ''
                    }`}
                  />
                  {isLoading ? 'Syncing...' : 'Sync Data'}
                </Button>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className='flex items-center justify-center py-12'>
              <Loader2 className='h-8 w-8 animate-spin mr-2' />
              <span>Loading dashboard data...</span>
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

          {/* No Integrations State */}
          {!hasIntegrations && !isLoading && (
            <div className='text-center py-16'>
              <div className='max-w-md mx-auto'>
                <div className='mb-6'>
                  <div className='w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                    <Link2 className='w-8 h-8 text-blue-600' />
                  </div>
                  <h3 className='text-xl font-semibold text-gray-900 mb-2'>
                    Connect Your Platforms
                  </h3>
                  <p className='text-gray-600 mb-6'>
                    Connect your Stripe or E-conomic accounts to start tracking
                    your real MRR data. No more mock data - see your actual
                    business metrics.
                  </p>
                </div>

                <div className='space-y-3'>
                  <Button
                    className='w-full'
                    onClick={() => {
                      // Navigate to integrations page
                      const integrationsPage = document.querySelector(
                        '[data-page="integrations"]'
                      )
                      if (integrationsPage) {
                        ;(integrationsPage as HTMLElement).click()
                      }
                    }}
                  >
                    <Plus className='mr-2 h-4 w-4' />
                    Connect Your First Integration
                  </Button>

                  <div className='grid grid-cols-2 gap-3 mt-4'>
                    <div className='p-3 border rounded-lg text-center'>
                      <span className='text-2xl mb-2 block'>💳</span>
                      <p className='text-sm font-medium'>Stripe</p>
                      <p className='text-xs text-gray-500'>
                        Payment processing
                      </p>
                    </div>
                    <div className='p-3 border rounded-lg text-center'>
                      <span className='text-2xl mb-2 block'>🔗</span>
                      <p className='text-sm font-medium'>E-conomic</p>
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
                    onClick={() => (window.location.href = '#integrations')}
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
              {/* Key Metrics - Responsive grid */}
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6'>
                {metricsData.map((metric, index) => {
                  const Icon = metric.icon
                  return (
                    <div
                      key={metric.title}
                      className='bg-white rounded-lg shadow-sm border p-4 sm:p-6'
                    >
                      <div className='flex items-center justify-between'>
                        <div className='space-y-2 flex-1 min-w-0'>
                          <p className='text-xs sm:text-sm text-muted-foreground'>
                            {metric.title}
                          </p>
                          <p className='text-lg sm:text-xl lg:text-2xl font-bold truncate'>
                            {metric.value}
                          </p>
                        </div>
                        <div className='ml-3 flex-shrink-0'>
                          <div className='w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center'>
                            <Icon className='w-4 h-4 sm:w-5 sm:h-5 text-primary' />
                          </div>
                        </div>
                      </div>
                      <div className='mt-2 flex items-center'>
                        {metric.trend === 'up' && (
                          <ArrowUpRight className='w-3 h-3 sm:w-4 sm:h-4 text-green-600 mr-1 flex-shrink-0' />
                        )}
                        {metric.trend === 'down' && (
                          <ArrowDownRight className='w-3 h-3 sm:w-4 sm:h-4 text-red-600 mr-1 flex-shrink-0' />
                        )}
                        <span
                          className={`text-xs text-muted-foreground truncate ${
                            metric.trend === 'up'
                              ? 'text-green-600'
                              : metric.trend === 'down'
                              ? 'text-red-600'
                              : 'text-muted-foreground'
                          }`}
                        >
                          {metric.change}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Platform Breakdown */}
              {hasIntegrations && (
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                  {/* Connected Platforms */}
                  <div className='bg-white rounded-lg shadow-sm border'>
                    <div className='p-4 sm:p-6 border-b'>
                      <div className='flex items-center justify-between'>
                        <h3 className='text-lg font-semibold'>
                          Connected Platforms
                        </h3>
                        <Badge variant='secondary'>
                          {connectedIntegrations.length} Active
                        </Badge>
                      </div>
                    </div>
                    <div className='p-4 sm:p-6 space-y-4'>
                      {platformBreakdown.map((platform, index) => (
                        <div
                          key={index}
                          className='flex items-center justify-between p-3 rounded-lg border'
                        >
                          <div className='flex items-center space-x-3'>
                            <span className='text-xl'>{platform.icon}</span>
                            <div>
                              <p className='font-medium'>{platform.platform}</p>
                              <p className='text-sm text-muted-foreground'>
                                {platform.customers} customers
                              </p>
                            </div>
                          </div>
                          <div className='text-right space-y-1'>
                            <p className='font-semibold'>
                              {formatCurrency(
                                platform.revenue,
                                selectedCurrency
                              )}
                            </p>
                            <div className='flex items-center space-x-2'>
                              <Badge
                                variant={
                                  platform.status === 'connected'
                                    ? 'default'
                                    : 'secondary'
                                }
                                className={`text-xs ${
                                  platform.status === 'connected'
                                    ? 'bg-green-100 text-green-800'
                                    : platform.status === 'error'
                                    ? 'bg-red-100 text-red-800'
                                    : platform.status === 'syncing'
                                    ? 'bg-blue-100 text-blue-800'
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

              {/* MRR Trend Chart */}
              <div className='bg-white rounded-lg shadow-sm border'>
                <div className='p-4 sm:p-6 border-b'>
                  <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
                    <h3 className='text-lg font-semibold'>MRR Trend</h3>
                    <div className='flex items-center space-x-2'>
                      <Button variant='outline' size='sm'>
                        <Download className='mr-2 h-4 w-4' />
                        Export
                      </Button>
                    </div>
                  </div>
                </div>
                <div className='p-4 sm:p-6'>
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
                    <div className='text-center py-8'>
                      <p className='text-muted-foreground'>
                        No MRR data available
                      </p>
                      <p className='text-sm text-muted-foreground mt-2'>
                        Connect integrations and sync data to see your MRR trend
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              {hasIntegrations && (
                <div className='bg-white rounded-lg shadow-sm border'>
                  <div className='p-4 sm:p-6 border-b'>
                    <h3 className='text-lg font-semibold'>Quick Actions</h3>
                  </div>
                  <div className='p-4 sm:p-6'>
                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                      {integrations
                        .filter(
                          (integration) => integration.status === 'active'
                        )
                        .map((integration) => (
                          <Button
                            key={integration.id}
                            variant='outline'
                            className='h-auto p-4 flex flex-col items-center space-y-2'
                            onClick={() =>
                              handleSyncIntegration(integration.id)
                            }
                          >
                            <span className='text-lg'>
                              {platformConfig[
                                integration.platform as keyof typeof platformConfig
                              ]?.icon || '🔗'}
                            </span>
                            <span className='text-sm font-medium'>
                              Sync {integration.platform_name}
                            </span>
                            <span className='text-xs text-muted-foreground'>
                              Last:{' '}
                              {integration.last_sync_at
                                ? new Date(
                                    integration.last_sync_at
                                  ).toLocaleDateString()
                                : 'Never'}
                            </span>
                          </Button>
                        ))}
                      <Button
                        variant='outline'
                        className='h-auto p-4 flex flex-col items-center space-y-2 border-dashed'
                        onClick={() => (window.location.href = '#integrations')}
                      >
                        <Plus className='h-5 w-5' />
                        <span className='text-sm font-medium'>
                          Add Integration
                        </span>
                        <span className='text-xs text-muted-foreground'>
                          Connect new platform
                        </span>
                      </Button>
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
