import { useState } from 'react'
import { Button } from '../ui/button'
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
  const [step, setStep] = useState<'instructions' | 'connecting'>('instructions')
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState('')
  const [oauthUrl, setOauthUrl] = useState('')

  const handleStartOAuth = async () => {
    try {
      const response = await api.get('/economic/oauth-url')
      if (response.data.success) {
        setOauthUrl(response.data.oauth_url)
        setStep('connecting')
        setError('')
        
        // Redirect to E-conomic OAuth page (will redirect back to our callback)
        window.location.href = response.data.oauth_url
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


  const handleClose = () => {
    onClose()
    // Reset state when closing
    setStep('instructions')
    setError('')
    setOauthUrl('')
  }

  const handleRetry = () => {
    setStep('instructions')
    setError('')
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-md !bg-white'>
        <DialogHeader>
          <DialogTitle>Connect E-conomic</DialogTitle>
          <DialogDescription>
            {step === 'instructions'
              ? 'Connect your E-conomic account to sync your financial data'
              : 'Redirecting to E-conomic for authorization...'}
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
              <p className='text-sm text-muted-foreground'>
                You will be redirected to E-conomic to authorize our application.
                After authorization, you&apos;ll be automatically redirected back to complete the setup.
              </p>
            </div>

            <Button
              onClick={handleStartOAuth}
              className='w-full'
              disabled={isConnecting}
            >
              <ExternalLink className='mr-2 h-4 w-4' />
              Connect with E-conomic
            </Button>

            <div className='flex justify-end space-x-2'>
              <Button variant='outline' onClick={handleClose}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {step === 'connecting' && (
          <div className='space-y-4 text-center'>
            <div className='flex justify-center'>
              <Loader2 className='h-8 w-8 animate-spin text-blue-600' />
            </div>
            <div className='space-y-2'>
              <p className='text-sm font-medium'>Redirecting to E-conomic...</p>
              <p className='text-xs text-muted-foreground'>
                You will be redirected back automatically after authorization
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
