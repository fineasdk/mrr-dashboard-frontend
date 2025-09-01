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
  // { name: 'Settings', id: 'settings', icon: Settings },
];

export function Sidebar({ currentPage, onPageChange }: SidebarProps) {
  return (
    <aside className="sidebar w-64 flex flex-col h-full">
      {/* Perfect Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
          return (
            <button
              key={item.id}
              className={`nav-item w-full text-left ${
                isActive ? 'active' : ''
              }`}
              onClick={() => onPageChange(item.id)}
            >
              <Icon className="nav-icon" />
              <span>{item.name}</span>
            </button>
          );
        })}
      </nav>
      
      {/* Modern Help Section */}
      {/* <div className="p-4">
        <div className="bg-slate-50 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <span className="text-indigo-600 text-sm">💡</span>
            </div>
            <div>
              <p className="font-medium text-slate-900 text-sm">Need Help?</p>
              <p className="text-xs text-slate-600">Documentation & Support</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="btn-secondary w-full"
          >
            View Docs
          </Button>
        </div>
      </div> */}
    </aside>
  );
}