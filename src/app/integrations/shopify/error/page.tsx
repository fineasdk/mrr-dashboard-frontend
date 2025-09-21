"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertCircle, RefreshCw, ArrowLeft, ShoppingBag, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

export default function ShopifyErrorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [errorDetails, setErrorDetails] = useState<{
    reason?: string;
    message?: string;
  }>({});

  useEffect(() => {
    const reason = searchParams.get('reason');
    const message = searchParams.get('message');
    
    setErrorDetails({
      reason: reason || undefined,
      message: message || undefined,
    });
  }, [searchParams]);

  const getErrorTitle = () => {
    switch (errorDetails.reason) {
      case 'invalid_state':
        return 'Security Verification Failed';
      case 'invalid_signature':
        return 'Authentication Error';
      case 'oauth_failed':
        return 'Authorization Failed';
      default:
        return 'Connection Failed';
    }
  };

  const getErrorDescription = () => {
    switch (errorDetails.reason) {
      case 'invalid_state':
        return 'The OAuth state parameter is invalid or expired. This usually happens if you took too long to authorize or if there was a browser issue.';
      case 'invalid_signature':
        return 'The request signature verification failed. This is a security measure to ensure the request is legitimate.';
      case 'oauth_failed':
        return errorDetails.message || 'Failed to complete the OAuth authorization process with Shopify.';
      default:
        return 'We encountered an issue while connecting to your Shopify store. Please try again.';
    }
  };

  const getErrorSeverity = () => {
    switch (errorDetails.reason) {
      case 'invalid_state':
      case 'invalid_signature':
        return 'warning';
      default:
        return 'error';
    }
  };

  const handleTryAgain = () => {
    router.push('/integrations/shopify');
  };

  const handleGoBack = () => {
    router.push('/integrations');
  };

  const handleContactSupport = () => {
    // In a real app, this would open a support chat or email
    window.open('mailto:support@mrrdashboard.com?subject=Shopify Integration Error', '_blank');
  };

  const troubleshootingSteps = [
    {
      title: 'Clear Browser Cache',
      description: 'Clear your browser cache and cookies, then try connecting again.',
    },
    {
      title: 'Check Shopify Store Status',
      description: 'Ensure your Shopify store is active and you have admin permissions.',
    },
    {
      title: 'Verify Store Domain',
      description: 'Make sure you entered the correct store domain (your-store.myshopify.com).',
    },
    {
      title: 'Try a Different Browser',
      description: 'Sometimes browser extensions or settings can interfere with OAuth flows.',
    },
  ];

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <div className="space-y-6">
        {/* Error Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-10 h-10 text-red-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{getErrorTitle()}</h1>
          <p className="text-gray-600">
            We couldn't connect your Shopify store to the MRR Dashboard.
          </p>
        </div>

        {/* Error Details */}
        <Alert variant={getErrorSeverity() === 'error' ? 'destructive' : 'default'}>
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">What happened?</p>
              <p className="text-sm">{getErrorDescription()}</p>
              {errorDetails.reason && (
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="text-xs">
                    Error Code: {errorDetails.reason}
                  </Badge>
                </div>
              )}
            </div>
          </AlertDescription>
        </Alert>

      
        {/* Troubleshooting */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" />
              Troubleshooting Steps
            </CardTitle>
            <CardDescription>
              Try these steps to resolve the connection issue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {troubleshootingSteps.map((step, index) => (
                <div key={index} className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-0.5">
                    {index + 1}
                  </Badge>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{step.title}</p>
                    <p className="text-sm text-gray-600">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Common Issues */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Common Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-l-4 border-yellow-400 pl-4">
                <p className="font-medium text-sm">Store Domain Format</p>
                <p className="text-sm text-gray-600">
                  Make sure you use the full Shopify domain format: <code className="bg-gray-100 px-1 rounded">your-store.myshopify.com</code>
                </p>
              </div>
              <div className="border-l-4 border-blue-400 pl-4">
                <p className="font-medium text-sm">Admin Permissions</p>
                <p className="text-sm text-gray-600">
                  You need to be logged in as a store owner or have admin permissions to authorize integrations.
                </p>
              </div>
              <div className="border-l-4 border-purple-400 pl-4">
                <p className="font-medium text-sm">Browser Compatibility</p>
                <p className="text-sm text-gray-600">
                  Some ad blockers or privacy extensions may interfere with the OAuth process.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Support */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Need Help?</CardTitle>
            <CardDescription>
              If you continue to experience issues, our support team is here to help
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Include the error code and any specific error messages when contacting support 
                for faster resolution.
              </p>
              <Button 
                onClick={handleContactSupport}
                variant="outline"
                className="w-full"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Contact Support
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Alternative Solutions */}
        <Alert>
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium text-sm">Alternative Approach</p>
              <p className="text-sm">
                If you continue having issues with OAuth, you can also connect using Shopify's 
                private app credentials. This method provides the same functionality with a 
                different authentication approach.
              </p>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
} 