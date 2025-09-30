'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  ShoppingBag,
  Info,
  Loader2,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { api, integrationsApi } from '@/lib/api'
import { ShopifyShopsManager } from '@/components/integrations/shopify-shops-manager'
// Toast functionality will be added later

interface ShopifyPartnerFormData {
  partner_access_token: string
  organization_id: string
}

interface ExistingIntegration {
  id: number
  platform: string
  platform_name: string
  status: 'pending' | 'active' | 'error' | 'syncing' | 'disconnected'
  last_sync_error?: {
    message: string
    occurred_at: string
  }
}

export default function ShopifyIntegrationPage() {
  const router = useRouter()
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [existingIntegration, setExistingIntegration] =
    useState<ExistingIntegration | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Partner API form data
  const [formData, setFormData] = useState<ShopifyPartnerFormData>({
    partner_access_token: '',
    organization_id: '',
  })

  // Check for existing integration
  useEffect(() => {
    const checkExistingIntegration = async () => {
      try {
        const response = await integrationsApi.getAll()
        const shopifyIntegration = response.data.data?.find(
          (integration: any) => integration.platform === 'shopify'
        )

        if (shopifyIntegration) {
          setExistingIntegration(shopifyIntegration)

          // If integration has error, show the error message
          if (shopifyIntegration.status === 'error') {
            setConnectionError(
              shopifyIntegration.last_sync_error?.message ||
                'Connection failed. Please check your credentials and try again.'
            )
          }
        }
      } catch (error) {
        console.error('Failed to check existing integration:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkExistingIntegration()
  }, [])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsConnecting(true)
    setConnectionError(null)

    // Partner API validation
    if (!formData.partner_access_token?.trim()) {
      setConnectionError('Partner access token is required')
      setIsConnecting(false)
      return
    }

    if (!formData.organization_id?.trim()) {
      setConnectionError('Organization ID is required')
      setIsConnecting(false)
      return
    }

    try {
      const response = await api.post('/shopify/connect-partner', formData)

      if (response.data.success) {
        console.log(
          'Shopify Partner integration created successfully:',
          response.data
        )
        router.push('/integrations?shopify=connected')
      } else {
        throw new Error(
          response.data.message ||
            'Failed to create Shopify Partner integration'
        )
      }
    } catch (error: any) {
      console.error('Shopify Partner integration failed:', error)

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Failed to connect to Shopify Partners'
      setConnectionError(errorMessage)

      if (error.response?.status === 409) {
        router.push('/integrations')
      }
    } finally {
      setIsConnecting(false)
    }
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className='container mx-auto py-8 px-4 max-w-2xl'>
        <div className='flex justify-center items-center py-12'>
          <Loader2 className='w-8 h-8 animate-spin text-gray-400' />
          <span className='ml-2 text-gray-600'>
            Loading integration status...
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className='container mx-auto py-8 px-4 max-w-2xl'>
      <div className='space-y-6'>
        {/* Header */}
        <div className='text-center space-y-2'>
          <div className='flex justify-center'>
            <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center'>
              <ShoppingBag className='w-8 h-8 text-green-600' />
            </div>
          </div>
          <h1 className='text-3xl font-bold text-gray-900'>
            {existingIntegration && existingIntegration.status === 'error'
              ? 'Fix Shopify Partners Connection'
              : existingIntegration
              ? 'Update Shopify Partners Connection'
              : 'Connect Shopify Partners'}
          </h1>
          <p className='text-gray-600'>
            {existingIntegration && existingIntegration.status === 'error'
              ? 'Your Shopify Partner integration needs attention. Please update your credentials below.'
              : existingIntegration
              ? 'Update your Shopify Partner account credentials'
              : 'Connect your Shopify Partner account to access multiple stores and revenue data'}
          </p>
        </div>

        {/* Existing Integration Status */}
        {existingIntegration && (
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <span>Current Integration Status</span>
                <Badge
                  variant={
                    existingIntegration.status === 'active'
                      ? 'default'
                      : 'destructive'
                  }
                  className={
                    existingIntegration.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : existingIntegration.status === 'error'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }
                >
                  {existingIntegration.status === 'active'
                    ? 'Connected'
                    : existingIntegration.status === 'error'
                    ? 'Connection Error'
                    : existingIntegration.status.charAt(0).toUpperCase() +
                      existingIntegration.status.slice(1)}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-sm text-gray-600'>
                Integration: {existingIntegration.platform_name}
              </p>
              {existingIntegration.status === 'active' && (
                <p className='text-sm text-green-600 mt-1'>
                  ✓ Your Shopify Partner integration is working correctly
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Benefits Card */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-lg'>
              <CheckCircle className='w-5 h-5 text-green-600' />
              What you&apos;ll get
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className='space-y-2 text-sm text-gray-600'>
              <li className='flex items-start gap-2'>
                <CheckCircle className='w-4 h-4 text-green-600 mt-0.5' />
                <span>Access multiple stores under your Partner account</span>
              </li>
              <li className='flex items-start gap-2'>
                <CheckCircle className='w-4 h-4 text-green-600 mt-0.5' />
                <span>Track revenue and earnings across all partner apps</span>
              </li>
              <li className='flex items-start gap-2'>
                <CheckCircle className='w-4 h-4 text-green-600 mt-0.5' />
                <span>Monitor app installations and performance</span>
              </li>
              <li className='flex items-start gap-2'>
                <CheckCircle className='w-4 h-4 text-green-600 mt-0.5' />
                <span>Partner-specific analytics and transaction data</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Setup Instructions */}
        <Alert>
          <Info className='w-4 h-4' />
          <AlertDescription>
            <div className='space-y-2'>
              <p className='font-medium'>Shopify Partner Setup Required</p>
              <p className='text-sm'>
                You need a <strong>Shopify Partner account</strong> with API
                access. Go to:{' '}
                <strong>
                  Partner Dashboard → Settings → Partner API clients → Create
                  API client
                </strong>
                . Then get your <strong>Access Token</strong> and{' '}
                <strong>Organization ID</strong>.
              </p>
            </div>
          </AlertDescription>
        </Alert>

        {/* Important Information */}
        <Alert>
          <Info className='w-4 h-4' />
          <AlertDescription>
            <div className='space-y-2'>
              <p className='font-medium'>Partner Revenue Tracking</p>
              <p className='text-sm'>
                Our system will automatically track your Partner earnings, app
                installations, and transaction data across all stores under your
                Partner account. This provides comprehensive revenue analytics
                for your Shopify Partner business.
              </p>
            </div>
          </AlertDescription>
        </Alert>

        {/* Connection Form */}
        <Card>
          <CardHeader>
            <CardTitle>Partner API Connection</CardTitle>
            <CardDescription>
              Enter your Shopify Partner API credentials
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} noValidate className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='partner_access_token'>
                  Partner Access Token
                </Label>
                <Input
                  id='partner_access_token'
                  name='partner_access_token'
                  value={formData.partner_access_token}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      partner_access_token: e.target.value,
                    })
                  }
                  placeholder='shpat_...'
                  disabled={isConnecting}
                  type='password'
                  className='font-mono'
                />

                <p className='text-sm text-gray-500'>
                  Find this in your Partner Dashboard → Settings → Partner API
                  clients → [Your API Client] → Access Token
                </p>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='organization_id'>Organization ID</Label>
                <Input
                  id='organization_id'
                  name='organization_id'
                  value={formData.organization_id}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      organization_id: e.target.value,
                    })
                  }
                  placeholder='1234567'
                  disabled={isConnecting}
                  className='font-mono'
                />

                <p className='text-sm text-gray-500'>
                  Find this in your Partner Dashboard URL:
                  partners.shopify.com/[ORGANIZATION_ID]/...
                </p>
              </div>

              {connectionError && (
                <Alert variant='destructive'>
                  <AlertCircle className='w-4 h-4' />
                  <AlertDescription>{connectionError}</AlertDescription>
                </Alert>
              )}

              <Button
                type='submit'
                className='w-full'
                disabled={isConnecting}
                size='lg'
              >
                {isConnecting ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    {existingIntegration
                      ? 'Updating Integration...'
                      : 'Creating Integration...'}
                  </>
                ) : (
                  <>
                    <ShoppingBag className='mr-2 h-4 w-4' />
                    {existingIntegration &&
                    existingIntegration.status === 'error'
                      ? 'Fix Connection'
                      : existingIntegration
                      ? 'Update Partner Integration'
                      : 'Create Partner Integration'}
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Process Overview */}
        <Card>
          <CardHeader>
            <CardTitle className='text-lg'>Connection Process</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              <div className='flex items-start gap-3'>
                <Badge variant='outline' className='mt-0.5'>
                  1
                </Badge>
                <div className='text-sm'>
                  <p className='font-medium'>Create Partner API Client</p>
                  <p className='text-gray-600'>
                    Set up API access in your Shopify Partner Dashboard
                  </p>
                </div>
              </div>
              <div className='flex items-start gap-3'>
                <Badge variant='outline' className='mt-0.5'>
                  2
                </Badge>
                <div className='text-sm'>
                  <p className='font-medium'>Get Credentials</p>
                  <p className='text-gray-600'>
                    Obtain your Partner Access Token and Organization ID
                  </p>
                </div>
              </div>
              <div className='flex items-start gap-3'>
                <Badge variant='outline' className='mt-0.5'>
                  3
                </Badge>
                <div className='text-sm'>
                  <p className='font-medium'>Enter Credentials</p>
                  <p className='text-gray-600'>
                    Provide your Partner API credentials in the form above
                  </p>
                </div>
              </div>
              <div className='flex items-start gap-3'>
                <Badge variant='outline' className='mt-0.5'>
                  4
                </Badge>
                <div className='text-sm'>
                  <p className='font-medium'>Test Connection</p>
                  <p className='text-gray-600'>
                    We&apos;ll verify your Partner API access
                  </p>
                </div>
              </div>
              <div className='flex items-start gap-3'>
                <Badge variant='outline' className='mt-0.5'>
                  5
                </Badge>
                <div className='text-sm'>
                  <p className='font-medium'>Data Synchronization</p>
                  <p className='text-gray-600'>
                    We&apos;ll sync your Partner revenue and app installation data
                  </p>
                </div>
              </div>
              <div className='flex items-start gap-3'>
                <Badge variant='outline' className='mt-0.5'>
                  6
                </Badge>
                <div className='text-sm'>
                  <p className='font-medium'>View Analytics</p>
                  <p className='text-gray-600'>
                    Access your Partner earnings dashboard with real data
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Shop Management - Only show if integration exists and is active */}
        {existingIntegration && existingIntegration.status === 'active' && (
          <ShopifyShopsManager integrationId={existingIntegration.id} />
        )}

        {/* Security Notice */}
        <Alert>
          <Info className='w-4 h-4' />
          <AlertDescription>
            <div className='space-y-1'>
              <p className='font-medium text-sm'>Security & Privacy</p>
              <p className='text-sm'>
                Your Partner API credentials are encrypted and stored securely.
                We only access the Partner data you authorize and never store
                sensitive payment information.
              </p>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  )
}
