'use client'

import React from 'react'
import { AlertCircle, RefreshCw, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface Props {
  children: React.ReactNode
  fallback?: React.ComponentType<ErrorFallbackProps>
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

interface ErrorFallbackProps {
  error: Error | null
  errorInfo: React.ErrorInfo | null
  resetError: () => void
}

const DefaultErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetError,
}) => {
  const isDevelopment = process.env.NODE_ENV === 'development'

  const handleReload = () => {
    window.location.reload()
  }

  const handleGoHome = () => {
    window.location.href = '/'
  }

  return (
    <div className='min-h-screen flex items-center justify-center p-4 bg-gray-50'>
      <Card className='w-full max-w-2xl'>
        <CardHeader className='text-center'>
          <div className='mx-auto mb-4 h-12 w-12 text-red-500'>
            <AlertCircle className='h-full w-full' />
          </div>
          <CardTitle className='text-2xl text-gray-900'>
            Something went wrong
          </CardTitle>
          <CardDescription className='text-gray-600'>
            We're sorry, but something unexpected happened. Our team has been
            notified.
          </CardDescription>
        </CardHeader>

        <CardContent className='space-y-4'>
          {isDevelopment && error && (
            <Alert variant='destructive'>
              <AlertCircle className='h-4 w-4' />
              <AlertDescription className='font-mono text-sm'>
                <details className='mt-2'>
                  <summary className='cursor-pointer font-semibold'>
                    Error Details (Development Only)
                  </summary>
                  <div className='mt-2 whitespace-pre-wrap text-xs'>
                    <strong>Message:</strong> {error.message}
                    {error.stack && (
                      <>
                        <br />
                        <strong>Stack:</strong>
                        <br />
                        {error.stack}
                      </>
                    )}
                  </div>
                </details>
              </AlertDescription>
            </Alert>
          )}

          <div className='flex flex-col sm:flex-row gap-3 justify-center'>
            <Button
              onClick={resetError}
              variant='outline'
              className='flex items-center gap-2'
            >
              <RefreshCw className='h-4 w-4' />
              Try Again
            </Button>

            <Button
              onClick={handleReload}
              variant='outline'
              className='flex items-center gap-2'
            >
              <RefreshCw className='h-4 w-4' />
              Reload Page
            </Button>

            <Button onClick={handleGoHome} className='flex items-center gap-2'>
              <Home className='h-4 w-4' />
              Go Home
            </Button>
          </div>

          <div className='text-center text-sm text-gray-500'>
            <p>If this problem persists, please contact support.</p>
            <p className='mt-1'>
              Error ID: {Date.now().toString(36).toUpperCase()}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)

    this.setState({
      error,
      errorInfo,
    })

    // In production, you might want to send this to an error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: sendErrorToService(error, errorInfo)
      console.error('Production error caught:', {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        errorBoundary: 'MRR Dashboard',
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      })
    }
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback

      return (
        <FallbackComponent
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          resetError={this.resetError}
        />
      )
    }

    return this.props.children
  }
}

// Hook for functional components to trigger error boundary
export const useErrorBoundary = () => {
  const [error, setError] = React.useState<Error | null>(null)

  const resetError = React.useCallback(() => {
    setError(null)
  }, [])

  const captureError = React.useCallback((error: Error) => {
    setError(error)
  }, [])

  React.useEffect(() => {
    if (error) {
      throw error
    }
  }, [error])

  return { captureError, resetError }
}

// Higher-order component for class components
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ComponentType<ErrorFallbackProps>
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  )

  WrappedComponent.displayName = `withErrorBoundary(${
    Component.displayName || Component.name
  })`

  return WrappedComponent
}


