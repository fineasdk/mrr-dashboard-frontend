import { 
  BarChart3, 
  Users, 
  TrendingUp, 
  Settings, 
  Link2,
  Home,
  User,
} from 'lucide-react';
import { Button } from '../ui/button';

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

const navigation = [
  { name: 'Dashboard', id: 'dashboard', icon: Home },
  { name: 'Customers', id: 'customers', icon: Users },
  { name: 'Analytics', id: 'analytics', icon: TrendingUp },
  { name: 'Integrations', id: 'integrations', icon: Link2 },
  { name: 'Profile', id: 'profile', icon: User },
  { name: 'Settings', id: 'settings', icon: Settings },
];

export function Sidebar({ currentPage, onPageChange }: SidebarProps) {
  return (
    <aside className="sidebar w-64 bg-white border-r border-gray-200 flex flex-col h-full shadow-sm">
      {/* Desktop Header */}
      <div className="hidden md:block p-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-purple-700 rounded-lg flex items-center justify-center shadow-lg">
            <BarChart3 className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-gray-900">MRR Dashboard</h1>
            <p className="text-xs text-gray-500">Revenue Management</p>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 px-4 pb-6 space-y-2 mt-4 md:mt-0">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
          return (
            <Button
              key={item.id}
              variant={isActive ? "secondary" : "ghost"}
              className={`w-full justify-start h-12 font-medium transition-all duration-200 ${
                isActive 
                  ? 'bg-violet-50 text-violet-700 border-r-3 border-violet-600 shadow-sm' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
              onClick={() => onPageChange(item.id)}
            >
              <Icon className="mr-3 h-5 w-5" />
              <span className="text-base">{item.name}</span>
            </Button>
          );
        })}
      </nav>

      {/* Help Section */}
      <div className="px-4 py-4 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-500 space-y-1">
          <p>💡 Need help?</p>
          <p>Contact support@mrrdashboard.com</p>
        </div>
      </div>
    </aside>
  );
}