'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Shield, 
  Key, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  ExternalLink,
  ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { integrationsApi } from '@/lib/api';

export default function StripeIntegrationPage() {
  const router = useRouter();
  const [credentials, setCredentials] = useState({
    secret_key: ''
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');

  const handleConnect = async () => {
    if (!credentials.secret_key) {
      setError('Please enter your Stripe Secret Key');
      return;
    }

    if (!credentials.secret_key.startsWith('sk_')) {
      setError('Invalid Stripe Secret Key format. It should start with "sk_"');
      return;
    }

    setIsConnecting(true);
    setConnectionStatus('testing');
    setError('');

    try {
      const response = await integrationsApi.create({
        platform: 'stripe',
        platform_name: 'Stripe Integration',
        credentials: credentials
      });

      if (response.data.success) {
        setConnectionStatus('success');
        setTimeout(() => {
          router.push('/integrations');
        }, 2000);
      }
    } catch (err: any) {
      setConnectionStatus('error');
      setError(err.response?.data?.message || 'Failed to connect to Stripe');
    } finally {
      setIsConnecting(false);
    }
  };

  if (connectionStatus === 'success') {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Stripe Connected Successfully!</h1>
            <p className="text-gray-600 mb-4">
              Your Stripe account has been connected and we&apos;re now syncing your subscription data.
            </p>
            <Badge className="bg-green-100 text-green-800">
              Initial sync in progress...
            </Badge>
            <p className="text-sm text-gray-500 mt-4">
              Redirecting to integrations page...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={() => router.back()} className="p-2">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <div className="w-6 h-6 bg-purple-600 rounded text-white text-sm font-bold flex items-center justify-center">
              S
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Connect Stripe</h1>
            <p className="text-gray-600">Sync your subscription revenue and customer data</p>
          </div>
        </div>
      </div>

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700">{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Connection Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Key className="w-5 h-5" />
              <span>API Credentials</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-blue-800">Secure Connection</h3>
                  <p className="text-blue-600 text-sm">
                    Your API key is encrypted and stored securely. We only access data necessary for MRR calculations.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="secret_key">Stripe Secret Key *</Label>
              <Input
                id="secret_key"
                type="password"
                value={credentials.secret_key}
                onChange={(e) => setCredentials(prev => ({
                  ...prev,
                  secret_key: e.target.value
                }))}
                placeholder="sk_live_... or sk_test_..."
                className="font-mono"
              />
              <p className="text-xs text-gray-500 mt-1">
                Starts with <code className="bg-gray-100 px-1 rounded">sk_live_</code> for production or <code className="bg-gray-100 px-1 rounded">sk_test_</code> for testing
              </p>
            </div>

            <Button 
              onClick={handleConnect} 
              disabled={isConnecting || !credentials.secret_key}
              className="w-full"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {connectionStatus === 'testing' ? 'Testing connection...' : 'Connecting...'}
                </>
              ) : (
                'Connect Stripe Account'
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Setup Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Setup Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 text-sm font-medium">1</span>
                </div>
                <div>
                  <p className="font-medium">Access Stripe Dashboard</p>
                  <p className="text-sm text-gray-600">
                    Log in to your <a href="https://dashboard.stripe.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center">
                      Stripe Dashboard <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 text-sm font-medium">2</span>
                </div>
                <div>
                  <p className="font-medium">Navigate to API Keys</p>
                  <p className="text-sm text-gray-600">Go to Developers → API Keys</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 text-sm font-medium">3</span>
                </div>
                <div>
                  <p className="font-medium">Copy Secret Key</p>
                  <p className="text-sm text-gray-600">
                    Copy your &quot;Secret key&quot; (not the Publishable key)
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 text-sm font-medium">4</span>
                </div>
                <div>
                  <p className="font-medium">Paste and Connect</p>
                  <p className="text-sm text-gray-600">
                    Paste the key above and click &quot;Connect Stripe Account&quot;
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 