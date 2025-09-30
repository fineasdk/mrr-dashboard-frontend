import { useState } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog'
import { Alert, AlertDescription } from '../ui/alert'
import { Loader2, ExternalLink, AlertCircle } from 'lucide-react'
import { api } from '../../lib/api'

interface EconomicOAuthDialogProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function EconomicOAuthDialog({
  isOpen,
  onClose,
  onSuccess,
}: EconomicOAuthDialogProps) {
  const [step, setStep] = useState<'instructions' | 'token'>('instructions')
  const [grantToken, setGrantToken] = useState('')
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState('')
  const [oauthUrl, setOauthUrl] = useState('')

  const handleStartOAuth = async () => {
    try {
      const response = await api.get('/economic/oauth-url')
      if (response.data.success) {
        setOauthUrl(response.data.oauth_url)
        // Open OAuth URL in new tab (same as Fineas)
        window.open(response.data.oauth_url, '_blank')
        setStep('token')
        setError('')
      } else {
        setError('Failed to get OAuth URL. Please try again.')
      }
    } catch (err: any) {
      console.error('Failed to get OAuth URL:', err)
      setError(
        'Failed to get OAuth URL: ' +
          (err.response?.data?.message || err.message)
      )
    }
  }

  const handleCompleteOAuth = async () => {
    if (!grantToken || grantToken.length < 26 || grantToken.length > 50) {
      setError('Please enter a valid grant token (26-50 characters).')
      return
    }

    setIsConnecting(true)
    setError('')

    try {
      const response = await api.post('/economic/oauth-complete', {
        grant_token: grantToken,
        platform_name: 'E-conomic',
      })

      if (response.data.success) {
        onSuccess()
        onClose()
        // Reset state
        setStep('instructions')
        setGrantToken('')
        setError('')
      } else {
        setError(
          response.data.message ||
            'Failed to connect E-conomic. Please try again.'
        )
      }
    } catch (err: any) {
      console.error('E-conomic OAuth failed:', err)
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'Failed to connect E-conomic. Please try again.'
      setError(errorMessage)
    } finally {
      setIsConnecting(false)
    }
  }

  const handleClose = () => {
    onClose()
    // Reset state when closing
    setStep('instructions')
    setGrantToken('')
    setError('')
    setOauthUrl('')
  }

  const handleRetry = () => {
    setStep('instructions')
    setGrantToken('')
    setError('')
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Connect E-conomic</DialogTitle>
          <DialogDescription>
            {step === 'instructions'
              ? 'Follow these steps to connect your E-conomic account'
              : 'Enter the grant token from E-conomic'}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className='p-6 pt-0'>
            <Alert className='border-red-200 bg-red-50'>
              <AlertCircle className='h-4 w-4 text-red-600' />
              <AlertDescription className='text-red-700'>
                {error}
              </AlertDescription>
            </Alert>
          </div>
        )}

        {step === 'instructions' && (
          <div className='p-6 space-y-6'>
            <div className='space-y-3'>
              <h4 className='font-semibold text-gray-900'>Option 1: Automatic Authorization</h4>
              <p className='text-sm text-gray-600'>
                Click the button below to open E-conomic in a new tab and
                authorize our application to access your data.
              </p>
              <Button
                onClick={handleStartOAuth}
                className='w-full btn-primary'
                disabled={isConnecting}
              >
                <ExternalLink className='mr-2 h-4 w-4' />
                Open E-conomic Authorization
              </Button>
            </div>

            <div className='relative'>
              <div className='absolute inset-0 flex items-center'>
                <span className='w-full border-t border-gray-200' />
              </div>
              <div className='relative flex justify-center text-xs uppercase'>
                <span className='bg-white px-2 text-gray-500'>Or</span>
              </div>
            </div>

            <div className='space-y-3'>
              <h4 className='font-semibold text-gray-900'>Option 2: Manual Token Entry</h4>
              <p className='text-sm text-gray-600'>
                If you already have a grant token from E-conomic, you can skip
                the authorization step and enter it directly.
              </p>
              <Button variant='outline' onClick={() => setStep('token')} className='w-full'>
                I have the token
              </Button>
            </div>
          </div>
        )}

        {step === 'token' && (
          <div className='p-6 space-y-6'>
            <div className='space-y-3'>
              <Label htmlFor='grant-token' className='text-sm font-medium text-gray-700'>
                Grant Token <span className='text-red-500'>*</span>
              </Label>
              <Input
                id='grant-token'
                type='text'
                value={grantToken}
                onChange={(e) => setGrantToken(e.target.value)}
                placeholder='Enter the grant token (26-50 characters)'
                maxLength={50}
                className='font-mono'
              />
              <p className='text-xs text-gray-500'>
                The token should be between 26-50 characters long
              </p>
            </div>
          </div>
        )}

        <DialogFooter>
          {step === 'token' ? (
            <>
              <Button variant='outline' onClick={handleRetry}>
                Back
              </Button>
              <Button
                onClick={handleCompleteOAuth}
                disabled={
                  isConnecting ||
                  !grantToken ||
                  grantToken.length < 26 ||
                  grantToken.length > 50
                }
                className='btn-primary'
              >
                {isConnecting ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Connecting...
                  </>
                ) : (
                  'Connect E-conomic'
                )}
              </Button>
            </>
          ) : (
            <Button variant='outline' onClick={handleClose}>
              Cancel
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
