import { useState } from 'react';
import { Search, Filter, Download, MoreHorizontal, Eye, Edit, Trash2, AlertTriangle, Plus, Users2, SlidersHorizontal } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
// import { CustomerDetailModal } from '../dashboard/customer-detail-modal';
import { CurrencySelector } from '../dashboard/currency-selector';
import { mockCustomers, formatCurrency, convertCurrency } from '../../lib/mock-data';
import { Customer, Currency } from '../../lib/types';

const platformIcons = {
  'e-conomic': '🔗',
  'shopify': '🛒',
  'stripe': '💳',
};

const statusColors = {
  active: 'status-active',
  paused: 'status-paused',
  inactive: 'status-inactive',
};

const riskColors = {
  low: 'text-green-600',
  medium: 'text-yellow-600', 
  high: 'text-red-600',
};

export function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('DKK');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Enhanced filtering
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || customer.status === statusFilter;
    const matchesPlatform = platformFilter === 'all' || customer.platform === platformFilter;
    
    return matchesSearch && matchesStatus && matchesPlatform;
  });

  // Pagination
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCustomers = filteredCustomers.slice(startIndex, startIndex + itemsPerPage);

  const handleSelectCustomer = (customerId: string) => {
    setSelectedCustomers(prev => 
      prev.includes(customerId) 
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId]
    );
  };

  const handleSelectAll = () => {
    if (selectedCustomers.length === paginatedCustomers.length) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(paginatedCustomers.map(c => c.id));
    }
  };

  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsModalOpen(true);
  };

  const handleBulkAction = (action: string) => {
    console.log(`Bulk action: ${action} for customers:`, selectedCustomers);
    // Implement bulk actions here
  };

  return (
    <div className="section-padding space-y-4 sm:space-y-6 bg-gray-50 min-h-screen">
      {/* Responsive Header */}
      <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0 gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Customers</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Manage your customer base and revenue streams</p>
          <div className="flex flex-wrap items-center gap-4 mt-2">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Users2 className="w-4 h-4" />
              <span>{filteredCustomers.length} customers</span>
            </div>
            {selectedCustomers.length > 0 && (
              <>
                <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                <div className="text-sm text-gray-600">
                  {selectedCustomers.length} selected
                </div>
              </>
            )}
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          <CurrencySelector 
            currentCurrency={selectedCurrency} 
            onCurrencyChange={setSelectedCurrency} 
          />
        </div>
      </div>

      {/* Enhanced Filters & Search - Responsive */}
      <Card className="card p-4 sm:p-6">
        <div className="flex flex-col space-y-4 lg:flex-row lg:space-y-0 lg:gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search by name, email, or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-11 bg-white/70 border-gray-200/60 focus:bg-white"
              />
            </div>
          </div>

          {/* Filters - Mobile responsive */}
          <div className="flex flex-col sm:flex-row gap-3">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200/60 rounded-lg bg-white/70 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 w-full sm:w-auto"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="inactive">Inactive</option>
            </select>

            <select 
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200/60 rounded-lg bg-white/70 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 w-full sm:w-auto"
            >
              <option value="all">All Platforms</option>
              <option value="stripe">Stripe</option>
              <option value="shopify">Shopify</option>
              <option value="e-conomic">E-conomic</option>
            </select>
          </div>
        </div>

        {/* Bulk Actions - Mobile responsive */}
        {selectedCustomers.length > 0 && (
          <div className="mt-4 p-4 bg-violet-50 border border-violet-200 rounded-lg">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <span className="text-sm font-medium text-violet-700">
                {selectedCustomers.length} customer{selectedCustomers.length > 1 ? 's' : ''} selected
              </span>
              <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleBulkAction('exclude')}
                  className="text-orange-600 border-orange-200 hover:bg-orange-50 w-full sm:w-auto"
                >
                  Exclude from MRR
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleBulkAction('export')}
                  className="text-blue-600 border-blue-200 hover:bg-blue-50 w-full sm:w-auto"
                >
                  Export Selected
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedCustomers([])}
                  className="w-full sm:w-auto"
                >
                  Clear Selection
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Responsive Table/Cards */}
      <Card className="table-container">
        <CardHeader className="table-header px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-900">Customer List</CardTitle>
            <div className="text-sm text-gray-500 hidden sm:block">
              Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredCustomers.length)} of {filteredCustomers.length} customers
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Mobile Card View */}
          <div className="md:hidden">
            <div className="divide-y divide-gray-200">
              {paginatedCustomers.map((customer) => (
                <div key={customer.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                      <Checkbox
                        checked={selectedCustomers.includes(customer.id)}
                        onCheckedChange={() => handleSelectCustomer(customer.id)}
                      />
                      <div className="w-10 h-10 bg-gradient-to-br from-violet-100 to-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-violet-700 font-semibold text-sm">
                          {customer.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{customer.name}</p>
                        <p className="text-sm text-gray-500 truncate">{customer.email}</p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="p-1">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="popover-content" align="end">
                        <DropdownMenuItem onClick={() => handleViewCustomer(customer)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Customer
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <AlertTriangle className="mr-2 h-4 w-4" />
                          Exclude from MRR
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Customer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Platform:</span>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-lg">{platformIcons[customer.platform as keyof typeof platformIcons]}</span>
                        <span className="font-medium capitalize">{customer.platform}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">MRR:</span>
                      <div className="font-medium text-gray-900 mt-1">
                        {convertCurrency(customer.mrr, 'DKK', selectedCurrency).toLocaleString('da-DK')} {selectedCurrency}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">Status:</span>
                      <div className="mt-1">
                        <Badge className={`badge ${statusColors[customer.status as keyof typeof statusColors]}`}>
                          {customer.status}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">Risk:</span>
                      <div className={`font-medium mt-1 ${riskColors[customer.churnRisk as keyof typeof riskColors]}`}>
                        {customer.churnRisk}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <Table className="data-table">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedCustomers.length === paginatedCustomers.length && paginatedCustomers.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>MRR</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Risk</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedCustomers.map((customer) => (
                  <TableRow key={customer.id} className="group">
                    <TableCell>
                      <Checkbox
                        checked={selectedCustomers.includes(customer.id)}
                        onCheckedChange={() => handleSelectCustomer(customer.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-violet-100 to-purple-100 rounded-full flex items-center justify-center">
                          <span className="text-violet-700 font-semibold text-sm">
                            {customer.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{customer.name}</p>
                          <p className="text-sm text-gray-500">{customer.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{platformIcons[customer.platform as keyof typeof platformIcons]}</span>
                        <span className="text-sm font-medium capitalize">{customer.platform}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-gray-900">
                        {convertCurrency(customer.mrr, 'DKK', selectedCurrency).toLocaleString('da-DK')} {selectedCurrency}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`badge ${statusColors[customer.status as keyof typeof statusColors]}`}>
                        {customer.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className={`text-sm font-medium ${riskColors[customer.churnRisk as keyof typeof riskColors]}`}>
                        {customer.churnRisk}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-500">{new Date(customer.joinDate).toLocaleDateString()}</span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="popover-content" align="end">
                          <DropdownMenuItem onClick={() => handleViewCustomer(customer)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Customer
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <AlertTriangle className="mr-2 h-4 w-4" />
                            Exclude from MRR
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Customer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Enhanced Pagination - Mobile responsive */}
          <div className="px-4 sm:px-6 py-4 border-t border-gray-100/60 bg-gray-50/30">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-600 order-2 sm:order-1">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredCustomers.length)} of {filteredCustomers.length} results
              </div>
              <div className="flex items-center space-x-2 order-1 sm:order-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="button-outline"
                >
                  Previous
                </Button>
                <div className="hidden sm:flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className={currentPage === page ? "button-primary" : "button-outline"}
                      >
                        {page}
                      </Button>
                    );
                  })}
                </div>
                <div className="sm:hidden text-sm text-gray-600">
                  {currentPage} / {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="button-outline"
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer Detail Modal - Coming Soon */}
      {/* <CustomerDetailModal
        customer={selectedCustomer}
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={(updatedCustomer) => {
          setCustomers(customers.map(c => c.id === updatedCustomer.id ? updatedCustomer : c));
        }}
      /> */}
    </div>
  );
}