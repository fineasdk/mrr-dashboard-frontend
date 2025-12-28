import { useState, useEffect, useCallback } from 'react'
import {
  Search,
  Filter,
  Download,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  AlertTriangle,
  Plus,
  Users2,
  SlidersHorizontal,
  Loader2,
  Link2,
  RefreshCw,
} from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Alert, AlertDescription } from '../ui/alert'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { Badge } from '../ui/badge'
import { Checkbox } from '../ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import { CustomerDetailModal } from '../dashboard/customer-detail-modal'
import { CurrencySelector } from '../dashboard/currency-selector'
import { mockCustomers } from '../../lib/mock-data'
import { formatCurrency, convertCurrency } from '../../lib/currency-service'
import { Customer, Currency } from '../../lib/types'
import { customersApi, integrationsApi } from '../../lib/api'

const platformIcons = {
  'e-conomic': '🔗',
  economic: '🔗',
  shopify: '🛒',
  stripe: '💳',
}

const platformColors = {
  'e-conomic': 'bg-blue-100 text-blue-800',
  economic: 'bg-blue-100 text-blue-800',
  shopify: 'bg-green-100 text-green-800',
  stripe: 'bg-gray-100 text-gray-800',
}

// Helper function to get display name for platform
const getPlatformDisplayName = (platform: string): string => {
  switch (platform) {
    case 'economic':
    case 'e-conomic':
      return 'E-conomic'
    case 'shopify':
      return 'Shopify'
    case 'stripe':
      return 'Stripe'
    default:
      return platform.charAt(0).toUpperCase() + platform.slice(1)
  }
}

const statusColors = {
  active: 'status-active',
  paused: 'status-paused',
  inactive: 'status-inactive',
}

const riskColors = {
  low: 'text-green-600',
  medium: 'text-yellow-600',
  high: 'text-red-600',
}

interface Integration {
  id: number
  platform: string
  platform_name: string
  status: 'pending' | 'active' | 'error' | 'syncing'
  customer_count: number
  revenue: number
}

