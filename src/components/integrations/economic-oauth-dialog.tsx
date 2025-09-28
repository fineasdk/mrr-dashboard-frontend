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
    if (!grantToken || grantToken.length !== 26) {
      setError('Please enter a valid 26-character grant token.')
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
      <DialogContent className='sm:max-w-md !bg-white'>
        <DialogHeader>
          <DialogTitle>Connect E-conomic</DialogTitle>
          <DialogDescription>
            {step === 'instructions'
              ? 'Follow these steps to connect your E-conomic account'
              : 'Enter the grant token from E-conomic'}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert className='border-red-200 bg-red-50'>
            <AlertCircle className='h-4 w-4 text-red-600' />
            <AlertDescription className='text-red-700'>
              {error}
            </AlertDescription>
          </Alert>
        )}

        {step === 'instructions' && (
          <div className='space-y-4'>
            <div className='space-y-2'>
              <h4 className='font-medium'>Step 1: Authorize with E-conomic</h4>
              <p className='text-sm text-muted-foreground'>
                Click the button below to open E-conomic in a new tab and
                authorize our application to access your data.
              </p>
            </div>

            <Button
              onClick={handleStartOAuth}
              className='w-full'
              disabled={isConnecting}
            >
              <ExternalLink className='mr-2 h-4 w-4' />
              Open E-conomic Authorization
            </Button>

            <div className='space-y-2'>
              <h4 className='font-medium'>Step 2: Copy the grant token</h4>
              <p className='text-sm text-muted-foreground'>
                After authorizing, E-conomic will display a 26-character grant
                token. Copy this token and return to this dialog.
              </p>
            </div>

            <div className='flex justify-end space-x-2'>
              <Button variant='outline' onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={() => setStep('token')} disabled={!oauthUrl}>
                I have the token
              </Button>
            </div>
          </div>
        )}

        {step === 'token' && (
          <div className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='grant-token'>
                Grant Token <span className='text-red-500'>*</span>
              </Label>
              <Input
                id='grant-token'
                type='text'
                value={grantToken}
                onChange={(e) => setGrantToken(e.target.value)}
                placeholder='Enter the 26-character grant token'
                maxLength={26}
                className='font-mono'
              />
              <p className='text-xs text-muted-foreground'>
                The token should be exactly 26 characters long
              </p>
            </div>

            <div className='flex justify-end space-x-2'>
              <Button variant='outline' onClick={handleRetry}>
                Back
              </Button>
              <Button
                onClick={handleCompleteOAuth}
                disabled={
                  isConnecting || !grantToken || grantToken.length !== 26
                }
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
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
