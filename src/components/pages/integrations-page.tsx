import { useState } from 'react';
import { 
  RefreshCw, 
  Settings, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Users,
  DollarSign,
  Link2,
  Shield
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { formatCurrency } from '../../lib/mock-data';

const platforms = [
  {
    name: 'E-conomic',
    icon: '🔗',
    status: 'connected' as const,
    lastSync: '5 minutes ago',
    customers: 128,
    revenue: 371000,
    description: 'Your existing E-conomic integration',
    connectionType: 'Already connected'
  },
  {
    name: 'Shopify',
    icon: '🛒',
    status: 'connected' as const,
    lastSync: '1 hour ago',
    customers: 89,
    revenue: 265000,
    description: 'Secure OAuth connection to your Shopify store',
    connectionType: 'OAuth 2.0 (Secure)'
  },
  {
    name: 'Stripe',
    icon: '💳',
    status: 'connected' as const,
    lastSync: '15 minutes ago',
    customers: 67,
    revenue: 222000,
    description: 'Encrypted API key connection to Stripe',
    connectionType: 'API Key (Encrypted)'
  }
];

const statusConfig = {
  connected: { 
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
  disconnected: { 
    icon: AlertCircle, 
    color: 'text-gray-600', 
    badge: 'bg-gray-100 text-gray-800',
    label: 'Disconnected'
  },
};

export function IntegrationsPage() {
  const [autoSync, setAutoSync] = useState(true);
  const [syncFrequency, setSyncFrequency] = useState('15');

  const handleSyncNow = (platform: string) => {
    console.log(`Syncing ${platform}...`);
  };

  const handleConnect = (platform: string) => {
    console.log(`Connecting to ${platform}...`);
  };

  const totalRevenue = platforms.reduce((sum, platform) => sum + platform.revenue, 0);
  const totalCustomers = platforms.reduce((sum, platform) => sum + platform.customers, 0);

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Platform Integrations</h1>
          <p className="text-muted-foreground">Connect your revenue sources</p>
        </div>
        <Button className="w-full sm:w-auto">
          <RefreshCw className="mr-2 h-4 w-4" />
          Sync All
        </Button>
      </div>

      {/* Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Link2 className="h-4 w-4 text-blue-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-sm text-muted-foreground">Connected Platforms</p>
                <p className="text-xl md:text-2xl font-bold">3/3</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-green-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-sm text-muted-foreground">Total Customers</p>
                <p className="text-xl md:text-2xl font-bold">{totalCustomers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-blue-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-sm text-muted-foreground">Total MRR</p>
                <p className="text-lg md:text-2xl font-bold">{formatCurrency(totalRevenue, 'DKK')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Platform Cards */}
      <div className="space-y-4">
        {platforms.map((platform) => {
          const StatusIcon = statusConfig[platform.status].icon;
          
          return (
            <Card key={platform.name}>
              <CardHeader>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <CardTitle className="flex items-center space-x-3">
                    <span className="text-2xl">{platform.icon}</span>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span>{platform.name}</span>
                        <Badge className={statusConfig[platform.status].badge}>
                          <StatusIcon className="mr-1 h-3 w-3" />
                          {statusConfig[platform.status].label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground font-normal">
                        {platform.description}
                      </p>
                    </div>
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Connection Info */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Shield className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm font-medium">Connection</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{platform.connectionType}</p>
                    <p className="text-sm text-muted-foreground">
                      Last sync: {platform.lastSync}
                    </p>
                  </div>

                  {/* Metrics */}
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-muted-foreground">Customers:</span>
                        <div className="font-medium">{platform.customers}</div>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">MRR:</span>
                        <div className="font-medium">
                          {formatCurrency(platform.revenue, 'DKK')}/mo
                        </div>
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Avg per customer:</span>
                      <div className="font-medium">
                        {formatCurrency(platform.revenue / platform.customers, 'DKK')}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2">
                    <Button 
                      size="sm" 
                      className="w-full"
                      onClick={() => handleSyncNow(platform.name)}
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Sync Now
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => handleConnect(platform.name)}
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

      {/* Sync Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Sync Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-0.5 flex-1">
              <Label>Automatic sync</Label>
              <p className="text-sm text-muted-foreground">
                Keep your data updated automatically
              </p>
            </div>
            <Switch 
              checked={autoSync} 
              onCheckedChange={setAutoSync}
            />
          </div>
          
          {autoSync && (
            <div className="space-y-2">
              <Label htmlFor="sync-frequency">Sync frequency (minutes)</Label>
              <Input 
                id="sync-frequency"
                type="number"
                value={syncFrequency}
                onChange={(e) => setSyncFrequency(e.target.value)}
                className="w-full sm:w-32"
              />
              <p className="text-sm text-muted-foreground">
                How often to sync data from all platforms
              </p>
            </div>
          )}

          <div className="flex justify-end">
            <Button>Save Settings</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}