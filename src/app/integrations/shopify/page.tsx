"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Info, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
// Toast functionality will be added later

interface ShopifyFormData {
  shop_domain: string;
  access_token: string;
  webhook_secret: string;
}

interface ShopifyPartnerFormData {
  partner_access_token: string;
  organization_id: string;
}

export default function ShopifyIntegrationPage() {
  const router = useRouter();
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [connectionType, setConnectionType] = useState<'partner' | 'shop'>('partner');
  
  // Use controlled inputs for Partner API
  const [partnerFormData, setPartnerFormData] = useState<ShopifyPartnerFormData>({
    partner_access_token: '',
    organization_id: '',
  });

  // Use controlled inputs for individual shop (legacy)
  const [formData, setFormData] = useState<ShopifyFormData>({
    shop_domain: '',
    access_token: '',
    webhook_secret: '',
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsConnecting(true);
    setConnectionError(null);

    if (connectionType === 'partner') {
      // Partner API validation
      if (!partnerFormData.partner_access_token?.trim()) {
        setConnectionError('Partner access token is required');
        setIsConnecting(false);
        return;
      }
      
      if (!partnerFormData.organization_id?.trim()) {
        setConnectionError('Organization ID is required');
        setIsConnecting(false);
        return;
      }

      try {
        const response = await api.post('/shopify/connect-partner', partnerFormData);
        
        if (response.data.success) {
          console.log('Shopify Partner integration created successfully:', response.data);
          router.push('/integrations?shopify=connected');
        } else {
          throw new Error(response.data.message || 'Failed to create Shopify Partner integration');
        }
      } catch (error: any) {
        console.error('Shopify Partner integration failed:', error);
        
        const errorMessage = error.response?.data?.message || error.message || 'Failed to connect to Shopify Partners';
        setConnectionError(errorMessage);
        
        if (error.response?.status === 409) {
          router.push('/integrations');
        }
      } finally {
        setIsConnecting(false);
      }
    } else {
      // Individual shop validation (legacy)
      if (!formData.shop_domain?.trim()) {
        setConnectionError('Shop domain is required');
        setIsConnecting(false);
        return;
      }
      
      if (!formData.access_token?.trim()) {
        setConnectionError('Admin API access token is required');
        setIsConnecting(false);
        return;
      }

      try {
        const cleanedData = {
          ...formData,
          shop_domain: formData.shop_domain.replace(/^https?:\/\//, '').replace(/\/$/, '').trim()
        };
        
        const response = await api.post('/shopify/connect-direct', cleanedData);
        
        if (response.data.success) {
          console.log('Shopify integration created successfully:', response.data);
          router.push('/integrations?shopify=connected');
        } else {
          throw new Error(response.data.message || 'Failed to create Shopify integration');
        }
      } catch (error: any) {
        console.error('Shopify integration failed:', error);
        
        const errorMessage = error.response?.data?.message || error.message || 'Failed to connect to Shopify';
        setConnectionError(errorMessage);
        
        if (error.response?.status === 409) {
          router.push('/integrations');
        }
      } finally {
        setIsConnecting(false);
      }
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

        {/* Connection Type Selector */}
        <Card>
          <CardHeader>
            <CardTitle>Connection Type</CardTitle>
            <CardDescription>
              Choose how you want to connect to Shopify
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div 
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  connectionType === 'partner' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setConnectionType('partner')}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <input 
                    type="radio" 
                    checked={connectionType === 'partner'} 
                    onChange={() => setConnectionType('partner')}
                    className="text-blue-600"
                  />
                  <h3 className="font-semibold">Shopify Partners (Recommended)</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Connect using your Shopify Partner account to access multiple stores and revenue data
                </p>
              </div>
              
              <div 
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  connectionType === 'shop' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setConnectionType('shop')}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <input 
                    type="radio" 
                    checked={connectionType === 'shop'} 
                    onChange={() => setConnectionType('shop')}
                    className="text-blue-600"
                  />
                  <h3 className="font-semibold">Individual Shop</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Connect to a single Shopify store using a private app
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Setup Instructions */}
        {connectionType === 'partner' ? (
          <Alert>
            <Info className="w-4 h-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">Shopify Partner Setup Required</p>
                <p className="text-sm">
                  You need a <strong>Shopify Partner account</strong> with API access. 
                  Go to: <strong>Partner Dashboard → Settings → Partner API clients → Create API client</strong>.
                  Then get your <strong>Access Token</strong> and <strong>Organization ID</strong>.
                </p>
              </div>
            </AlertDescription>
          </Alert>
        ) : (
          <Alert>
            <Info className="w-4 h-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">Private App Required</p>
                <p className="text-sm">
                  You need to create a <strong>Private App</strong> in your Shopify Admin. 
                  Go to: <strong>Settings → Apps and sales channels → Develop apps → Create an app</strong>.
                  Then get the <strong>Admin API access token</strong> from the API credentials section.
                </p>
              </div>
            </AlertDescription>
          </Alert>
        )}

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
            <CardTitle>
              {connectionType === 'partner' ? 'Partner API Connection' : 'Store Connection'}
            </CardTitle>
            <CardDescription>
              {connectionType === 'partner' 
                ? 'Enter your Shopify Partner API credentials'
                : 'Enter your Shopify store domain to begin the connection process'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} noValidate className="space-y-4">
              {connectionType === 'partner' ? (
                // Partner API Form
                <>
                  <div className="space-y-2">
                    <Label htmlFor="partner_access_token">Partner Access Token</Label>
                    <Input
                      id="partner_access_token"
                      name="partner_access_token"
                      value={partnerFormData.partner_access_token}
                      onChange={(e) => setPartnerFormData({...partnerFormData, partner_access_token: e.target.value})}
                      placeholder="shpat_..."
                      disabled={isConnecting}
                      type="password"
                      className="font-mono"
                    />

                    <p className="text-sm text-gray-500">
                      Find this in your Partner Dashboard → Settings → Partner API clients → [Your API Client] → Access Token
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="organization_id">Organization ID</Label>
                    <Input
                      id="organization_id"
                      name="organization_id"
                      value={partnerFormData.organization_id}
                      onChange={(e) => setPartnerFormData({...partnerFormData, organization_id: e.target.value})}
                      placeholder="1234567"
                      disabled={isConnecting}
                      className="font-mono"
                    />

                    <p className="text-sm text-gray-500">
                      Find this in your Partner Dashboard URL: partners.shopify.com/[ORGANIZATION_ID]/...
                    </p>
                  </div>
                </>
              ) : (
                // Individual Shop Form
                <>
                  <div className="space-y-2">
                    <Label htmlFor="shop_domain">Shopify Store Domain</Label>
                    <Input
                      id="shop_domain"
                      name="shop_domain"
                      value={formData.shop_domain}
                      onChange={(e) => setFormData({...formData, shop_domain: e.target.value})}
                      placeholder="your-store.myshopify.com or https://your-store.myshopify.com/"
                      disabled={isConnecting}
                      className="font-mono"
                    />

                    <p className="text-sm text-gray-500">
                      Enter your Shopify domain. You can include https:// and trailing slash - we'll clean it up automatically.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="access_token">Admin API Access Token</Label>
                    <Input
                      id="access_token"
                      name="access_token"
                      value={formData.access_token}
                      onChange={(e) => setFormData({...formData, access_token: e.target.value})}
                      placeholder="shpat_..."
                      disabled={isConnecting}
                      type="password"
                      className="font-mono"
                    />

                    <p className="text-sm text-gray-500">
                      Find this in your Shopify Admin → Settings → Apps and sales channels → Develop apps → [Your App] → API credentials
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="webhook_secret">Webhook Secret (Optional)</Label>
                    <Input
                      id="webhook_secret"
                      name="webhook_secret"
                      value={formData.webhook_secret}
                      onChange={(e) => setFormData({...formData, webhook_secret: e.target.value})}
                      placeholder="Your webhook verification secret"
                      disabled={isConnecting}
                      type="password"
                      className="font-mono"
                    />

                    <p className="text-sm text-gray-500">
                      Used to verify webhook authenticity (recommended for security)
                    </p>
                  </div>
                </>
              )}

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
                    Creating Integration...
                  </>
                ) : (
                  <>
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    Create {connectionType === 'partner' ? 'Partner' : 'Shopify'} Integration
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