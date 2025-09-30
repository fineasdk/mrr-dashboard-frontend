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
  stripe: 'bg-purple-100 text-purple-800',
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

    return matchesSearch && matchesStatus && matchesPlatform
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

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='layout-container section-padding space-y-6 sm:space-y-8'>
        {/* Enhanced Header */}
        <div className='animate-fade-in'>
          <div className='flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 gap-4'>
            <div className='space-y-2'>
              <h1 className='text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900'>
                Customers
              </h1>
              <p className='text-gray-600 text-sm sm:text-base lg:text-lg'>
                Manage your customer base across all platforms
              </p>
            </div>
            <div className='flex flex-col sm:flex-row items-stretch sm:items-center gap-3'>
              <CurrencySelector
                currentCurrency={selectedCurrency}
                onCurrencyChange={setSelectedCurrency}
              />
              <Button size='sm' onClick={loadCustomers} className='btn-secondary'>
                <RefreshCw className='mr-2 h-4 w-4' />
                Refresh
              </Button>
            </div>
          </div>
        </div>

      {/* Error Alert */}
      {error && (
        <Alert className='border-orange-200 bg-orange-50'>
          <AlertTriangle className='h-4 w-4 text-orange-600' />
          <AlertDescription className='text-orange-700'>
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Integration Status */}
      {integrations.length > 0 && (
        <Card>
          <CardHeader className='pb-4'>
            <CardTitle className='flex items-center space-x-2'>
              <Link2 className='h-5 w-5' />
              <span>Connected Data Sources</span>
              <Badge variant='secondary'>
                {connectedPlatforms.length} Active
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
              {integrations.map((integration) => (
                <div
                  key={integration.id}
                  className='flex items-center justify-between p-3 rounded-lg border'
                >
                  <div className='flex items-center space-x-3'>
                    <span className='text-lg'>
                      {platformIcons[
                        integration.platform as keyof typeof platformIcons
                      ] || '🔗'}
                    </span>
                    <div>
                      <p className='font-medium text-sm'>
                        {integration.platform_name ||
                          getPlatformDisplayName(integration.platform)}
                      </p>
                      <p className='text-xs text-muted-foreground'>
                        {integration.customer_count} customers
                      </p>
                    </div>
                  </div>
                  <div className='flex items-center space-x-2'>
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
                    {integration.status === 'active' && (
                      <Button
                        size='sm'
                        variant='outline'
                        onClick={() => handleSyncIntegration(integration.id)}
                        className='h-6 px-2'
                      >
                        <RefreshCw className='h-3 w-3' />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {integrations.length === 0 && (
                <div className='col-span-full text-center py-8'>
                  <Plus className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                  <p className='text-gray-500'>No integrations connected</p>
                  <Button variant='outline' size='sm' className='mt-2'>
                    <Plus className='mr-2 h-4 w-4' />
                    Connect Platform
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

        {/* Enhanced Customer Statistics */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 animate-slide-up'>
          <div className='card-elevated p-6 animate-scale-in'>
            <div className='flex items-center justify-between mb-4'>
              <div className='p-3 rounded-md bg-gray-600 shadow-sm'>
                <Users2 className='h-6 w-6 text-white' />
              </div>
            </div>
            <div className='space-y-2'>
              <p className='text-sm font-medium text-slate-600'>Total Customers</p>
              <p className='text-2xl sm:text-3xl font-bold text-slate-900'>{filteredCustomers.length}</p>
              <p className='text-xs font-medium text-slate-500'>Across all platforms</p>
            </div>
          </div>

          <div className='card-elevated p-6 animate-scale-in delay-100'>
            <div className='flex items-center justify-between mb-4'>
              <div className='p-3 rounded-md bg-gray-600 shadow-sm'>
                <div className='h-6 w-6 bg-white rounded-full flex items-center justify-center'>
                  <div className='h-3 w-3 bg-green-500 rounded-full'></div>
                </div>
              </div>
            </div>
            <div className='space-y-2'>
              <p className='text-sm font-medium text-slate-600'>Active</p>
              <p className='text-2xl sm:text-3xl font-bold text-slate-900'>
                {filteredCustomers.filter((c) => c.status === 'active').length}
              </p>
              <p className='text-xs font-medium text-gray-500'>
                {((filteredCustomers.filter((c) => c.status === 'active').length / Math.max(1, filteredCustomers.length)) * 100).toFixed(1)}% of total
              </p>
            </div>
          </div>

          <div className='card-elevated p-6 animate-scale-in delay-200'>
            <div className='flex items-center justify-between mb-4'>
              <div className='p-3 rounded-md bg-gray-600 shadow-sm'>
                <div className='h-6 w-6 bg-white rounded-full flex items-center justify-center'>
                  <div className='h-3 w-3 bg-red-500 rounded-full'></div>
                </div>
              </div>
            </div>
            <div className='space-y-2'>
              <p className='text-sm font-medium text-slate-600'>High Risk</p>
              <p className='text-2xl sm:text-3xl font-bold text-slate-900'>
                {filteredCustomers.filter((c) => c.churnRisk === 'high').length}
              </p>
              <p className='text-xs font-medium text-gray-500'>Churn risk customers</p>
            </div>
          </div>

          <div className='card-elevated p-6 animate-scale-in delay-300'>
            <div className='flex items-center justify-between mb-4'>
              <div className='p-3 rounded-md bg-gray-600 shadow-sm'>
                <div className='h-6 w-6 bg-white rounded-full flex items-center justify-center'>
                  <div className='h-3 w-3 bg-gray-500 rounded-full'></div>
                </div>
              </div>
            </div>
            <div className='space-y-2'>
              <p className='text-sm font-medium text-slate-600'>Excluded</p>
              <p className='text-2xl sm:text-3xl font-bold text-slate-900'>
                {filteredCustomers.filter((c) => c.isExcluded).length}
              </p>
              <p className='text-xs font-medium text-slate-500'>From MRR calculations</p>
            </div>
          </div>
        </div>

      {/* Loading State */}
      {loading && (
        <div className='flex items-center justify-center py-12'>
          <Loader2 className='h-8 w-8 animate-spin mr-2' />
          <span>Loading customers...</span>
        </div>
      )}

      {/* Customer Table */}
      {!loading && (
        <Card>
          <CardHeader className='pb-4'>
            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
              <CardTitle>Customer List</CardTitle>
              {selectedCustomers.length > 0 && (
                <div className='flex items-center space-x-2'>
                  <span className='text-sm text-muted-foreground'>
                    {selectedCustomers.length} selected
                  </span>
                  <Button variant='outline' size='sm' onClick={handleBulkEdit}>
                    <Edit className='mr-2 h-4 w-4' />
                    Bulk Exclude
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      )}

      {/* Customer Detail Modal */}
      <CustomerDetailModal
        customer={selectedCustomer}
        open={isModalOpen}
        mode={modalMode}
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
