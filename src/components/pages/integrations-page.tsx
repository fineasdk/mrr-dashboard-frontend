import { useState, useEffect, useCallback } from 'react'
import {
  RefreshCw,
  Settings,
  CheckCircle,
  XCircle,
  AlertCircle,
  Users,
  DollarSign,
  Link2,
  Shield,
  Plus,
  Building2,
  Loader2,
  ExternalLink,
  Unplug,
} from 'lucide-react'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Switch } from '../ui/switch'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Alert, AlertDescription } from '../ui/alert'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog'

import { integrationsApi } from '../../lib/api'
import { formatCurrency } from '../../lib/currency-service'
import { Currency } from '../../lib/types'
import { CurrencySelector } from '../dashboard/currency-selector'
import { EconomicOAuthDialog } from '../integrations/economic-oauth-dialog'

// Available platforms configuration
const availablePlatforms = [
  {
    name: 'E-conomic',
    key: 'economic',
    description: 'Sync your accounting data',
    icon: '🔗',
    color: 'bg-blue-500',
    available: true,
    comingSoon: false,
    features: ['Customer data', 'Invoice tracking', 'Revenue analytics'],
  },
  {
    name: 'Stripe',
    key: 'stripe',
    description: 'Connect your payment processor',
    icon: '💳',
    color: 'bg-purple-500',
    available: true,
    comingSoon: false,
    features: ['Payment data', 'Subscription tracking', 'Customer insights'],
  },
  {
    name: 'Shopify',
    key: 'shopify',
    description: 'E-commerce platform integration',
    icon: '🛒',
    color: 'bg-green-500',
    available: true,
    comingSoon: false,
    features: ['Order data', 'Customer profiles', 'Product analytics'],
  },
]

const statusConfig = {
  pending: {
    label: 'Pending',
    color: 'bg-yellow-100 text-yellow-800',
    icon: AlertCircle,
  },
  active: {
    label: 'Connected',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle,
  },
  error: {
    label: 'Error',
    color: 'bg-red-100 text-red-800',
    icon: XCircle,
  },
  syncing: {
    label: 'Syncing',
    color: 'bg-blue-100 text-blue-800',
    icon: RefreshCw,
  },
  inactive: {
    label: 'Paused',
    color: 'bg-yellow-100 text-yellow-800',
    icon: AlertCircle,
  },
  disconnected: {
    label: 'Disconnected',
    color: 'bg-gray-100 text-gray-800',
    icon: XCircle,
  },
}

interface Integration {
  id: number
  platform: string
  platform_name: string
  status:
    | 'pending'
    | 'active'
    | 'error'
    | 'syncing'
    | 'inactive'
    | 'disconnected'
  customer_count: number
  revenue: number
  last_sync_at: string | null
}

interface StripeCredentials {
  secret_key: string
}

