'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { integrationsApi } from '@/lib/api'

export default function EconomicCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the grant token from URL parameters
        const grantToken = searchParams.get('token') || searchParams.get('grant_token')
        
        if (!grantToken) {
          setStatus('error')
          setMessage('No grant token received from E-conomic. Please try again.')
          return
        }

        // Validate grant token format (should be 26 characters)
        if (grantToken.length !== 26) {
          setStatus('error')
          setMessage('Invalid grant token format received from E-conomic. Please try again.')
          return
        }

        // Complete the OAuth flow by sending the grant token to our API
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
        const response = await fetch(`${apiBaseUrl}/economic/oauth-complete`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          },
          body: JSON.stringify({
            grant_token: grantToken,
            platform_name: 'E-conomic',
          }),
        })

        const data = await response.json()

        if (data.success) {
          setStatus('success')
          setMessage('E-conomic integration connected successfully! Redirecting...')
          
          // Redirect to integrations page after 2 seconds
          setTimeout(() => {
            router.push('/integrations')
          }, 2000)
        } else {
          setStatus('error')
          setMessage(data.message || 'Failed to connect E-conomic integration.')
        }
      } catch (error) {
        console.error('OAuth callback error:', error)
        setStatus('error')
        setMessage('An error occurred while processing the OAuth callback.')
      }
    }

    handleCallback()
  }, [searchParams, router])

  const getIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      case 'success':
        return <CheckCircle className="h-12 w-12 text-green-600" />
      case 'error':
        return <XCircle className="h-12 w-12 text-red-600" />
    }
  }

  const getTitle = () => {
    switch (status) {
      case 'loading':
        return 'Processing E-conomic Authorization...'
      case 'success':
        return 'Integration Connected!'
      case 'error':
        return 'Connection Failed'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md !bg-white">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {getIcon()}
          </div>
          <CardTitle className="text-xl font-semibold">
            {getTitle()}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            {message}
          </p>
          
          {status === 'error' && (
            <div className="space-y-2">
              <Button
                onClick={() => router.push('/integrations')}
                className="w-full"
              >
                Back to Integrations
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
                className="w-full"
              >
                Try Again
              </Button>
            </div>
          )}
          
          {status === 'success' && (
            <p className="text-sm text-gray-500">
              You will be redirected automatically...
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
