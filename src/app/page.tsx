'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, X, BarChart3 } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import { DashboardPage } from '@/components/pages/dashboard-page';
import { CustomersPage } from '@/components/pages/customers-page';
import { AnalyticsPage } from '@/components/pages/analytics-page';
import { IntegrationsPage } from '@/components/pages/integrations-page';
import { ProfilePage } from '@/components/pages/profile-page';
import { ShopifyIntegrationPage } from '@/components/pages/shopify-integration-page';
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
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground text-sm sm:text-base">Configure your MRR dashboard preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-4 sm:gap-6">
        {/* Currency Settings */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg sm:text-xl">Currency Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Primary Currency</Label>
              <Select value={primaryCurrency} onValueChange={setPrimaryCurrency}>
                <SelectTrigger className="w-full">
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
          <CardHeader className="pb-4">
            <CardTitle className="text-lg sm:text-xl">MRR Calculation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-0.5">
                <Label className="text-sm font-medium">Auto-exclude setup fees</Label>
                <p className="text-xs text-muted-foreground">
                  Automatically exclude one-time setup fees from MRR calculations
                </p>
              </div>
              <Switch 
                checked={autoExcludeSetupFees} 
                onCheckedChange={setAutoExcludeSetupFees}
                className="shrink-0"
              />
            </div>

            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-0.5">
                <Label className="text-sm font-medium">Normalize annual subscriptions</Label>
                <p className="text-xs text-muted-foreground">
                  Convert yearly subscriptions to monthly equivalents (÷12)
                </p>
              </div>
              <Switch 
                checked={normalizeAnnualSubscriptions} 
                onCheckedChange={setNormalizeAnnualSubscriptions}
                className="shrink-0"
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

  // Handle URL-based routing
  useEffect(() => {
    const handleRouteChange = () => {
      const path = window.location.pathname;
      if (path === '/integrations') {
        setCurrentPage('integrations');
      } else if (path === '/profile') {
        setCurrentPage('profile');
      } else if (path === '/integrations/shopify') {
        setCurrentPage('shopify-integration');
      } else if (path === '/customers') {
        setCurrentPage('customers');
      } else if (path === '/analytics') {
        setCurrentPage('analytics');
      } else if (path === '/settings') {
        setCurrentPage('settings');
      } else if (path === '/' || path === '/dashboard') {
        setCurrentPage('dashboard');
      }
    };

    // Set initial page based on URL
    handleRouteChange();

    // Listen for browser back/forward navigation
    window.addEventListener('popstate', handleRouteChange);
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 sm:h-32 sm:w-32 border-b-2 border-violet-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-sm sm:text-base">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Handle page changes and URL updates
  const handlePageChange = (page: string) => {
    setCurrentPage(page);
    
    // Update URL without page reload
    const urlMap: Record<string, string> = {
      'dashboard': '/',
      'customers': '/customers',
      'analytics': '/analytics',
      'integrations': '/integrations',
      'profile': '/profile',
      'shopify-integration': '/integrations/shopify',
      'settings': '/settings'
    };
    
    const newUrl = urlMap[page] || '/';
    window.history.pushState(null, '', newUrl);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage onNavigateToIntegrations={() => handlePageChange('integrations')} />;
      case 'customers':
        return <CustomersPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'integrations':
        return <IntegrationsPage onNavigateToShopify={() => handlePageChange('shopify-integration')} />;
      case 'profile':
        return <ProfilePage />;
      case 'shopify-integration':
        return <ShopifyIntegrationPage onNavigateBack={() => handlePageChange('integrations')} />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-gray-200 bg-white sticky top-0 z-50 shadow-sm">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-md hover:bg-gray-100 transition-colors duration-200"
        >
          <Menu className="h-5 w-5 text-gray-700" />
        </Button>
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-600 rounded-md">
            <BarChart3 className="h-4 w-4 text-white" />
          </div>
          <h1 className="font-bold text-gray-900">FINEAS</h1>
        </div>
        <div className="w-8"></div> {/* Spacer for center alignment */}
      </div>

      {/* Desktop Header */}
      <div className="hidden md:block">
        <Header onLogout={handleLogout} />
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div 
            className="md:hidden fixed inset-0 z-50 bg-black/50" 
            onClick={() => setSidebarOpen(false)}
          >
            <div 
              className="w-72 h-full bg-white shadow-lg" 
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-600 rounded-md shadow-sm">
                    <BarChart3 className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h1 className="font-bold text-gray-900">FINEAS</h1>
                    <p className="text-xs text-gray-500">MRR Dashboard</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 rounded-md hover:bg-gray-100 transition-colors duration-200"
                >
                  <X className="h-5 w-5 text-gray-600" />
                </Button>
              </div>
              <Sidebar 
                currentPage={currentPage} 
                onPageChange={(page) => {
                  handlePageChange(page);
                  setSidebarOpen(false);
                }} 
              />
            </div>
          </div>
        )}

        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <Sidebar currentPage={currentPage} onPageChange={handlePageChange} />
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-white">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}
