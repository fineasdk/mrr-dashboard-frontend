import { useState } from 'react';
import { Search, Filter, Download, MoreHorizontal, Eye, Edit, Trash2, AlertTriangle } from 'lucide-react';
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
import { CustomerDetailModal } from '../dashboard/customer-detail-modal';
import { CurrencySelector } from '../dashboard/currency-selector';
import { mockCustomers, formatCurrency, convertCurrency } from '../../lib/mock-data';
import { Customer, Currency } from '../../lib/types';

const platformIcons = {
  'e-conomic': '🔗',
  'shopify': '🛒',
  'stripe': '💳',
};

const statusColors = {
  active: 'bg-green-100 text-green-800',
  paused: 'bg-yellow-100 text-yellow-800',
  inactive: 'bg-red-100 text-red-800',
};

const riskColors = {
  low: 'text-green-600',
  medium: 'text-yellow-600', 
  high: 'text-red-600',
};

export function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('DKK');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCustomers(filteredCustomers.map(c => c.id));
    } else {
      setSelectedCustomers([]);
    }
  };

  const handleSelectCustomer = (customerId: string, checked: boolean) => {
    if (checked) {
      setSelectedCustomers([...selectedCustomers, customerId]);
    } else {
      setSelectedCustomers(selectedCustomers.filter(id => id !== customerId));
    }
  };

  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsModalOpen(true);
  };

  const handleSaveCustomer = (updatedCustomer: Customer) => {
    setCustomers(customers.map(c => c.id === updatedCustomer.id ? updatedCustomer : c));
  };

  const activeCustomers = filteredCustomers.filter(c => !c.isExcluded).length;
  const excludedCustomers = filteredCustomers.filter(c => c.isExcluded).length;
  const totalMrr = filteredCustomers.reduce((sum, c) => sum + c.mrr, 0);
  const atRiskCustomers = filteredCustomers.filter(c => c.churnRisk === 'high').length;

  // Mobile Card Component
  const CustomerCard = ({ customer }: { customer: Customer }) => (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={selectedCustomers.includes(customer.id)}
              onCheckedChange={(checked) => handleSelectCustomer(customer.id, checked as boolean)}
            />
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-medium">{customer.name}</h3>
                {customer.isExcluded && (
                  <Badge variant="outline" className="text-xs">
                    <AlertTriangle className="mr-1 h-3 w-3" />
                    Excluded
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{customer.email}</p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleViewCustomer(customer)}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Edit className="mr-2 h-4 w-4" />
                Edit Customer
              </DropdownMenuItem>
              <DropdownMenuItem 
                className={customer.isExcluded ? "text-green-600" : "text-red-600"}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {customer.isExcluded ? 'Include' : 'Exclude'} Customer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Platform:</span>
            <div className="flex items-center space-x-1 mt-1">
              <span>{platformIcons[customer.platform]}</span>
              <span className="capitalize">{customer.platform}</span>
            </div>
          </div>
          <div>
            <span className="text-muted-foreground">MRR:</span>
            <div className="font-medium mt-1">
              {formatCurrency(convertCurrency(customer.mrr, customer.currency, selectedCurrency), selectedCurrency)}
            </div>
          </div>
          <div>
            <span className="text-muted-foreground">Status:</span>
            <Badge 
              variant="secondary" 
              className={`${statusColors[customer.status]} mt-1`}
            >
              {customer.status === 'active' && '✅'} 
              {customer.status === 'paused' && '⚠️'} 
              {customer.status === 'inactive' && '❌'} 
              {customer.status}
            </Badge>
          </div>
          <div>
            <span className="text-muted-foreground">Risk:</span>
            <Badge 
              variant="outline" 
              className={`${riskColors[customer.churnRisk]} mt-1`}
            >
              {customer.churnRisk}
            </Badge>
          </div>
        </div>
        
        <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
          📄 {customer.invoiceCount} invoices · Since {new Date(customer.joinDate).toLocaleDateString()}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6 space-y-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-600 text-lg">Manage your customer base and revenue streams</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
          <CurrencySelector 
            currentCurrency={selectedCurrency} 
            onCurrencyChange={setSelectedCurrency} 
          />
          <Button variant="outline" size="sm" className="w-full sm:w-auto bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-violet-50 hover:border-violet-200 text-gray-700 font-medium transition-all duration-200">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" size="sm" className="w-full sm:w-auto bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-violet-50 hover:border-violet-200 text-gray-700 font-medium transition-all duration-200">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col">
              <p className="text-sm text-muted-foreground">Total Customers</p>
              <p className="text-xl md:text-2xl font-bold">{filteredCustomers.length}</p>
              <Badge variant="secondary" className="w-fit mt-1 text-xs">{activeCustomers} active</Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col">
              <p className="text-sm text-muted-foreground">Total MRR</p>
              <p className="text-lg md:text-2xl font-bold">
                {formatCurrency(convertCurrency(totalMrr, 'DKK', selectedCurrency), selectedCurrency)}
              </p>
              <Badge variant="outline" className="w-fit mt-1 text-xs">{excludedCustomers} excluded</Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col">
              <p className="text-sm text-muted-foreground">Avg Revenue</p>
              <p className="text-lg md:text-2xl font-bold">
                {formatCurrency(
                  convertCurrency(activeCustomers > 0 ? totalMrr / activeCustomers : 0, 'DKK', selectedCurrency), 
                  selectedCurrency
                )}
              </p>
              <Badge variant="secondary" className="w-fit mt-1 text-xs">ARPC</Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col">
              <p className="text-sm text-muted-foreground">At Risk</p>
              <p className="text-lg md:text-2xl font-bold text-red-600">{atRiskCustomers}</p>
              <Badge variant="destructive" className="w-fit mt-1 text-xs">{((atRiskCustomers / activeCustomers) * 100).toFixed(1)}%</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle>Customer List ({filteredCustomers.length})</CardTitle>
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search customers..."
                className="pl-10 w-full sm:w-80"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Mobile View */}
          <div className="md:hidden">
            {filteredCustomers.map((customer) => (
              <CustomerCard key={customer.id} customer={customer} />
            ))}
          </div>

          {/* Desktop View */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedCustomers.length === filteredCustomers.length}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>MRR</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Risk</TableHead>
                  <TableHead className="hidden xl:table-cell">CLV</TableHead>
                  <TableHead className="w-12">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow 
                    key={customer.id}
                    className={customer.isExcluded ? 'opacity-60 bg-muted/50' : ''}
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedCustomers.includes(customer.id)}
                        onCheckedChange={(checked) => handleSelectCustomer(customer.id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <div className="font-medium">{customer.name}</div>
                          {customer.isExcluded && (
                            <Badge variant="outline" className="text-xs">
                              <AlertTriangle className="mr-1 h-3 w-3" />
                              Excluded
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">{customer.email}</div>
                        <div className="text-xs text-muted-foreground">
                          📄 {customer.invoiceCount} invoices · Since {new Date(customer.joinDate).toLocaleDateString()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{platformIcons[customer.platform]}</span>
                        <span className="capitalize">{customer.platform}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">
                          {formatCurrency(convertCurrency(customer.mrr, customer.currency, selectedCurrency), selectedCurrency)}
                        </div>
                        {customer.isExcluded && customer.originalMrr > 0 && (
                          <div className="text-xs text-muted-foreground line-through">
                            {formatCurrency(convertCurrency(customer.originalMrr, customer.currency, selectedCurrency), selectedCurrency)}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="secondary" 
                        className={statusColors[customer.status]}
                      >
                        {customer.status === 'active' && '✅'} 
                        {customer.status === 'paused' && '⚠️'} 
                        {customer.status === 'inactive' && '❌'} 
                        {customer.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Badge 
                        variant="outline" 
                        className={riskColors[customer.churnRisk]}
                      >
                        {customer.churnRisk}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden xl:table-cell font-medium">
                      {formatCurrency(convertCurrency(customer.clv, customer.currency, selectedCurrency), selectedCurrency)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewCustomer(customer)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Customer
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className={customer.isExcluded ? "text-green-600" : "text-red-600"}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {customer.isExcluded ? 'Include' : 'Exclude'} Customer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <CustomerDetailModal
        customer={selectedCustomer}
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedCustomer(null);
        }}
        onSave={handleSaveCustomer}
      />
    </div>
  );
}