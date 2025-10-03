'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  ShoppingBag,
  Info,
  Loader2,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
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

interface ShopifyIntegrationPageProps {
  onNavigateBack: () => void
}

export function ShopifyIntegrationPage({ onNavigateBack }: ShopifyIntegrationPageProps) {
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

          // Pre-populate form with existing credentials if available
          if (shopifyIntegration.credentials) {
            setFormData({
              partner_access_token: shopifyIntegration.credentials.partner_access_token || '',
              organization_id: shopifyIntegration.credentials.organization_id || '',
            })
          }

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
      // Always use the Shopify Partner endpoint for both create and update
      // The backend handles both cases with updateOrCreate
      const response = await api.post('/shopify/connect-partner', formData)

      if (response.data.success) {
        console.log(
          existingIntegration 
            ? 'Shopify Partner integration updated successfully:'
            : 'Shopify Partner integration created successfully:',
          response.data
        )

        // Get the integration ID for sync
        const integrationId = response.data.data?.integration_id

        // Trigger sync after successful connection/update
        if (integrationId) {
          try {
            await integrationsApi.sync(integrationId.toString())
            console.log('Sync triggered successfully')
          } catch (syncError) {
            console.warn('Failed to trigger sync:', syncError)
            // Don't fail the whole operation if sync fails
          }
        }

        onNavigateBack()
      } else {
        throw new Error(
          response.data.message ||
            `Failed to ${existingIntegration ? 'update' : 'create'} Shopify Partner integration`
        )
      }
    } catch (error: any) {
      console.error('Shopify Partner integration failed:', error)

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        `Failed to ${existingIntegration ? 'update' : 'connect to'} Shopify Partners`
      setConnectionError(errorMessage)

      if (error.response?.status === 409) {
        onNavigateBack()
      }
    } finally {
      setIsConnecting(false)
    }
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <div className="layout-container section-padding">
          <div className="flex items-center justify-center py-12 animate-fade-in">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center animate-pulse">
                <ShoppingBag className="w-8 h-8 text-white" />
              </div>
              <p className="mt-4 text-slate-600">Loading integration status...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="layout-container section-padding space-y-6 sm:space-y-8">
        {/* Back Button */}
        <div className="animate-fade-in">
          <Button
            variant="ghost"
            onClick={onNavigateBack}
            className="mb-4 hover:bg-slate-100"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Integrations
          </Button>
        </div>

        {/* Header */}
        <div className="text-center space-y-4 animate-slide-down">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
              <ShoppingBag className="w-10 h-10 text-white" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent">
              {existingIntegration && existingIntegration.status === 'error'
                ? 'Fix Shopify Partners Connection'
                : existingIntegration
                ? 'Update Shopify Partners Connection'
                : 'Connect Shopify Partners'}
            </h1>
            <p className="text-slate-600 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto">
              {existingIntegration && existingIntegration.status === 'error'
                ? 'Your Shopify Partner integration needs attention. Please update your credentials below.'
                : existingIntegration
                ? 'Update your Shopify Partner account credentials'
                : 'Connect your Shopify Partner account to access multiple stores and revenue data'}
            </p>
          </div>
        </div>

        {/* Existing Integration Status */}
        {existingIntegration && (
          <div className="card-elevated animate-scale-in">
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                    <ShoppingBag className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Current Integration Status</h3>
                    <p className="text-sm text-slate-600">Integration: {existingIntegration.platform_name}</p>
                  </div>
                </div>
                <Badge
                  className={
                    existingIntegration.status === 'active'
                      ? 'status-success'
                      : existingIntegration.status === 'error'
                      ? 'status-error'
                      : 'status-warning'
                  }
                >
                  {existingIntegration.status === 'active'
                    ? 'Connected'
                    : existingIntegration.status === 'error'
                    ? 'Connection Error'
                    : existingIntegration.status.charAt(0).toUpperCase() +
                      existingIntegration.status.slice(1)}
                </Badge>
              </div>
            </div>
            {existingIntegration.status === 'active' && (
              <div className="p-6">
                <p className="text-sm text-green-600 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Your Shopify Partner integration is working correctly
                </p>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Benefits Card */}
          <div className="card-elevated animate-scale-in delay-100">
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">What you&apos;ll get</h3>
              </div>
            </div>
            <div className="p-6">
              <ul className="space-y-3 text-sm text-slate-600">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Access multiple stores under your Partner account</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Track revenue and earnings across all partner apps</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Monitor app installations and performance</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Partner-specific analytics and transaction data</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Setup Instructions */}
          <div className="space-y-6">
            <Alert className="animate-scale-in delay-200">
              <Info className="w-4 h-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">Shopify Partner Setup Required</p>
                  <p className="text-sm">
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

            <Alert className="animate-scale-in delay-300">
              <Info className="w-4 h-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">Partner Revenue Tracking</p>
                  <p className="text-sm">
                    Our system will automatically track your Partner earnings, app
                    installations, and transaction data across all stores under your
                    Partner account. This provides comprehensive revenue analytics
                    for your Shopify Partner business.
                  </p>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        </div>

        {/* Connection Form */}
        <div className="card-elevated animate-slide-up">
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Partner API Connection</h3>
                <p className="text-sm text-slate-600">
                  {existingIntegration 
                    ? 'Update your Shopify Partner API credentials' 
                    : 'Enter your Shopify Partner API credentials'}
                </p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <form onSubmit={onSubmit} noValidate className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="partner_access_token" className="text-sm font-medium text-slate-700">
                  Partner Access Token
                </Label>
                <Input
                  id="partner_access_token"
                  name="partner_access_token"
                  value={formData.partner_access_token}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      partner_access_token: e.target.value,
                    })
                  }
                  placeholder={existingIntegration ? "Enter new access token..." : "shpat_..."}
                  disabled={isConnecting}
                  type="password"
                  className="font-mono rounded-lg"
                />
                <p className="text-xs text-slate-500">
                  Find this in your Partner Dashboard → Settings → Partner API
                  clients → [Your API Client] → Access Token
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="organization_id" className="text-sm font-medium text-slate-700">Organization ID</Label>
                <Input
                  id="organization_id"
                  name="organization_id"
                  value={formData.organization_id}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      organization_id: e.target.value,
                    })
                  }
                  placeholder={existingIntegration ? "Enter new organization ID..." : "1234567"}
                  disabled={isConnecting}
                  className="font-mono rounded-lg"
                />
                <p className="text-xs text-slate-500">
                  Find this in your Partner Dashboard URL:
                  partners.shopify.com/[ORGANIZATION_ID]/...
                </p>
              </div>

              {connectionError && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <AlertDescription className="text-red-700">{connectionError}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full btn-primary py-4"
                disabled={isConnecting}
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {existingIntegration
                      ? 'Updating & Syncing...'
                      : 'Creating & Syncing...'}
                  </>
                ) : (
                  <>
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    {existingIntegration &&
                    existingIntegration.status === 'error'
                      ? 'Fix & Sync Connection'
                      : existingIntegration
                      ? 'Update & Sync Integration'
                      : 'Create & Sync Integration'}
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>

        {/* Shop Management - Only show if integration exists and is active */}
        {existingIntegration && existingIntegration.status === 'active' && (
          <div className="animate-slide-up delay-200">
            <ShopifyShopsManager integrationId={existingIntegration.id} />
          </div>
        )}

        {/* Security Notice */}
        <Alert className="animate-fade-in delay-300">
          <Info className="w-4 h-4" />
          <AlertDescription>
            <div className="space-y-1">
              <p className="font-medium text-sm">Security & Privacy</p>
              <p className="text-sm">
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