export function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  )
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'view' | 'edit'>('view')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [platformFilter, setPlatformFilter] = useState<string>('all')
  const [billingFrequencyFilter, setBillingFrequencyFilter] = useState<string>('all')
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('DKK')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(50) // Increased from 10 to 50 to show more customers per page

  const loadCustomers = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const apiParams = {
        search: searchTerm || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        platform: platformFilter !== 'all' ? platformFilter : undefined,
        per_page: 500, // Increased to show customers from all platforms
        currency: selectedCurrency,
      }

      console.log('🔍 Loading customers with params:', apiParams)

      const response = await customersApi.getAll(apiParams)

      if (response.data.success) {
        // Normalize the API data to match frontend expectations
        const normalizedCustomers =
          response.data.data.data?.map((customer: any) => ({
            id: String(customer.id),
            name: customer.name || 'Unknown Customer',
            email: customer.email || '',
            platform: customer.platform || 'unknown',
            mrr:
              typeof customer.mrr === 'number'
                ? customer.mrr
                : typeof customer.total_mrr === 'number'
                ? customer.total_mrr
                : 0,
            originalMrr:
              typeof customer.originalMrr === 'number'
                ? customer.originalMrr
                : typeof customer.mrr === 'number'
                ? customer.mrr
                : 0,
            currency: customer.currency || 'DKK',
            status: customer.status || 'active',
            billingFrequency: customer.billingFrequency || 'monthly',
            joinDate:
              customer.joinDate ||
              customer.platform_created_at ||
              customer.created_at ||
              new Date().toISOString(),
            invoiceCount: customer.invoiceCount || customer.invoice_count || 0,
            isExcluded:
              customer.isExcluded ?? customer.excluded_from_mrr ?? false,
            exclusionReason:
              customer.exclusionReason || customer.exclusion_reason,
            excludedDate: customer.excludedDate || customer.excluded_at,
            excludedBy: customer.excludedBy,
            isTemporaryExclusion: customer.isTemporaryExclusion ?? false,
            exclusionExpiry: customer.exclusionExpiry,
            clv: typeof customer.clv === 'number' ? customer.clv : 0,
            churnRisk: customer.churnRisk || 'low',
          })) || []

        console.log('📊 Customer results:', {
          totalCustomers: normalizedCustomers.length,
          platformDistribution: normalizedCustomers.reduce(
            (acc: any, customer: any) => {
              acc[customer.platform] = (acc[customer.platform] || 0) + 1
              return acc
            },
            {}
          ),
          currentFilters: { searchTerm, statusFilter, platformFilter },
        })

        setCustomers(normalizedCustomers)
      } else {
        setCustomers([])
        setError(
          'No customers found. Connect your integrations to start seeing customer data.'
        )
      }
    } catch (err: any) {
      console.error('Failed to load customers:', err)
      setCustomers([])
      setError(
        'Failed to load customers. Please check your API connection and integrations.'
      )
    } finally {
      setLoading(false)
    }
  }, [selectedCurrency, searchTerm, statusFilter, platformFilter])

  const loadIntegrations = useCallback(async () => {
    try {
      const response = await integrationsApi.getAll({
        currency: selectedCurrency,
      })
      if (response.data.success) {
        setIntegrations(response.data.data)
      }
    } catch (err: any) {
      console.error('Failed to load integrations:', err)
    }
  }, [selectedCurrency])

  useEffect(() => {
    Promise.all([loadCustomers(), loadIntegrations()])
  }, [loadCustomers, loadIntegrations])

  // Reload customers when filters change
  useEffect(() => {
    loadCustomers()
  }, [loadCustomers])

  const handleSyncIntegration = async (integrationId: number) => {
    try {
      await integrationsApi.sync(integrationId.toString())
      await Promise.all([loadCustomers(), loadIntegrations()])
    } catch (err: any) {
      console.error('Sync failed:', err)
      setError('Sync failed. Please try again.')
    }
  }

  // Enhanced filtering
  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      !searchTerm ||
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus =
      statusFilter === 'all' || customer.status === statusFilter
    const matchesPlatform =
      platformFilter === 'all' || customer.platform === platformFilter
    const matchesBillingFrequency =
      billingFrequencyFilter === 'all' || customer.billingFrequency === billingFrequencyFilter

    return matchesSearch && matchesStatus && matchesPlatform && matchesBillingFrequency
  })

  // Pagination
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedCustomers = filteredCustomers.slice(
    startIndex,
    startIndex + itemsPerPage
  )

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleSelectCustomer = (customerId: string) => {
    setSelectedCustomers((prev) =>
      prev.includes(customerId)
        ? prev.filter((id) => id !== customerId)
        : [...prev, customerId]
    )
  }

  const handleSelectAll = () => {
    if (selectedCustomers.length === paginatedCustomers.length) {
      setSelectedCustomers([])
    } else {
      setSelectedCustomers(paginatedCustomers.map((customer) => customer.id))
    }
  }

  const handleExportCustomers = () => {
    // Implementation for exporting customers
    console.log('Exporting customers...')
  }

  const handleToggleExclusion = async (customer: Customer) => {
    try {
      console.log('🔄 Toggle exclusion for customer:', {
        id: customer.id,
        name: customer.name,
        currentlyExcluded: customer.isExcluded,
        willBeExcluded: !customer.isExcluded,
      })

      const updateData = {
        excluded_from_mrr: !customer.isExcluded,
        exclusion_reason: !customer.isExcluded ? 'Manually excluded' : null,
      }

      console.log('📡 Sending toggle update:', updateData)

      await customersApi.update(customer.id, updateData)

      console.log('✅ Toggle exclusion successful')
      await loadCustomers() // Reload the customer list
    } catch (err: any) {
      console.error('❌ Failed to toggle customer exclusion:', err)
      setError('Failed to update customer. Please try again.')
    }
  }

  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer)
    setModalMode('edit')
    setIsModalOpen(true)
  }

  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer)
    setModalMode('view')
    setIsModalOpen(true)
  }

  const handleBulkEdit = async () => {
    if (selectedCustomers.length === 0) return

    try {
      // For bulk edit, we'll exclude all selected customers from MRR
      await customersApi.bulkUpdate({
        customer_ids: selectedCustomers,
        excluded_from_mrr: true,
        exclusion_reason: 'Bulk excluded',
      })

      setSelectedCustomers([])
      await loadCustomers()
    } catch (err: any) {
      console.error('Bulk update failed:', err)
      setError('Bulk update failed. Please try again.')
    }
  }

  const connectedPlatforms = integrations.filter((i) => i.status === 'active')
  // Get available platforms from actual integrations instead of hardcoded list
  const availablePlatforms = Array.from(
    new Set(integrations.map((i) => i.platform))
  ).sort()
  
  // Get unique billing frequencies from customers
  const availableBillingFrequencies = Array.from(
    new Set(customers.map((c) => c.billingFrequency).filter(Boolean))
  ).sort()

  return (
    <div className='page-container-mesh'>
      <div className='layout-container section-padding space-y-6 sm:space-y-8'>
        {/* Header */}
        <div className='flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0'>
          <div>
            <h1 className='text-2xl font-semibold text-gray-900'>Customers</h1>
            <p className='text-gray-500 text-sm mt-1'>
              Manage your customer base across all platforms
            </p>
          </div>
          <div className='flex items-center gap-2'>
            <CurrencySelector
              currentCurrency={selectedCurrency}
              onCurrencyChange={setSelectedCurrency}
            />
            <Button
              size='sm'
              variant='outline'
              onClick={loadCustomers}
            >
              <RefreshCw className='mr-2 h-4 w-4' />
              Refresh
            </Button>
          </div>
        </div>

      {/* Error Alert */}
      {error && (
        <Alert className='bg-amber-50 border-amber-200'>
          <AlertTriangle className='h-4 w-4 text-amber-600' />
          <AlertDescription className='text-amber-700'>
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Integration Status */}
      {integrations.length > 0 && (
        <div className='bg-white rounded-xl border border-gray-200 shadow-sm'>
          <div className='p-5 border-b border-gray-100'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <div className='p-2 rounded-lg bg-gray-100'>
                  <Link2 className='w-4 h-4 text-gray-600' />
                </div>
                <h3 className='text-base font-semibold text-gray-900'>Connected Data Sources</h3>
              </div>
              <span className='bg-green-50 text-green-700 px-2.5 py-1 rounded-md text-xs font-medium'>
                {connectedPlatforms.length} Active
              </span>
            </div>
          </div>
          <div className='p-5'>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3'>
              {integrations.map((integration) => (
                <div
                  key={integration.id}
                  className='flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-colors'
                >
                  <div className='flex items-center space-x-3'>
                    <div className='w-9 h-9 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-lg'>
                      {platformIcons[
                        integration.platform as keyof typeof platformIcons
                      ] || '🔗'}
                    </div>
                    <div>
                      <p className='font-medium text-gray-900 text-sm'>
                        {integration.platform_name ||
                          getPlatformDisplayName(integration.platform)}
                      </p>
                      <p className='text-xs text-gray-500'>
                        {integration.customer_count} customers
                      </p>
                    </div>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium ${
                        integration.status === 'active'
                          ? 'bg-green-50 text-green-700'
                          : integration.status === 'error'
                          ? 'bg-red-50 text-red-700'
                          : integration.status === 'syncing'
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        integration.status === 'active' ? 'bg-green-500' :
                        integration.status === 'error' ? 'bg-red-500' :
                        integration.status === 'syncing' ? 'bg-blue-500 animate-pulse' : 'bg-gray-400'
                      }`} />
                      {integration.status === 'active' ? 'Connected' : integration.status}
                    </span>
                    {integration.status === 'active' && (
                      <Button
                        size='sm'
                        variant='ghost'
                        onClick={() => handleSyncIntegration(integration.id)}
                        className='h-7 w-7 p-0'
                      >
                        <RefreshCw className='h-3.5 w-3.5' />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {integrations.length === 0 && (
                <div className='col-span-full text-center py-8'>
                  <div className='w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3'>
                    <Plus className='h-6 w-6 text-gray-400' />
                  </div>
                  <p className='text-gray-600 font-medium text-sm'>No integrations connected</p>
                  <Button variant='outline' size='sm' className='mt-3'>
                    <Plus className='mr-2 h-4 w-4' />
                    Connect Platform
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

        {/* Customer Statistics */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
          <div className='bg-white rounded-xl border border-gray-200 p-5 shadow-sm'>
            <div className='flex items-center gap-3 mb-3'>
              <div className='p-2 rounded-lg bg-gray-100'>
                <Users2 className='h-4 w-4 text-gray-600' />
              </div>
              <span className='text-sm font-medium text-gray-500'>Total Customers</span>
            </div>
            <p className='text-2xl font-semibold text-gray-900'>{filteredCustomers.length}</p>
            <p className='text-xs text-gray-500 mt-1'>Across all platforms</p>
          </div>

          <div className='bg-white rounded-xl border border-gray-200 p-5 shadow-sm'>
            <div className='flex items-center gap-3 mb-3'>
              <div className='p-2 rounded-lg bg-green-50'>
                <div className='h-4 w-4 bg-green-500 rounded-full' />
              </div>
              <span className='text-sm font-medium text-gray-500'>Active</span>
            </div>
            <p className='text-2xl font-semibold text-gray-900'>
              {filteredCustomers.filter((c) => c.status === 'active').length}
            </p>
            <p className='text-xs text-gray-500 mt-1'>
              {((filteredCustomers.filter((c) => c.status === 'active').length / Math.max(1, filteredCustomers.length)) * 100).toFixed(1)}% of total
            </p>
          </div>

          <div className='bg-white rounded-xl border border-gray-200 p-5 shadow-sm'>
            <div className='flex items-center gap-3 mb-3'>
              <div className='p-2 rounded-lg bg-red-50'>
                <AlertTriangle className='h-4 w-4 text-red-500' />
              </div>
              <span className='text-sm font-medium text-gray-500'>High Risk</span>
            </div>
            <p className='text-2xl font-semibold text-gray-900'>
              {filteredCustomers.filter((c) => c.churnRisk === 'high').length}
            </p>
            <p className='text-xs text-gray-500 mt-1'>Churn risk customers</p>
          </div>

          <div className='bg-white rounded-xl border border-gray-200 p-5 shadow-sm'>
            <div className='flex items-center gap-3 mb-3'>
              <div className='p-2 rounded-lg bg-gray-100'>
                <div className='h-4 w-4 bg-gray-400 rounded-full' />
              </div>
              <span className='text-sm font-medium text-gray-500'>Excluded</span>
            </div>
            <p className='text-2xl font-semibold text-gray-900'>
              {filteredCustomers.filter((c) => c.isExcluded).length}
            </p>
            <p className='text-xs text-gray-500 mt-1'>From MRR calculations</p>
          </div>
        </div>

      {/* Loading State */}
      {loading && (
        <div className='flex flex-col items-center justify-center py-16'>
          <div className='w-10 h-10 rounded-full border-2 border-gray-200 border-t-gray-600 animate-spin' />
          <p className='mt-4 text-sm text-gray-500'>Loading customers...</p>
        </div>
      )}

      {/* Filters & Search */}
      {!loading && customers.length > 0 && (
        <div className='bg-white rounded-xl border border-gray-200 shadow-sm p-5'>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3'>
              {/* Search */}
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
                <Input
                  placeholder='Search customers...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='pl-9'
                />
              </div>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className='rounded-xl border-gray-200'>
                  <SelectValue placeholder='All Statuses' />
                </SelectTrigger>
                <SelectContent className='bg-white rounded-xl'>
                  <SelectItem value='all'>All Statuses</SelectItem>
                  <SelectItem value='active'>Active</SelectItem>
                  <SelectItem value='paused'>Paused</SelectItem>
                  <SelectItem value='inactive'>Inactive</SelectItem>
                </SelectContent>
              </Select>

              {/* Platform Filter */}
              <Select value={platformFilter} onValueChange={setPlatformFilter}>
                <SelectTrigger>
                  <SelectValue placeholder='All Platforms' />
                </SelectTrigger>
                <SelectContent className='bg-white'>
                  <SelectItem value='all'>All Platforms</SelectItem>
                  {availablePlatforms.map((platform) => (
                    <SelectItem key={platform} value={platform}>
                      {getPlatformDisplayName(platform)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Billing Frequency Filter */}
              <Select
                value={billingFrequencyFilter}
                onValueChange={setBillingFrequencyFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder='All Frequencies' />
                </SelectTrigger>
                <SelectContent className='bg-white'>
                  <SelectItem value='all'>All Frequencies</SelectItem>
                  <SelectItem value='monthly'>Monthly</SelectItem>
                  <SelectItem value='quarterly'>Quarterly</SelectItem>
                  <SelectItem value='yearly'>Yearly</SelectItem>
                  <SelectItem value='weekly'>Weekly</SelectItem>
                  <SelectItem value='daily'>Daily</SelectItem>
                  <SelectItem value='custom'>Custom</SelectItem>
                  {availableBillingFrequencies
                    .filter(
                      (freq) =>
                        !['monthly', 'quarterly', 'yearly', 'weekly', 'daily', 'custom'].includes(
                          freq
                        )
                    )
                    .map((freq) => (
                      <SelectItem key={freq} value={freq}>
                        {freq.charAt(0).toUpperCase() + freq.slice(1)}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Active Filters Display */}
            {(searchTerm || statusFilter !== 'all' || platformFilter !== 'all' || billingFrequencyFilter !== 'all') && (
              <div className='flex flex-wrap items-center gap-2 mt-4'>
                <span className='text-sm text-muted-foreground'>Active filters:</span>
                {searchTerm && (
                  <Badge variant='secondary' className='gap-1'>
                    Search: {searchTerm}
                    <button
                      onClick={() => setSearchTerm('')}
                      className='ml-1 hover:text-red-600'
                    >
                      ×
                    </button>
                  </Badge>
                )}
                {statusFilter !== 'all' && (
                  <Badge variant='secondary' className='gap-1'>
                    Status: {statusFilter}
                    <button
                      onClick={() => setStatusFilter('all')}
                      className='ml-1 hover:text-red-600'
                    >
                      ×
                    </button>
                  </Badge>
                )}
                {platformFilter !== 'all' && (
                  <Badge variant='secondary' className='gap-1'>
                    Platform: {getPlatformDisplayName(platformFilter)}
                    <button
                      onClick={() => setPlatformFilter('all')}
                      className='ml-1 hover:text-red-600'
                    >
                      ×
                    </button>
                  </Badge>
                )}
                {billingFrequencyFilter !== 'all' && (
                  <Badge variant='secondary' className='gap-1'>
                    Frequency: {billingFrequencyFilter}
                    <button
                      onClick={() => setBillingFrequencyFilter('all')}
                      className='ml-1 hover:text-red-600'
                    >
                      ×
                    </button>
                  </Badge>
                )}
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => {
                    setSearchTerm('')
                    setStatusFilter('all')
                    setPlatformFilter('all')
                    setBillingFrequencyFilter('all')
                  }}
                  className='h-6 px-2 text-xs rounded-lg hover:bg-gray-100'
                >
                  Clear all
                </Button>
              </div>
            )}
          </div>
      )}

      {/* Customer Table */}
      {!loading && (
        <div className='bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden'>
          <div className='p-5 border-b border-gray-100'>
            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
              <div className='flex items-center gap-3'>
                <div className='p-2 rounded-lg bg-gray-100'>
                  <Users2 className='w-4 h-4 text-gray-600' />
                </div>
                <div>
                  <h3 className='text-base font-semibold text-gray-900'>Customer List</h3>
                  <p className='text-xs text-gray-500'>
                    {filteredCustomers.length} {filteredCustomers.length === 1 ? 'customer' : 'customers'}
                  </p>
                </div>
              </div>
              {selectedCustomers.length > 0 && (
                <div className='flex items-center gap-2'>
                  <span className='text-sm text-gray-500'>
                    {selectedCustomers.length} selected
                  </span>
                  <Button variant='outline' size='sm' onClick={handleBulkEdit}>
                    <Edit className='mr-2 h-4 w-4' />
                    Bulk Exclude
                  </Button>
                </div>
              )}
            </div>
          </div>
          <div className='p-0'>
            <div className='overflow-x-auto'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className='w-12'>
                      <Checkbox
                        checked={
                          selectedCustomers.length ===
                            paginatedCustomers.length &&
                          paginatedCustomers.length > 0
                        }
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Platform</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>MRR</TableHead>
                    <TableHead>Risk</TableHead>
                    <TableHead>Join Date</TableHead>
                    <TableHead className='w-12'></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedCustomers.includes(customer.id)}
                          onCheckedChange={() =>
                            handleSelectCustomer(customer.id)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <div className='flex flex-col'>
                          <span className='font-medium'>{customer.name}</span>
                          <span className='text-sm text-muted-foreground'>
                            {customer.email}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant='secondary'
                          className={
                            platformColors[
                              customer.platform as keyof typeof platformColors
                            ] || 'bg-gray-100 text-gray-800'
                          }
                        >
                          <span className='mr-1'>
                            {platformIcons[
                              customer.platform as keyof typeof platformIcons
                            ] || '🔗'}
                          </span>
                          {getPlatformDisplayName(customer.platform)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            customer.status === 'active'
                              ? 'default'
                              : 'secondary'
                          }
                          className={
                            customer.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : customer.status === 'paused'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }
                        >
                          {customer.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className='flex flex-col'>
                          <span className='font-medium'>
                            {formatCurrency(customer.mrr, selectedCurrency)}
                          </span>
                          <span className='text-xs text-muted-foreground'>
                            {customer.billingFrequency}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant='secondary'
                          className={
                            customer.churnRisk === 'low'
                              ? 'bg-green-100 text-green-800'
                              : customer.churnRisk === 'medium'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }
                        >
                          {customer.churnRisk}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className='text-sm'>
                          {customer.joinDate
                            ? new Date(customer.joinDate).toLocaleDateString()
                            : 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant='ghost' size='sm'>
                              <MoreHorizontal className='h-4 w-4' />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align='end' className='bg-white'>
                            <DropdownMenuItem
                              onClick={() => handleViewCustomer(customer)}
                            >
                              <Eye className='mr-2 h-4 w-4' />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleEditCustomer(customer)}
                            >
                              <Edit className='mr-2 h-4 w-4' />
                              Edit Customer
                            </DropdownMenuItem>
                            {customer.isExcluded ? (
                              <DropdownMenuItem
                                onClick={() => handleToggleExclusion(customer)}
                              >
                                <Plus className='mr-2 h-4 w-4' />
                                Include in MRR
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => handleToggleExclusion(customer)}
                              >
                                <Trash2 className='mr-2 h-4 w-4' />
                                Exclude from MRR
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className='flex items-center justify-between pt-4'>
                <div className='text-sm text-muted-foreground'>
                  Showing {startIndex + 1} to{' '}
                  {Math.min(
                    startIndex + itemsPerPage,
                    filteredCustomers.length
                  )}{' '}
                  of {filteredCustomers.length} customers
                </div>
                <div className='flex items-center space-x-2'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((page) => Math.abs(page - currentPage) <= 2)
                    .map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? 'default' : 'outline'}
                        size='sm'
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </Button>
                    ))}
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Customer Detail Modal */}
      <CustomerDetailModal
        customer={selectedCustomer}
        open={isModalOpen}
        mode={modalMode}
        selectedCurrency={selectedCurrency}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedCustomer(null)
        }}
        onSave={async (updatedCustomer: Customer) => {
          try {
            console.log('💾 Saving customer changes:', {
              id: updatedCustomer.id,
              name: updatedCustomer.name,
              isExcluded: updatedCustomer.isExcluded,
              exclusionReason: updatedCustomer.exclusionReason,
            })

            // Prepare the update data
            const updateData: any = {
              excluded_from_mrr: updatedCustomer.isExcluded || false,
            }

            // Add exclusion reason if customer is being excluded
            if (updatedCustomer.isExcluded && updatedCustomer.exclusionReason) {
              updateData.exclusion_reason = updatedCustomer.exclusionReason
            } else if (!updatedCustomer.isExcluded) {
              updateData.exclusion_reason = null
            }

            console.log('📡 Sending update data to API:', {
              customerId: updatedCustomer.id,
              updateData: updateData,
            })

            // Call the API to update the customer
            await customersApi.update(updatedCustomer.id, updateData)

            console.log('✅ Customer updated successfully')

            // Reload the customer list to reflect changes
            await loadCustomers()

            setIsModalOpen(false)
            setSelectedCustomer(null)
          } catch (error) {
            console.error('❌ Failed to update customer:', error)
            setError('Failed to update customer. Please try again.')
          }
        }}
      />
      </div>
    </div>
  )
}
