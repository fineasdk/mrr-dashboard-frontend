import { RefreshCw, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { Button } from '../ui/button';

const platforms = [
  {
    name: 'E-conomic',
    icon: '🔗',
    status: 'connected',
    lastSync: '5 min ago',
    color: 'green'
  },
  {
    name: 'Shopify',
    icon: '🛒',
    status: 'warning',
    lastSync: '1 hour ago',
    color: 'yellow'
  },
  {
    name: 'Stripe',
    icon: '💳',
    status: 'connected',
    lastSync: '15 min ago',
    color: 'green'
  }
];

const statusIcons = {
  connected: CheckCircle,
  warning: AlertCircle,
  error: XCircle
};

const statusColors = {
  connected: 'text-green-600',
  warning: 'text-yellow-600',
  error: 'text-red-600'
};

export function PlatformStatus() {
  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {platforms.map((platform) => {
          const StatusIcon = statusIcons[platform.status as keyof typeof statusIcons];
          return (
            <div key={platform.name} className="flex items-center justify-between p-3 rounded-lg bg-gray-50/50 hover:bg-gray-100/50 transition-colors">
              <div className="flex items-center space-x-3">
                <span className="text-lg">{platform.icon}</span>
                <div>
                  <p className="font-medium text-gray-900">{platform.name}</p>
                  <p className="text-sm text-gray-500">Last sync: {platform.lastSync}</p>
                </div>
              </div>
              <StatusIcon className={`w-5 h-5 ${statusColors[platform.status as keyof typeof statusColors]}`} />
            </div>
          );
        })}
      </div>
      
      <Button variant="outline" className="w-full">
        <RefreshCw className="mr-2 h-4 w-4" />
        Sync All Platforms
      </Button>
    </div>
  );
} 