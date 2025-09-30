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
    <aside className="w-64 flex flex-col h-full bg-white border-r border-gray-200">
      {/* Enhanced Perfect Navigation */}
      <nav className="flex-1 p-6 space-y-2">
        <div className="mb-8">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Navigation</p>
        </div>
        {navigation.map((item, index) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
          return (
            <button
              key={item.id}
              className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-md font-medium transition-colors duration-200 ${
                isActive 
                  ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600' 
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`}
              onClick={() => onPageChange(item.id)}
            >
              <div className={`p-2 rounded-md transition-colors duration-200 ${
                isActive 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-500 group-hover:bg-gray-300 group-hover:text-gray-700'
              }`}>
                <Icon className="h-4 w-4" />
              </div>
              <span className={`transition-colors duration-200 ${
                isActive ? 'font-semibold' : ''
              }`}>
                {item.name}
              </span>
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