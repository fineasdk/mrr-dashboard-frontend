import { useState, useEffect } from 'react';
import { 
  RefreshCw, 
  Settings, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Users,
  DollarSign,
  Link2,
  Shield,
  Plus,
  Building2,
  Loader2,
  ExternalLink,
  Unplug
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Alert, AlertDescription } from '../ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';

import { integrationsApi } from '../../lib/api';
import { formatCurrency } from '@/lib/mock-data';

// Available platforms configuration
const availablePlatforms = [
  {
    name: 'E-conomic',
    icon: '🔗',
    description: 'Connect your E-conomic accounting system',
    connectionType: 'API Tokens (App Secret + Agreement Grant)',
    available: true,
    comingSoon: false
  },
  {
    name: 'Shopify',
    icon: '🛒',
    description: 'Connect your Shopify store for subscription data',
    connectionType: 'OAuth 2.0 (Secure)',
    available: false,
    comingSoon: true
  },
  {
    name: 'Stripe',
    icon: '💳',
    description: 'Connect your Stripe account for payment data',
    connectionType: 'API Key (Encrypted)',
    available: true,
    comingSoon: false
  }
];

const statusConfig = {
  pending: { 
    icon: AlertCircle, 
    color: 'text-yellow-600', 
    badge: 'bg-yellow-100 text-yellow-800',
    label: 'Pending'
  },
  active: { 
    icon: CheckCircle, 
    color: 'text-green-600', 
    badge: 'bg-green-100 text-green-800',
    label: 'Connected'
  },
  error: { 
    icon: XCircle, 
    color: 'text-red-600', 
    badge: 'bg-red-100 text-red-800',
    label: 'Error'
  },
  syncing: { 
    icon: RefreshCw, 
    color: 'text-blue-600', 
    badge: 'bg-blue-100 text-blue-800',
    label: 'Syncing'
  },
  disconnected: { 
    icon: AlertCircle, 
    color: 'text-gray-600', 
    badge: 'bg-gray-100 text-gray-800',
    label: 'Disconnected'
  },
};

interface Integration {
  id: number;
  platform: string;
  platform_name: string;
  status: 'pending' | 'active' | 'error' | 'syncing';
  last_sync_at: string | null;
  last_successful_sync_at: string | null;
  customer_count: number;
  revenue: number;
  recent_sync_logs: any[];
}

interface EconomicCredentials {
  app_secret_token: string;
  agreement_grant_token: string;
}

interface StripeCredentials {
  secret_key: string;
}

