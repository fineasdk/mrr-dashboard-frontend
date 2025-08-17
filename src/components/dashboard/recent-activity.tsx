import { UserPlus, UserMinus, CreditCard, AlertTriangle } from 'lucide-react';

const activities = [
  {
    type: 'new_customer',
    icon: UserPlus,
    title: 'New customer added',
    description: 'ACME Corp - kr 16,400/month',
    time: '2 hours ago',
    color: 'blue'
  },
  {
    type: 'customer_excluded',
    icon: AlertTriangle,
    title: 'Customer excluded',
    description: 'Test Corp - kr 4,500/month',
    time: 'Yesterday',
    color: 'orange'
  },
  {
    type: 'payment_received',
    icon: CreditCard,
    title: 'Payment received',
    description: 'Manufacturing Co - kr 21,900',
    time: '2 days ago',
    color: 'green'
  },
  {
    type: 'customer_churned',
    icon: UserMinus,
    title: 'Customer churned',
    description: 'Small Business - kr 899/month',
    time: '3 days ago',
    color: 'red'
  }
];

const colorClasses = {
  blue: 'bg-blue-100 text-blue-600',
  orange: 'bg-orange-100 text-orange-600',
  green: 'bg-green-100 text-green-600',
  red: 'bg-red-100 text-red-600'
};

export function RecentActivity() {
  return (
    <div className="space-y-4">
      {activities.map((activity, index) => {
        const ActivityIcon = activity.icon;
        return (
          <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50/50 transition-colors">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${colorClasses[activity.color as keyof typeof colorClasses]}`}>
              <ActivityIcon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900">{activity.title}</p>
              <p className="text-sm text-gray-600 truncate">{activity.description}</p>
              <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
} 