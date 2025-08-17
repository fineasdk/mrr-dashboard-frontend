'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import { DashboardPage } from '@/components/pages/dashboard-page';
import { CustomersPage } from '@/components/pages/customers-page';
import { AnalyticsPage } from '@/components/pages/analytics-page';
import { IntegrationsPage } from '@/components/pages/integrations-page';
import ProfilePageComponent from '@/app/profile/page';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';

// Simplified settings page focused on core functionality
function SettingsPage() {
  const [primaryCurrency, setPrimaryCurrency] = useState('DKK');
  const [autoExcludeSetupFees, setAutoExcludeSetupFees] = useState(true);
  const [normalizeAnnualSubscriptions, setNormalizeAnnualSubscriptions] = useState(true);

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Configure your MRR dashboard preferences</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Currency Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Currency Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Primary Currency</Label>
              <Select value={primaryCurrency} onValueChange={setPrimaryCurrency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="DKK">🇩🇰 Danish Krone (DKK)</SelectItem>
                  <SelectItem value="EUR">🇪🇺 Euro (EUR)</SelectItem>
                  <SelectItem value="USD">🇺🇸 US Dollar (USD)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                All revenue will be converted to this currency for reporting
              </p>
            </div>
          </CardContent>
        </Card>

        {/* MRR Calculation Settings */}
        <Card>
          <CardHeader>
            <CardTitle>MRR Calculation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Auto-exclude setup fees</Label>
                <p className="text-xs text-muted-foreground">
                  Automatically exclude one-time setup fees from MRR calculations
                </p>
              </div>
              <Switch 
                checked={autoExcludeSetupFees} 
                onCheckedChange={setAutoExcludeSetupFees}

                
        />
      </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Normalize annual subscriptions</Label>
                <p className="text-xs text-muted-foreground">
                  Convert yearly subscriptions to monthly equivalents (÷12)
                </p>
              </div>
              <Switch 
                checked={normalizeAnnualSubscriptions} 
                onCheckedChange={setNormalizeAnnualSubscriptions}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('auth_token');
    if (!token) {
      router.push('/login');
      return;
    }
    setIsAuthenticated(true);
    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-violet-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'customers':
        return <CustomersPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'integrations':
        return <IntegrationsPage />;
      case 'profile':
        return <ProfilePageComponent />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b bg-white">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="font-bold">MRR Dashboard</h1>
        <div className="w-8"></div> {/* Spacer for center alignment */}
      </div>

      {/* Desktop Header */}
      <div className="hidden md:block">
        <Header onLogout={handleLogout} />
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)}>
            <div className="w-64 h-full bg-sidebar" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-4 border-b">
                <h1 className="font-bold text-sidebar-foreground">MRR Dashboard</h1>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSidebarOpen(false)}
        >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <Sidebar 
                currentPage={currentPage} 
                onPageChange={(page) => {
                  setCurrentPage(page);
                  setSidebarOpen(false);
                }} 
              />
            </div>
          </div>
        )}

        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-gray-50">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}
