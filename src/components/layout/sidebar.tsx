import {
  Users,
  TrendingUp,
  Settings,
  Link2,
  LayoutDashboard,
  User,
} from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

const navigation = [
  { name: 'Dashboard', id: 'dashboard', icon: LayoutDashboard },
  { name: 'Customers', id: 'customers', icon: Users },
  { name: 'Analytics', id: 'analytics', icon: TrendingUp },
  { name: 'Integrations', id: 'integrations', icon: Link2 },
  { name: 'Settings', id: 'settings', icon: Settings },
  { name: 'Profile', id: 'profile', icon: User },
];

export function Sidebar({ currentPage, onPageChange }: SidebarProps) {
  return (
    <aside className="w-60 flex flex-col h-full bg-white border-r border-gray-200">
      {/* Navigation */}
      <nav className="flex-1 px-3 py-4">
        <div className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <button
                key={item.id}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
                onClick={() => onPageChange(item.id)}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                <span>{item.name}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}