export function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('DKK')
  const [autoSync, setAutoSync] = useState(true)
  const [syncFrequency, setSyncFrequency] = useState('15')
  const [isEconomicDialogOpen, setIsEconomicDialogOpen] = useState(false)
  const [isStripeDialogOpen, setIsStripeDialogOpen] = useState(false)
  const [stripeCredentials, setStripeCredentials] = useState<StripeCredentials>(
    {
      secret_key: '',
    }
  )
  const [isConnecting, setIsConnecting] = useState(false)
  const [isSyncing, setIsSyncing] = useState<Record<number, boolean>>({})
  const [isSavingSettings, setIsSavingSettings] = useState(false)
  const [disconnectDialog, setDisconnectDialog] = useState<{
    isOpen: boolean
    integration: Integration | null
    action: 'disconnect' | 'remove'
  }>({
    isOpen: false,
    integration: null,
    action: 'disconnect',
  })

  const loadSyncSettings = async () => {
    try {
      // First check if we can get user sync settings
      const response = await integrationsApi.getSyncSettings()
      if (response.data.success) {
        const settings = response.data.data
        setAutoSync(settings.auto_sync ?? true)
        setSyncFrequency(settings.sync_frequency?.toString() ?? '15')
      }
    } catch (err: any) {
      console.log('No sync settings found, using defaults')
      // Use defaults if no settings found
    }
  }

  const loadIntegrations = useCallback(async () => {
    try {
      const response = await integrationsApi.getAll({
        currency: selectedCurrency,
      })

      if (response.data.success) {
        setIntegrations(response.data.data)
        setError('') // Clear any previous errors
      } else {
        console.error('API returned unsuccessful response:', response.data)
        setError(
          'Failed to load integrations: API returned unsuccessful response'
        )
      }
    } catch (err: any) {
      console.error('Failed to load integrations:', err)
      setError(
        'Failed to load integrations: ' +
          (err.response?.data?.message || err.message)
      )
    } finally {
      setLoading(false)
    }
  }, [selectedCurrency])

  useEffect(() => {
    loadIntegrations()
    loadSyncSettings()
  }, [loadIntegrations])

  const handleSyncNow = async (integrationId: number) => {
    setIsSyncing((prev) => ({ ...prev, [integrationId]: true }))
    setError('') // Clear any previous errors
    try {
      const response = await integrationsApi.sync(integrationId.toString())
      if (response.data.success) {
        // Wait a moment for the sync to start, then refresh
        setTimeout(() => {
          loadIntegrations()
        }, 1000)
      } else {
        setError(response.data.message || 'Sync failed. Please try again.')
      }
    } catch (err: any) {
      console.error('Sync failed:', err)
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'Sync failed. Please try again.'
      setError(errorMessage)

      // If it's a MAC validation error, suggest reconnection
      if (
        errorMessage.includes('MAC is invalid') ||
        errorMessage.includes('Invalid signature')
      ) {
        setError(
          'Authentication failed. Please reconnect your account to refresh credentials.'
        )
      }
    } finally {
      setIsSyncing((prev) => ({ ...prev, [integrationId]: false }))
    }
  }

  const handleDisconnectClick = (
    integration: Integration,
    action: 'disconnect' | 'remove'
  ) => {
    setDisconnectDialog({
      isOpen: true,
      integration,
      action,
    })
  }

  const handleDisconnectConfirm = async () => {
    if (!disconnectDialog.integration) return

    try {
      if (disconnectDialog.action === 'remove') {
        // For remove, we delete the integration completely
        await integrationsApi.delete(disconnectDialog.integration.id.toString())
      } else {
        // For disconnect, we just disconnect it (preserves data)
        await integrationsApi.disconnect(
          disconnectDialog.integration.id.toString()
        )
      }

      await loadIntegrations() // Refresh the list
      setDisconnectDialog({
        isOpen: false,
        integration: null,
        action: 'disconnect',
      })
    } catch (err: any) {
      console.error('Operation failed:', err)
      setError(
        `Failed to ${disconnectDialog.action} integration. Please try again.`
      )
    }
  }

  const handleReconnect = (platform: string) => {
    if (platform === 'economic') {
      setIsEconomicDialogOpen(true)
    } else if (platform === 'stripe') {
      setIsStripeDialogOpen(true)
    }
  }

  const handleEconomicOAuthSuccess = () => {
    loadIntegrations() // Refresh the integrations list
  }

  const handleStripeConnect = async () => {
    setIsConnecting(true)
    setError('') // Clear any previous errors
    try {
      const response = await integrationsApi.create({
        platform: 'stripe',
        platform_name: 'Stripe',
        credentials: stripeCredentials,
      })

      if (response.data.success) {
        setIsStripeDialogOpen(false)
        setStripeCredentials({ secret_key: '' })
        await loadIntegrations()
      } else {
        setError(
          response.data.message ||
            'Failed to connect Stripe. Please check your credentials.'
        )
      }
    } catch (err: any) {
      console.error('Stripe connection failed:', err)
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'Failed to connect Stripe. Please check your credentials.'
      setError(errorMessage)
    } finally {
      setIsConnecting(false)
    }
  }

  const handleSaveSyncSettings = async () => {
    setIsSavingSettings(true)
    try {
      await integrationsApi.updateSyncSettings({
        auto_sync: autoSync,
        sync_frequency: parseInt(syncFrequency),
      })
    } catch (err: any) {
      console.error('Failed to save sync settings:', err)
      setError('Failed to save sync settings. Please try again.')
    } finally {
      setIsSavingSettings(false)
    }
  }

  // Calculate totals
  const connectedIntegrations = integrations.filter(
    (integration) => integration.status === 'active'
  )
  const totalCustomers = integrations.reduce(
    (sum, integration) => sum + (integration.customer_count || 0),
    0
  )
  const totalRevenue = integrations.reduce(
    (sum, integration) => sum + (integration.revenue || 0),
    0
  )

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <Loader2 className='h-8 w-8 animate-spin' />
      </div>
    )
  }

  return (
    <div className='p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6'>
      {/* Responsive Header */}
      <div className='flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 gap-4'>
        <div>
          <h1 className='text-xl sm:text-2xl md:text-3xl font-bold text-foreground'>
            Platform Integrations
          </h1>
          <p className='text-muted-foreground text-sm sm:text-base'>
            Connect your revenue sources
          </p>
        </div>
        <div className='flex flex-col sm:flex-row items-stretch sm:items-center gap-3'>
          <CurrencySelector
            currentCurrency={selectedCurrency}
            onCurrencyChange={setSelectedCurrency}
          />
          <Button variant='outline' size='sm' onClick={loadIntegrations}>
            <RefreshCw className='mr-2 h-4 w-4' />
            Refresh
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert className='border-red-200 bg-red-50'>
          <AlertCircle className='h-4 w-4 text-red-600' />
          <AlertDescription className='text-red-700'>{error}</AlertDescription>
        </Alert>
      )}

      {/* Overview - Responsive grid */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4'>
        <Card>
          <CardContent className='p-4 sm:p-6'>
            <div className='flex items-center space-x-3'>
              <Link2 className='h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0' />
              <div className='min-w-0 flex-1'>
                <p className='text-xs sm:text-sm text-muted-foreground'>
                  Connected Platforms
                </p>
                <p className='text-base sm:text-lg lg:text-2xl font-bold'>
                  {connectedIntegrations.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4 sm:p-6'>
            <div className='flex items-center space-x-3'>
              <Users className='h-4 w-4 sm:h-5 sm:w-5 text-green-600 flex-shrink-0' />
              <div className='min-w-0 flex-1'>
                <p className='text-xs sm:text-sm text-muted-foreground'>
                  Total Customers
                </p>
                <p className='text-base sm:text-lg lg:text-2xl font-bold'>
                  {totalCustomers.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4 sm:p-6'>
            <div className='flex items-center space-x-3'>
              <DollarSign className='h-4 w-4 sm:h-5 sm:w-5 text-purple-600 flex-shrink-0' />
              <div className='min-w-0 flex-1'>
                <p className='text-xs sm:text-sm text-muted-foreground'>
                  Total MRR
                </p>
                <p className='text-base sm:text-lg lg:text-2xl font-bold'>
                  {formatCurrency(totalRevenue, selectedCurrency)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Integrations Grid */}
      <div>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6'>
          {availablePlatforms.map((platform) => {
            const existingIntegration = integrations.find(
              (i) =>
                i.platform === platform.key ||
                i.platform_name
                  .toLowerCase()
                  .includes(platform.name.toLowerCase())
            )

            return (
              <Card key={platform.key} className='relative overflow-hidden'>
                <CardHeader className='pb-4'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center space-x-3'>
                      <div
                        className={`w-10 h-10 ${platform.color} rounded-lg flex items-center justify-center text-white text-lg font-bold`}
                      >
                        {platform.icon}
                      </div>
                      <div className='min-w-0 flex-1'>
                        <CardTitle className='text-base sm:text-lg'>
                          {platform.name}
                        </CardTitle>
                        <p className='text-xs sm:text-sm text-muted-foreground truncate'>
                          {platform.description}
                        </p>
                      </div>
                    </div>
                    {existingIntegration && (
                      <Badge
                        className={
                          statusConfig[existingIntegration.status]?.color ||
                          'bg-gray-100 text-gray-800'
                        }
                      >
                        {statusConfig[existingIntegration.status]?.label ||
                          existingIntegration.status}
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className='space-y-4'>
                  {existingIntegration &&
                    existingIntegration.status !== 'disconnected' && (
                      <div className='space-y-2 text-sm'>
                        <div className='flex justify-between items-center'>
                          <span className='text-sm font-medium'>Status:</span>
                          <span className='text-sm text-gray-600'>
                            {statusConfig[existingIntegration.status]?.label}
                          </span>
                        </div>
                        <div className='flex justify-between items-center'>
                          <span className='text-sm font-medium'>
                            Customers:
                          </span>
                          <span className='text-sm text-gray-600'>
                            {existingIntegration.customer_count || 0}
                          </span>
                        </div>
                        <div className='flex justify-between items-center'>
                          <span className='text-sm font-medium'>MRR:</span>
                          <span className='text-sm text-gray-600'>
                            {formatCurrency(
                              existingIntegration.revenue || 0,
                              selectedCurrency
                            )}
                          </span>
                        </div>
                        {existingIntegration.last_sync_at && (
                          <div className='flex justify-between items-center'>
                            <span className='text-sm font-medium'>
                              Last Sync:
                            </span>
                            <span className='text-sm text-gray-600'>
                              {new Date(
                                existingIntegration.last_sync_at
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                  {(!existingIntegration ||
                    existingIntegration.status === 'disconnected') && (
                    <>
                      {platform.available &&
                        !platform.comingSoon &&
                        platform.name === 'E-conomic' && (
                          <Button
                            className='w-full'
                            onClick={() => setIsEconomicDialogOpen(true)}
                          >
                            <Plus className='mr-2 h-4 w-4' />
                            {existingIntegration?.status === 'disconnected'
                              ? 'Reconnect'
                              : 'Connect'}{' '}
                            E-conomic
                          </Button>
                        )}

                      {platform.available &&
                        !platform.comingSoon &&
                        platform.name === 'Stripe' && (
                          <Dialog
                            open={isStripeDialogOpen}
                            onOpenChange={setIsStripeDialogOpen}
                          >
                            <DialogTrigger asChild>
                              <Button className='w-full'>
                                <Plus className='mr-2 h-4 w-4' />
                                {existingIntegration?.status === 'disconnected'
                                  ? 'Reconnect'
                                  : 'Connect'}{' '}
                                Stripe
                              </Button>
                            </DialogTrigger>
                            <DialogContent className='!bg-white'>
                              <DialogHeader>
                                <DialogTitle>Connect Stripe</DialogTitle>
                                <DialogDescription>
                                  Enter your Stripe secret key to connect your
                                  account.
                                </DialogDescription>
                              </DialogHeader>
                              <div className='space-y-4'>
                                <div>
                                  <Label htmlFor='secret-key'>Secret Key</Label>
                                  <Input
                                    id='secret-key'
                                    type='password'
                                    value={stripeCredentials.secret_key}
                                    onChange={(e) =>
                                      setStripeCredentials({
                                        ...stripeCredentials,
                                        secret_key: e.target.value,
                                      })
                                    }
                                    placeholder='sk_test_... or sk_live_...'
                                  />
                                </div>
                                <div className='flex justify-end space-x-2'>
                                  <Button
                                    variant='outline'
                                    onClick={() => setIsStripeDialogOpen(false)}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    onClick={handleStripeConnect}
                                    disabled={
                                      isConnecting ||
                                      !stripeCredentials.secret_key
                                    }
                                  >
                                    {isConnecting ? (
                                      <>
                                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                        Connecting...
                                      </>
                                    ) : (
                                      'Connect'
                                    )}
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                      {platform.available &&
                        !platform.comingSoon &&
                        platform.name === 'Shopify' && (
                          <Button
                            className='w-full'
                            onClick={() =>
                              (window.location.href = '/integrations/shopify')
                            }
                          >
                            <Plus className='mr-2 h-4 w-4' />
                            {existingIntegration?.status === 'disconnected'
                              ? 'Reconnect'
                              : 'Connect'}{' '}
                            {platform.name}
                          </Button>
                        )}
                      {platform.comingSoon && (
                        <Button disabled className='w-full'>
                          <ExternalLink className='mr-2 h-4 w-4' />
                          Coming Soon
                        </Button>
                      )}
                    </>
                  )}

                  {existingIntegration &&
                    existingIntegration.status !== 'disconnected' && (
                      <div className='space-y-2'>
                        {/* Special handling for Shopify - show Manage button */}
                        {platform.name === 'Shopify' ? (
                          <Button
                            className='w-full'
                            onClick={() =>
                              (window.location.href = '/integrations/shopify')
                            }
                          >
                            <Settings className='mr-2 h-4 w-4' />
                            Manage Shopify
                          </Button>
                        ) : (
                          <Button
                            variant='outline'
                            size='sm'
                            className='w-full'
                            onClick={() =>
                              handleSyncNow(existingIntegration.id)
                            }
                            disabled={
                              isSyncing[existingIntegration.id] ||
                              existingIntegration.status === 'syncing'
                            }
                          >
                            {isSyncing[existingIntegration.id] ||
                            existingIntegration.status === 'syncing' ? (
                              <>
                                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                Syncing...
                              </>
                            ) : (
                              <>
                                <RefreshCw className='mr-2 h-4 w-4' />
                                Sync Now
                              </>
                            )}
                          </Button>
                        )}

                        <div className='flex flex-col space-y-2 mt-3'>
                          {/* Show Sync button for Shopify in the secondary area */}
                          {platform.name === 'Shopify' && (
                            <Button
                              variant='outline'
                              size='sm'
                              className='w-full'
                              onClick={() =>
                                handleSyncNow(existingIntegration.id)
                              }
                              disabled={
                                isSyncing[existingIntegration.id] ||
                                existingIntegration.status === 'syncing'
                              }
                            >
                              {isSyncing[existingIntegration.id] ||
                              existingIntegration.status === 'syncing' ? (
                                <>
                                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                  Syncing...
                                </>
                              ) : (
                                <>
                                  <RefreshCw className='mr-2 h-4 w-4' />
                                  Sync Now
                                </>
                              )}
                            </Button>
                          )}
                          <Button
                            variant='ghost'
                            size='sm'
                            className='text-orange-600 hover:text-orange-700 hover:bg-orange-50'
                            onClick={() =>
                              handleDisconnectClick(
                                existingIntegration,
                                'disconnect'
                              )
                            }
                            disabled={isSyncing[existingIntegration.id]}
                          >
                            <Unplug className='mr-1 h-4 w-4' />
                            Disconnect
                          </Button>
                          <Button
                            variant='ghost'
                            size='sm'
                            className='text-red-600 hover:text-red-700 hover:bg-red-50'
                            onClick={() =>
                              handleDisconnectClick(
                                existingIntegration,
                                'remove'
                              )
                            }
                            disabled={isSyncing[existingIntegration.id]}
                          >
                            <XCircle className='mr-1 h-4 w-4' />
                            Remove & Add New
                          </Button>
                        </div>
                      </div>
                    )}

                  {existingIntegration &&
                    existingIntegration.status === 'disconnected' && (
                      <div className='space-y-2'>
                        <Button
                          className='w-full'
                          onClick={() =>
                            handleReconnect(existingIntegration.platform)
                          }
                        >
                          <Link2 className='mr-2 h-4 w-4' />
                          Reconnect
                        </Button>
                        <p className='text-xs text-gray-500 text-center'>
                          Your historical data is preserved
                        </p>
                      </div>
                    )}

                  {existingIntegration &&
                    existingIntegration.status === 'error' && (
                      <div className='space-y-2'>
                        <div className='bg-red-50 border border-red-200 rounded-lg p-3 mb-3'>
                          <div className='flex items-start space-x-2'>
                            <XCircle className='w-4 h-4 text-red-600 mt-0.5 flex-shrink-0' />
                            <div>
                              <p className='text-red-800 font-medium text-sm'>
                                Connection Error
                              </p>
                              <p className='text-red-600 text-xs mt-1'>
                                Unable to connect to your account. Please check
                                your credentials and try reconnecting.
                              </p>
                            </div>
                          </div>
                        </div>
                        <Button
                          className='w-full'
                          variant='outline'
                          onClick={() =>
                            handleReconnect(existingIntegration.platform)
                          }
                        >
                          <RefreshCw className='mr-2 h-4 w-4' />
                          Fix Connection
                        </Button>
                        <p className='text-xs text-gray-500 text-center'>
                          Re-enter your credentials to restore connection
                        </p>
                      </div>
                    )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* E-conomic OAuth Dialog */}
      <EconomicOAuthDialog
        isOpen={isEconomicDialogOpen}
        onClose={() => setIsEconomicDialogOpen(false)}
        onSuccess={handleEconomicOAuthSuccess}
      />

      {/* Disconnect/Remove Confirmation Dialog */}
      <AlertDialog
        open={disconnectDialog.isOpen}
        onOpenChange={(open) =>
          !open &&
          setDisconnectDialog({
            isOpen: false,
            integration: null,
            action: 'disconnect',
          })
        }
      >
        <AlertDialogContent className='!bg-white'>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {disconnectDialog.action === 'remove'
                ? 'Remove Integration'
                : 'Disconnect Integration'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {disconnectDialog.action === 'remove' ? (
                <>
                  Are you sure you want to <strong>permanently remove</strong>{' '}
                  your{' '}
                  <strong>{disconnectDialog.integration?.platform_name}</strong>{' '}
                  integration?
                  <br />
                  <br />
                  <span className='text-red-600 font-medium'>
                    ⚠️ This will delete all historical data and cannot be
                    undone.
                  </span>
                  <br />
                  You can add a new integration immediately after removal.
                </>
              ) : (
                <>
                  Are you sure you want to disconnect your{' '}
                  <strong>{disconnectDialog.integration?.platform_name}</strong>{' '}
                  integration?
                  <br />
                  <br />
                  <span className='text-green-600 font-medium'>
                    ✓ Your historical data will be preserved.
                  </span>
                  <br />
                  No new data will be synced until you reconnect.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDisconnectConfirm}
              className={
                disconnectDialog.action === 'remove'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-orange-600 hover:bg-orange-700'
              }
            >
              {disconnectDialog.action === 'remove'
                ? 'Remove Integration'
                : 'Disconnect'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
