"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ShoppingBag, Info, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
// Toast functionality will be added later

const shopifyDomainSchema = z.object({
  shop_domain: z
    .string()
    .min(1, 'Shop domain is required')
    .regex(
      /^[a-zA-Z0-9\-_]+\.myshopify\.com$/,
      'Must be a valid Shopify domain (e.g., your-store.myshopify.com)'
    ),
  api_key: z
    .string()
    .min(10, 'API Key must be at least 10 characters')
    .trim(),
  api_secret: z
    .string()
    .min(10, 'API Secret must be at least 10 characters')
    .trim(),
  webhook_secret: z
    .string()
    .optional(),
});

type ShopifyDomainForm = z.infer<typeof shopifyDomainSchema>;

export default function ShopifyIntegrationPage() {
  const router = useRouter();
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const form = useForm<ShopifyDomainForm>({
    resolver: zodResolver(shopifyDomainSchema),
    defaultValues: {
      shop_domain: '',
      api_key: '',
      api_secret: '',
      webhook_secret: '',
    },
  });

  const onSubmit = async (data: ShopifyDomainForm) => {
    setIsConnecting(true);
    setConnectionError(null);

    try {
      const response = await api.post('/shopify/oauth/initiate', data);
      
      if (response.data.success) {
        const { auth_url } = response.data.data;
        
        // Store the shop domain for later use
        localStorage.setItem('shopify_connecting_domain', data.shop_domain);
        
        console.log('Redirecting to Shopify...');
        
        // Redirect to Shopify OAuth
        window.location.href = auth_url;
      } else {
        throw new Error(response.data.message || 'Failed to initiate Shopify connection');
      }
    } catch (error: any) {
      console.error('Shopify OAuth initiation failed:', error);
      
      const errorMessage = error.response?.data?.message || error.message || 'Failed to connect to Shopify';
      setConnectionError(errorMessage);
      
      if (error.response?.status === 409) {
        // Integration already exists
        console.error('Shopify integration already exists');
        router.push('/integrations');
      } else {
        console.error(errorMessage);
      }
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <ShoppingBag className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Connect Shopify</h1>
          <p className="text-gray-600">
            Connect your Shopify store to sync subscription and revenue data
          </p>
        </div>

        {/* Benefits Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
              What you'll get
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                <span>Automatic sync of customer data and order history</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                <span>Real-time MRR calculations from subscription orders</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                <span>Comprehensive analytics and growth insights</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                <span>Webhook integration for real-time updates</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* App Setup Instructions */}
        <Alert>
          <Info className="w-4 h-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">First Time Setup Required</p>
              <p className="text-sm">
                Before connecting, you need to create a Shopify app in your 
                <a href="https://partners.shopify.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
                  Shopify Partners Dashboard
                </a>. 
                Set the OAuth redirect URL to: <code className="bg-gray-100 px-1 rounded text-xs">
                  https://your-domain.com/api/shopify/oauth/callback
                </code>
              </p>
            </div>
          </AlertDescription>
        </Alert>

        {/* Important Information */}
        <Alert>
          <Info className="w-4 h-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">Subscription Detection</p>
              <p className="text-sm">
                Our system automatically detects subscription orders by analyzing product tags, 
                line item properties, and product names. For best results, tag your subscription 
                products with "subscription" or "recurring" in Shopify.
              </p>
            </div>
          </AlertDescription>
        </Alert>

        {/* Connection Form */}
        <Card>
          <CardHeader>
            <CardTitle>Store Connection</CardTitle>
            <CardDescription>
              Enter your Shopify store domain to begin the connection process
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="shop_domain">Shopify Store Domain</Label>
                <Input
                  id="shop_domain"
                  {...form.register('shop_domain')}
                  placeholder="your-store.myshopify.com"
                  disabled={isConnecting}
                  className="font-mono"
                />
                {form.formState.errors.shop_domain && (
                  <p className="text-sm text-red-600">
                    {form.formState.errors.shop_domain.message}
                  </p>
                )}
                <p className="text-sm text-gray-500">
                  Enter your full Shopify domain (e.g., magnus-store.myshopify.com)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="api_key">Shopify API Key</Label>
                <Input
                  id="api_key"
                  {...form.register('api_key')}
                  placeholder="Your Shopify app API key"
                  disabled={isConnecting}
                  type="password"
                  className="font-mono"
                />
                {form.formState.errors.api_key && (
                  <p className="text-sm text-red-600">
                    {form.formState.errors.api_key.message}
                  </p>
                )}
                <p className="text-sm text-gray-500">
                  Find this in your Shopify Partners Dashboard → Apps → [Your App] → API credentials
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="api_secret">Shopify API Secret</Label>
                <Input
                  id="api_secret"
                  {...form.register('api_secret')}
                  placeholder="Your Shopify app API secret"
                  disabled={isConnecting}
                  type="password"
                  className="font-mono"
                />
                {form.formState.errors.api_secret && (
                  <p className="text-sm text-red-600">
                    {form.formState.errors.api_secret.message}
                  </p>
                )}
                <p className="text-sm text-gray-500">
                  This is shown only once when you create your app
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="webhook_secret">Webhook Secret (Optional)</Label>
                <Input
                  id="webhook_secret"
                  {...form.register('webhook_secret')}
                  placeholder="Your webhook verification secret"
                  disabled={isConnecting}
                  type="password"
                  className="font-mono"
                />
                {form.formState.errors.webhook_secret && (
                  <p className="text-sm text-red-600">
                    {form.formState.errors.webhook_secret.message}
                  </p>
                )}
                <p className="text-sm text-gray-500">
                  Used to verify webhook authenticity (recommended for security)
                </p>
              </div>

              {connectionError && (
                <Alert variant="destructive">
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription>{connectionError}</AlertDescription>
                </Alert>
              )}

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isConnecting}
                size="lg"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting to Shopify...
                  </>
                ) : (
                  <>
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    Connect with Shopify
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Process Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Connection Process</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-0.5">1</Badge>
                <div className="text-sm">
                  <p className="font-medium">Create Shopify App</p>
                  <p className="text-gray-600">Set up a private app in your Shopify Partners Dashboard</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-0.5">2</Badge>
                <div className="text-sm">
                  <p className="font-medium">Enter Credentials</p>
                  <p className="text-gray-600">Provide your app's API key and secret from Partners Dashboard</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-0.5">3</Badge>
                <div className="text-sm">
                  <p className="font-medium">Shopify Authorization</p>
                  <p className="text-gray-600">You'll be redirected to Shopify to authorize the connection</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-0.5">4</Badge>
                <div className="text-sm">
                  <p className="font-medium">Grant Permissions</p>
                  <p className="text-gray-600">Allow your app to access your store data</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-0.5">5</Badge>
                <div className="text-sm">
                  <p className="font-medium">Data Synchronization</p>
                  <p className="text-gray-600">We'll automatically sync your customer and order data</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-0.5">6</Badge>
                <div className="text-sm">
                  <p className="font-medium">View Analytics</p>
                  <p className="text-gray-600">Access your MRR dashboard with real Shopify data</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <Alert>
          <Info className="w-4 h-4" />
          <AlertDescription>
            <div className="space-y-1">
              <p className="font-medium text-sm">Security & Privacy</p>
              <p className="text-sm">
                We only request the minimum permissions needed and never store sensitive 
                payment information. Your data is encrypted and securely processed.
              </p>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
} 