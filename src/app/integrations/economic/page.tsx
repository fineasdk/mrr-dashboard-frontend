'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Building2,
  Key,
  CheckCircle,
  AlertCircle,
  Loader2,
  ExternalLink,
  ArrowLeft,
  Info,
  Shield,
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
import { integrationsApi } from '@/lib/api'

const economicCredentialsSchema = z.object({
  app_secret_token: z
    .string()
    .min(10, 'App Secret Token must be at least 10 characters')
    .trim(),
  agreement_grant_token: z
    .string()
    .min(10, 'Agreement Grant Token must be at least 10 characters')
    .trim(),
})

type EconomicCredentialsForm = z.infer<typeof economicCredentialsSchema>

export default function EconomicIntegrationPage() {
  const router = useRouter()
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<
    'idle' | 'testing' | 'success' | 'error'
  >('idle')
  const [connectionError, setConnectionError] = useState<string | null>(null)

  const form = useForm<EconomicCredentialsForm>({
    resolver: zodResolver(economicCredentialsSchema),
    defaultValues: {
      app_secret_token: '',
      agreement_grant_token: '',
    },
  })

  const onSubmit = async (data: EconomicCredentialsForm) => {
    setIsConnecting(true)
    setConnectionStatus('testing')
    setConnectionError(null)

    try {
      const response = await integrationsApi.create({
        platform: 'economic',
        platform_name: 'E-conomic Integration',
        credentials: data,
      })

      if (response.data.success) {
        setConnectionStatus('success')
        setTimeout(() => {
          router.push('/integrations')
        }, 2000)
      } else {
        throw new Error(
          response.data.message || 'Failed to connect to E-conomic'
        )
      }
    } catch (error: any) {
      console.error('E-conomic connection failed:', error)
      setConnectionStatus('error')
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Failed to connect to E-conomic'
      setConnectionError(errorMessage)
    } finally {
      setIsConnecting(false)
    }
  }

  if (connectionStatus === 'success') {
    return (
      <div className='max-w-2xl mx-auto p-6'>
        <Card className='text-center'>
          <CardContent className='pt-6'>
            <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <CheckCircle className='w-8 h-8 text-green-600' />
            </div>
            <h1 className='text-2xl font-bold text-gray-900 mb-2'>
              E-conomic Connected Successfully!
            </h1>
            <p className='text-gray-600 mb-4'>
              Your E-conomic account has been connected and we're now syncing
              your customer and invoice data.
            </p>
            <Badge className='bg-green-100 text-green-800'>
              Initial sync in progress...
            </Badge>
            <p className='text-sm text-gray-500 mt-4'>
              Redirecting to integrations page...
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className='container mx-auto py-8 px-4 max-w-4xl'>
      <div className='space-y-6'>
        {/* Header */}
        <div className='flex items-center space-x-4'>
          <Button variant='ghost' onClick={() => router.back()} className='p-2'>
            <ArrowLeft className='w-4 h-4' />
          </Button>
          <div className='flex items-center space-x-3'>
            <div className='w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center'>
              <Building2 className='w-6 h-6 text-blue-600' />
            </div>
            <div>
              <h1 className='text-3xl font-bold text-gray-900'>
                Connect E-conomic
              </h1>
              <p className='text-gray-600'>
                Sync your Danish accounting data for comprehensive MRR tracking
              </p>
            </div>
          </div>
        </div>

        {/* Benefits Card */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-lg'>
              <CheckCircle className='w-5 h-5 text-green-600' />
              What you'll get with E-conomic integration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <ul className='space-y-2 text-sm text-gray-600'>
                <li className='flex items-start gap-2'>
                  <CheckCircle className='w-4 h-4 text-green-600 mt-0.5 flex-shrink-0' />
                  <span>Automatic customer data synchronization</span>
                </li>
                <li className='flex items-start gap-2'>
                  <CheckCircle className='w-4 h-4 text-green-600 mt-0.5 flex-shrink-0' />
                  <span>Real-time invoice and payment tracking</span>
                </li>
                <li className='flex items-start gap-2'>
                  <CheckCircle className='w-4 h-4 text-green-600 mt-0.5 flex-shrink-0' />
                  <span>Multi-currency support (DKK, EUR, USD)</span>
                </li>
              </ul>
              <ul className='space-y-2 text-sm text-gray-600'>
                <li className='flex items-start gap-2'>
                  <CheckCircle className='w-4 h-4 text-green-600 mt-0.5 flex-shrink-0' />
                  <span>Subscription revenue recognition</span>
                </li>
                <li className='flex items-start gap-2'>
                  <CheckCircle className='w-4 h-4 text-green-600 mt-0.5 flex-shrink-0' />
                  <span>Automated MRR calculations</span>
                </li>
                <li className='flex items-start gap-2'>
                  <CheckCircle className='w-4 h-4 text-green-600 mt-0.5 flex-shrink-0' />
                  <span>Comprehensive financial reporting</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* App Setup Instructions */}
        <Alert>
          <Info className='w-4 h-4' />
          <AlertDescription>
            <div className='space-y-2'>
              <p className='font-medium'>API Access Required</p>
              <p className='text-sm'>
                To connect E-conomic, you need API credentials from your
                <a
                  href='https://secure.e-conomic.com'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-blue-600 hover:underline ml-1'
                >
                  E-conomic account
                </a>
                . Contact your E-conomic administrator or developer to obtain
                these credentials.
              </p>
            </div>
          </AlertDescription>
        </Alert>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          {/* Connection Form */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center space-x-2'>
                <Key className='w-5 h-5' />
                <span>API Credentials</span>
              </CardTitle>
              <CardDescription>
                Enter your E-conomic API credentials to establish the connection
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className='space-y-4'
              >
                <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
                  <div className='flex items-start space-x-3'>
                    <Shield className='w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0' />
                    <div>
                      <h3 className='font-medium text-blue-800'>
                        Secure & Encrypted
                      </h3>
                      <p className='text-blue-600 text-sm'>
                        Your API credentials are encrypted and stored securely.
                        We only access data necessary for MRR calculations.
                      </p>
                    </div>
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='app_secret_token'>App Secret Token *</Label>
                  <Input
                    id='app_secret_token'
                    {...form.register('app_secret_token')}
                    placeholder='Your E-conomic App Secret Token'
                    disabled={isConnecting}
                    type='password'
                    className='font-mono'
                  />
                  {form.formState.errors.app_secret_token && (
                    <p className='text-sm text-red-600'>
                      {form.formState.errors.app_secret_token.message}
                    </p>
                  )}
                  <p className='text-sm text-gray-500'>
                    Find this in your E-conomic developer settings or contact
                    your administrator
                  </p>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='agreement_grant_token'>
                    Agreement Grant Token *
                  </Label>
                  <Input
                    id='agreement_grant_token'
                    {...form.register('agreement_grant_token')}
                    placeholder='Your Agreement Grant Token'
                    disabled={isConnecting}
                    type='password'
                    className='font-mono'
                  />
                  {form.formState.errors.agreement_grant_token && (
                    <p className='text-sm text-red-600'>
                      {form.formState.errors.agreement_grant_token.message}
                    </p>
                  )}
                  <p className='text-sm text-gray-500'>
                    This token grants access to your specific E-conomic
                    agreement
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
                      {connectionStatus === 'testing'
                        ? 'Testing connection...'
                        : 'Connecting...'}
                    </>
                  ) : (
                    <>
                      <Building2 className='mr-2 h-4 w-4' />
                      Connect E-conomic
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Setup Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>How to Get API Credentials</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-3'>
                <div className='flex items-start space-x-3'>
                  <div className='w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5'>
                    <span className='text-blue-600 text-sm font-medium'>1</span>
                  </div>
                  <div>
                    <p className='font-medium'>Access E-conomic</p>
                    <p className='text-sm text-gray-600'>
                      Log in to your{' '}
                      <a
                        href='https://secure.e-conomic.com'
                        target='_blank'
                        rel='noopener noreferrer'
                        className='text-blue-600 hover:underline inline-flex items-center'
                      >
                        E-conomic account{' '}
                        <ExternalLink className='w-3 h-3 ml-1' />
                      </a>
                    </p>
                  </div>
                </div>

                <div className='flex items-start space-x-3'>
                  <div className='w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5'>
                    <span className='text-blue-600 text-sm font-medium'>2</span>
                  </div>
                  <div>
                    <p className='font-medium'>Navigate to API Settings</p>
                    <p className='text-sm text-gray-600'>
                      Go to Settings → Integrations → API or contact your
                      E-conomic administrator
                    </p>
                  </div>
                </div>

                <div className='flex items-start space-x-3'>
                  <div className='w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5'>
                    <span className='text-blue-600 text-sm font-medium'>3</span>
                  </div>
                  <div>
                    <p className='font-medium'>Create API App</p>
                    <p className='text-sm text-gray-600'>
                      Create a new API application if you haven't already, or
                      use existing credentials
                    </p>
                  </div>
                </div>

                <div className='flex items-start space-x-3'>
                  <div className='w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5'>
                    <span className='text-blue-600 text-sm font-medium'>4</span>
                  </div>
                  <div>
                    <p className='font-medium'>Copy Credentials</p>
                    <p className='text-sm text-gray-600'>
                      Copy both the App Secret Token and Agreement Grant Token
                    </p>
                  </div>
                </div>

                <div className='flex items-start space-x-3'>
                  <div className='w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5'>
                    <span className='text-blue-600 text-sm font-medium'>5</span>
                  </div>
                  <div>
                    <p className='font-medium'>Test Connection</p>
                    <p className='text-sm text-gray-600'>
                      Paste the credentials and test the connection
                    </p>
                  </div>
                </div>
              </div>

              <Alert>
                <Info className='w-4 h-4' />
                <AlertDescription>
                  <div className='space-y-1'>
                    <p className='font-medium text-sm'>Need Help?</p>
                    <p className='text-sm'>
                      If you don't have access to API credentials, contact your
                      E-conomic administrator or check the{' '}
                      <a
                        href='https://restdocs.e-conomic.com/'
                        target='_blank'
                        rel='noopener noreferrer'
                        className='text-blue-600 hover:underline inline-flex items-center'
                      >
                        E-conomic API documentation{' '}
                        <ExternalLink className='w-3 h-3 ml-1' />
                      </a>
                    </p>
                  </div>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>

        {/* Connection Process Overview */}
        <Card>
          <CardHeader>
            <CardTitle className='text-lg'>
              What Happens After Connection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div className='text-center space-y-2'>
                <div className='w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto'>
                  <span className='text-blue-600 font-bold'>1</span>
                </div>
                <h3 className='font-medium'>Data Sync</h3>
                <p className='text-sm text-gray-600'>
                  We'll automatically sync your customer data and invoice
                  history
                </p>
              </div>
              <div className='text-center space-y-2'>
                <div className='w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto'>
                  <span className='text-blue-600 font-bold'>2</span>
                </div>
                <h3 className='font-medium'>MRR Calculation</h3>
                <p className='text-sm text-gray-600'>
                  Our system will identify subscription revenue and calculate
                  your MRR
                </p>
              </div>
              <div className='text-center space-y-2'>
                <div className='w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto'>
                  <span className='text-blue-600 font-bold'>3</span>
                </div>
                <h3 className='font-medium'>Analytics Ready</h3>
                <p className='text-sm text-gray-600'>
                  View comprehensive analytics and insights in your dashboard
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data & Privacy */}
        <Alert>
          <Shield className='w-4 h-4' />
          <AlertDescription>
            <div className='space-y-1'>
              <p className='font-medium text-sm'>Data Security & Privacy</p>
              <p className='text-sm'>
                We only access the minimum data required for MRR calculations.
                Your financial data is encrypted in transit and at rest. We
                never store sensitive payment information or bank details. You
                can disconnect at any time.
              </p>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  )
}