export function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [autoSync, setAutoSync] = useState(true);
  const [syncFrequency, setSyncFrequency] = useState('15');
  const [isEconomicDialogOpen, setIsEconomicDialogOpen] = useState(false);
  const [economicCredentials, setEconomicCredentials] = useState<EconomicCredentials>({
    app_secret_token: '',
    agreement_grant_token: ''
  });
  const [isStripeDialogOpen, setIsStripeDialogOpen] = useState(false);
  const [stripeCredentials, setStripeCredentials] = useState<StripeCredentials>({
    secret_key: ''
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState<Record<number, boolean>>({});

  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = async () => {
    try {
      const response = await integrationsApi.getAll();
      
      if (response.data.success) {
        setIntegrations(response.data.data);
        setError(''); // Clear any previous errors
      } else {
        console.error('API returned unsuccessful response:', response.data);
        setError('Failed to load integrations: API returned unsuccessful response');
      }
    } catch (err: any) {
      console.error('Failed to load integrations:', err);
      setError('Failed to load integrations: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSyncNow = async (integrationId: number) => {
    setIsSyncing(prev => ({ ...prev, [integrationId]: true }));
    try {
      await integrationsApi.sync(integrationId.toString());
      await loadIntegrations(); // Refresh data
    } catch (err: any) {
      console.error('Sync failed:', err);
      setError('Sync failed. Please try again.');
    } finally {
      setIsSyncing(prev => ({ ...prev, [integrationId]: false }));
    }
  };

  const handleDisconnect = async (integrationId: number, platformName: string) => {
    if (!confirm(`Are you sure you want to disconnect ${platformName}? Your historical data will be preserved, but real-time sync will stop.`)) {
      return;
    }

    setIsSyncing(prev => ({ ...prev, [integrationId]: true }));
    try {
      await integrationsApi.disconnect(integrationId.toString());
      await loadIntegrations(); // Refresh data
    } catch (err: any) {
      console.error('Disconnect failed:', err);
      setError('Failed to disconnect integration. Please try again.');
    } finally {
      setIsSyncing(prev => ({ ...prev, [integrationId]: false }));
    }
  };

  const handleConnectEconomic = async () => {
    if (!economicCredentials.app_secret_token || !economicCredentials.agreement_grant_token) {
      setError('Please fill in all required fields');
      return;
    }

    setIsConnecting(true);
    setError('');

    try {
      const response = await integrationsApi.create({
        platform: 'economic',
        platform_name: 'E-conomic Integration',
        credentials: economicCredentials
      });

      if (response.data.success) {
        setIsEconomicDialogOpen(false);
        setEconomicCredentials({ app_secret_token: '', agreement_grant_token: '' });
        await loadIntegrations(); // Refresh integrations list
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to connect to E-conomic');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleConnectStripe = async () => {
    if (!stripeCredentials.secret_key) {
      setError('Please enter your Stripe Secret Key');
      return;
    }

    setIsConnecting(true);
    setError('');

    try {
      const response = await integrationsApi.create({
        platform: 'stripe',
        platform_name: 'Stripe Integration',
        credentials: stripeCredentials
      });

      if (response.data.success) {
        setIsStripeDialogOpen(false);
        setStripeCredentials({ secret_key: '' });
        await loadIntegrations(); // Refresh integrations list
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to connect to Stripe');
    } finally {
      setIsConnecting(false);
    }
  };

  const getIntegrationByPlatform = (platform: string) => {
    const platformName = platform.toLowerCase().replace('-', '');
    return integrations.find(integration => {
      const integrationPlatform = integration.platform.toLowerCase().replace('-', '');
      return integrationPlatform === platformName;
    });
  };

  const totalRevenue = integrations.reduce((sum, integration) => sum + (integration.revenue || 0), 0);
  const totalCustomers = integrations.reduce((sum, integration) => sum + (integration.customer_count || 0), 0);
  const connectedCount = integrations.filter(integration => integration.status === 'active').length;

  if (loading) {
    return (
      <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading integrations...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
      {/* Responsive Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">Platform Integrations</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Connect your revenue sources</p>
        </div>
        <Button className="w-full sm:w-auto" onClick={loadIntegrations}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700">{error}</AlertDescription>
        </Alert>
      )}

      {/* Overview - Responsive grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center space-x-3">
              <Link2 className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-muted-foreground">Connected Platforms</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold">{connectedCount}/{availablePlatforms.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center space-x-3">
              <Users className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-muted-foreground">Total Customers</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold">{totalCustomers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="sm:col-span-2 lg:col-span-1">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center space-x-3">
              <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-muted-foreground">Total MRR</p>
                <p className="text-base sm:text-lg lg:text-2xl font-bold">{formatCurrency(totalRevenue, 'DKK')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Connected Integrations */}
      {integrations.length > 0 && (
      <div className="space-y-4">
          <h2 className="text-lg font-semibold">Connected Integrations</h2>
          {integrations.map((integration) => {
            const StatusIcon = statusConfig[integration.status]?.icon || AlertCircle;
            const platformConfig = availablePlatforms.find(p => p.name.toLowerCase() === integration.platform);
          
          return (
              <Card key={integration.id}>
              <CardHeader className="pb-4">
                <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 gap-4">
                  <CardTitle className="flex items-center space-x-3">
                      <span className="text-xl sm:text-2xl">{platformConfig?.icon || '🔗'}</span>
                    <div>
                      <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                          <span className="text-lg sm:text-xl">{integration.platform_name}</span>
                          <Badge className={statusConfig[integration.status]?.badge || 'bg-gray-100 text-gray-800'}>
                          <StatusIcon className="mr-1 h-3 w-3" />
                            {statusConfig[integration.status]?.label || integration.status}
                        </Badge>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground font-normal mt-1">
                          {platformConfig?.description || `${integration.platform} integration`}
                      </p>
                    </div>
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {/* Connection Info */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Shield className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm font-medium">Connection</span>
                    </div>
                      <p className="text-sm text-muted-foreground">{platformConfig?.connectionType || 'API Connection'}</p>
                    <p className="text-sm text-muted-foreground">
                        Last sync: {integration.last_sync_at ? new Date(integration.last_sync_at).toLocaleString() : 'Never'}
                    </p>
                  </div>

                  {/* Metrics */}
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-xs sm:text-sm text-muted-foreground">Customers:</span>
                          <div className="font-medium text-sm sm:text-base">{integration.customer_count || 0}</div>
                      </div>
                      <div>
                        <span className="text-xs sm:text-sm text-muted-foreground">MRR:</span>
                        <div className="font-medium text-sm sm:text-base">
                            {formatCurrency(integration.revenue || 0, 'DKK')}/mo
                        </div>
                      </div>
                    </div>
                    <div>
                      <span className="text-xs sm:text-sm text-muted-foreground">Avg per customer:</span>
                      <div className="font-medium text-sm sm:text-base">
                          {integration.customer_count ? formatCurrency((integration.revenue || 0) / integration.customer_count, 'DKK') : 'N/A'}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                    <Button 
                      size="sm" 
                      className="w-full"
                        onClick={() => handleSyncNow(integration.id)}
                        disabled={isSyncing[integration.id] || integration.status === 'syncing'}
                      >
                        {isSyncing[integration.id] || integration.status === 'syncing' ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Syncing...
                          </>
                        ) : (
                          <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Sync Now
                          </>
                        )}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Configure
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        </div>
      )}

      {/* Available Platforms */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Available Platforms</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availablePlatforms.map((platform) => {
            const existingIntegration = getIntegrationByPlatform(platform.name);
            
            return (
              <Card key={platform.name} className={existingIntegration ? 'opacity-50' : ''}>
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center space-x-3">
                    <span className="text-2xl">{platform.icon}</span>
                    <div>
                      <span className="text-lg">{platform.name}</span>
                      {platform.comingSoon && (
                        <Badge variant="secondary" className="ml-2">Coming Soon</Badge>
                      )}
                      {existingIntegration && (
                        <Badge 
                          variant={existingIntegration.status === 'active' ? 'default' : 'secondary'} 
                          className={`ml-2 ${
                            existingIntegration.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : existingIntegration.status === 'error'
                              ? 'bg-red-100 text-red-800'
                              : existingIntegration.status === 'syncing'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {statusConfig[existingIntegration.status]?.label || 'Connected'}
                        </Badge>
                      )}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{platform.description}</p>
                  <p className="text-xs text-muted-foreground mb-4">Connection: {platform.connectionType}</p>
                  
                  {existingIntegration && (
                    <div className="space-y-2 mb-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Status:</span>
                        <span className="text-sm text-gray-600">{statusConfig[existingIntegration.status]?.label}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Customers:</span>
                        <span className="text-sm text-gray-600">{existingIntegration.customer_count || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">MRR:</span>
                        <span className="text-sm text-gray-600">{formatCurrency(existingIntegration.revenue || 0, 'DKK')}</span>
                      </div>
                      {existingIntegration.last_sync_at && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Last Sync:</span>
                          <span className="text-sm text-gray-600">
                            {new Date(existingIntegration.last_sync_at).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {!existingIntegration && (
                    <>
                      {platform.available && !platform.comingSoon && platform.name === 'E-conomic' && (
                        <Dialog open={isEconomicDialogOpen} onOpenChange={setIsEconomicDialogOpen}>
                          <DialogTrigger asChild>
                            <Button className="w-full">
                              <Plus className="mr-2 h-4 w-4" />
                              Connect {platform.name}
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[500px] bg-white">
                            <DialogHeader>
                              <DialogTitle className="flex items-center space-x-2">
                                <Building2 className="h-5 w-5" />
                                <span>Connect E-conomic</span>
                              </DialogTitle>
                              <DialogDescription>
                                Enter your E-conomic API credentials to connect your accounting system.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div>
                                <Label htmlFor="app_secret_token">App Secret Token</Label>
                                <Input
                                  id="app_secret_token"
                                  type="password"
                                  value={economicCredentials.app_secret_token}
                                  onChange={(e) => setEconomicCredentials(prev => ({
                                    ...prev,
                                    app_secret_token: e.target.value
                                  }))}
                                  placeholder="Your E-conomic App Secret Token"
                                />
                              </div>
                              <div>
                                <Label htmlFor="agreement_grant_token">Agreement Grant Token</Label>
                                <Input
                                  id="agreement_grant_token"
                                  type="password"
                                  value={economicCredentials.agreement_grant_token}
                                  onChange={(e) => setEconomicCredentials(prev => ({
                                    ...prev,
                                    agreement_grant_token: e.target.value
                                  }))}
                                  placeholder="Your Agreement Grant Token"
                                />
                              </div>
                              <div className="flex justify-end space-x-2">
                                <Button variant="outline" onClick={() => setIsEconomicDialogOpen(false)}>
                                  Cancel
                                </Button>
                                <Button onClick={handleConnectEconomic} disabled={isConnecting}>
                                  {isConnecting ? (
                                    <>
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      Connecting...
                                    </>
                                  ) : (
                                    'Connect'
                                  )}
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                      {platform.available && !platform.comingSoon && platform.name === 'Stripe' && (
                        <Dialog open={isStripeDialogOpen} onOpenChange={setIsStripeDialogOpen}>
                          <DialogTrigger asChild>
                            <Button className="w-full">
                              <Plus className="mr-2 h-4 w-4" />
                              Connect {platform.name}
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[500px] bg-white">
                            <DialogHeader>
                              <DialogTitle className="flex items-center space-x-2">
                                <div className="w-5 h-5 flex items-center justify-center bg-purple-100 rounded text-purple-600 text-sm font-bold">
                                  S
                                </div>
                                <span>Connect Stripe</span>
                              </DialogTitle>
                              <DialogDescription>
                                Enter your Stripe Secret Key to connect your payment processing account.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                <div className="flex items-start space-x-2">
                                  <Shield className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                  <div>
                                    <p className="text-blue-800 font-medium text-sm">Security Note</p>
                                    <p className="text-blue-600 text-xs">
                                      Your Stripe Secret Key is encrypted and stored securely. It's only used to sync your subscription data.
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <div>
                                <Label htmlFor="stripe_secret_key">Stripe Secret Key</Label>
                                <Input
                                  id="stripe_secret_key"
                                  type="password"
                                  value={stripeCredentials.secret_key}
                                  onChange={(e) => setStripeCredentials(prev => ({
                                    ...prev,
                                    secret_key: e.target.value
                                  }))}
                                  placeholder="sk_live_... or sk_test_..."
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                  Find this in your Stripe Dashboard under Developers → API Keys
                                </p>
                              </div>
                              <div className="flex justify-end space-x-2">
                                <Button variant="outline" onClick={() => setIsStripeDialogOpen(false)}>
                                  Cancel
                                </Button>
                                <Button onClick={handleConnectStripe} disabled={isConnecting}>
                                  {isConnecting ? (
                                    <>
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      Connecting...
                                    </>
                                  ) : (
                                    'Connect'
                                  )}
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                      {platform.comingSoon && (
                        <Button disabled className="w-full">
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Coming Soon
                        </Button>
                      )}
                    </>
                  )}
                  
                  {existingIntegration && (
                    <div className="space-y-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => handleSyncNow(existingIntegration.id)}
                        disabled={isSyncing[existingIntegration.id] || existingIntegration.status === 'syncing'}
                      >
                        {isSyncing[existingIntegration.id] || existingIntegration.status === 'syncing' ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Syncing...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Sync Now
                          </>
                        )}
                      </Button>
                      <div className="grid grid-cols-2 gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-gray-600 hover:text-gray-900"
                        >
                          <Settings className="mr-1 h-4 w-4" />
                          Settings
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDisconnect(existingIntegration.id, existingIntegration.platform_name)}
                          disabled={isSyncing[existingIntegration.id]}
                      >
                          <Unplug className="mr-1 h-4 w-4" />
                          Disconnect
                      </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Sync Settings - Mobile responsive */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
            <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>Sync Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 gap-4">
            <div className="space-y-0.5 flex-1">
              <Label className="text-sm font-medium">Automatic sync</Label>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Keep your data updated automatically
              </p>
            </div>
            <Switch 
              checked={autoSync} 
              onCheckedChange={setAutoSync}
              className="shrink-0"
            />
          </div>
          
          {autoSync && (
            <div className="space-y-2">
              <Label htmlFor="sync-frequency" className="text-sm font-medium">Sync frequency (minutes)</Label>
              <Input 
                id="sync-frequency"
                type="number"
                value={syncFrequency}
                onChange={(e) => setSyncFrequency(e.target.value)}
                className="w-full sm:w-32"
              />
              <p className="text-xs sm:text-sm text-muted-foreground">
                How often to sync data from all platforms
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-stretch sm:justify-end">
            <Button className="w-full sm:w-auto">Save Settings</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}