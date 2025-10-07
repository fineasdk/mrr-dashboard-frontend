import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { AlertTriangle, Eye, Calendar, User, CreditCard, Building2, Mail, MapPin, Phone, DollarSign, TrendingUp, Activity, Clock, Loader2 } from 'lucide-react';
import { Customer, Invoice, AuditLogEntry } from '../../lib/types';
import { formatCurrency, convertCurrency } from '../../lib/currency-service';
import { customersApi } from '../../lib/api';

import { Currency } from '../../lib/types';

interface CustomerDetailModalProps {
  customer: Customer | null;
  open: boolean;
  onClose: () => void;
  onSave: (customer: Customer) => void;
  mode?: 'view' | 'edit';
  selectedCurrency?: Currency;
}

const platformIcons = {
  'e-conomic': '🔗',
  'economic': '🔗',
  'shopify': '🛒',
  'stripe': '💳',
};

const getPlatformDisplayName = (platform: string): string => {
  switch (platform) {
    case 'economic':
    case 'e-conomic':
      return 'E-conomic';
    case 'shopify':
      return 'Shopify';
    case 'stripe':
      return 'Stripe';
    default:
      return platform.charAt(0).toUpperCase() + platform.slice(1);
  }
};

const statusColors = {
  active: 'bg-green-100 text-green-800 border-green-200',
  paused: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  inactive: 'bg-red-100 text-red-800 border-red-200',
};

const churnRiskColors = {
  low: 'bg-green-50 text-green-700 border-green-200',
  medium: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  high: 'bg-red-50 text-red-700 border-red-200',
};

export function CustomerDetailModal({ customer, open, onClose, onSave, mode = 'view', selectedCurrency = 'DKK' }: CustomerDetailModalProps) {
  const [isExcluded, setIsExcluded] = React.useState(customer?.isExcluded || false);
  const [exclusionReason, setExclusionReason] = React.useState(customer?.exclusionReason || '');
  const [customerInvoices, setCustomerInvoices] = React.useState<any[]>([]);
  const [loadingInvoices, setLoadingInvoices] = React.useState(false);
  const [updatingInvoiceId, setUpdatingInvoiceId] = React.useState<number | null>(null);
  
  const handleBillingFrequencyChange = async (invoiceId: number, frequency: string) => {
    if (frequency === 'auto') {
      // TODO: Call API to clear manual billing frequency
      console.log('Auto-detect selected - clearing manual frequency');
      return;
    }

    console.log('Updating billing frequency:', { invoiceId, frequency });
    setUpdatingInvoiceId(invoiceId);
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
      const url = `${apiUrl}/api/invoices/${invoiceId}/billing-frequency`;
      
      console.log('API URL:', url);
      
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          billing_frequency: frequency,
          note: `Manually set to ${frequency}`,
        }),
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok) {
        // Update local state
        setCustomerInvoices(prev => prev.map(inv => 
          inv.id === invoiceId 
            ? { ...inv, manual_billing_frequency: frequency }
            : inv
        ));
        alert(`Billing frequency updated to ${frequency}`);
      } else {
        console.error('Failed to update billing frequency:', data);
        alert(`Failed to update: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating billing frequency:', error);
      alert('Network error - check console');
    } finally {
      setUpdatingInvoiceId(null);
    }
  };

  React.useEffect(() => {
    if (customer) {
      setIsExcluded(customer.isExcluded || false);
      setExclusionReason(customer.exclusionReason || '');
      
      // Fetch detailed customer data including invoices
      const fetchCustomerDetails = async () => {
        try {
          setLoadingInvoices(true);
          const response = await customersApi.getOne(customer.id);
          if (response.data.success && response.data.data.invoices) {
            setCustomerInvoices(response.data.data.invoices);
          }
        } catch (error) {
          console.error('Failed to fetch customer invoices:', error);
          setCustomerInvoices([]);
        } finally {
          setLoadingInvoices(false);
        }
      };
      
      fetchCustomerDetails();
    }
  }, [customer]);
  
  if (!customer) return null;
  
  const handleSave = () => {
    const updatedCustomer = {
      ...customer,
      isExcluded,
      exclusionReason: isExcluded ? exclusionReason : undefined,
      mrr: isExcluded ? 0 : customer.originalMrr,
      excludedDate: isExcluded ? new Date().toISOString().split('T')[0] : undefined,
      excludedBy: isExcluded ? 'Magnus B.' : undefined,
    };
    onSave(updatedCustomer);
    onClose();
  };

  const mrrImpact = isExcluded ? -customer.originalMrr : (customer.isExcluded ? customer.originalMrr : 0);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'edit' ? 'Edit Customer' : 'Customer Details'}
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm text-gray-600">Company Name</Label>
              <p className="font-medium text-gray-900">{customer.name}</p>
            </div>
            <div>
              <Label className="text-sm text-gray-600">Email</Label>
              <p className="font-medium text-gray-900">{customer.email}</p>
            </div>
            <div>
              <Label className="text-sm text-gray-600">Platform</Label>
              <div className="flex items-center space-x-2">
                <span>{platformIcons[customer.platform as keyof typeof platformIcons] || '🔗'}</span>
                <span className="font-medium">{getPlatformDisplayName(customer.platform)}</span>
              </div>
            </div>
            <div>
              <Label className="text-sm text-gray-600">Status</Label>
              <Badge className={statusColors[customer.status]}>
                {customer.status}
              </Badge>
            </div>
          </div>

          {/* Revenue Information */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="text-sm text-gray-600">Current MRR</Label>
              <div className="flex flex-col">
                <p className="text-xl font-bold text-gray-900">
                  {formatCurrency(convertCurrency(customer.mrr, customer.currency, selectedCurrency), selectedCurrency)}
                </p>
                {customer.currency !== selectedCurrency && (
                  <span className="text-xs text-gray-500">
                    ({formatCurrency(customer.mrr, customer.currency)})
                  </span>
                )}
              </div>
            </div>
            <div>
              <Label className="text-sm text-gray-600">Original MRR</Label>
              <div className="flex flex-col">
                <p className="text-xl font-bold text-gray-900">
                  {formatCurrency(convertCurrency(customer.originalMrr, customer.currency, selectedCurrency), selectedCurrency)}
                </p>
                {customer.currency !== selectedCurrency && (
                  <span className="text-xs text-gray-500">
                    ({formatCurrency(customer.originalMrr, customer.currency)})
                  </span>
                )}
              </div>
            </div>
            <div>
              <Label className="text-sm text-gray-600">Lifetime Value</Label>
              <div className="flex flex-col">
                <p className="text-xl font-bold text-gray-900">
                  {formatCurrency(convertCurrency(customer.clv, customer.currency, selectedCurrency), selectedCurrency)}
                </p>
                {customer.currency !== selectedCurrency && (
                  <span className="text-xs text-gray-500">
                    ({formatCurrency(customer.clv, customer.currency)})
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* MRR Control */}
        {mode === 'edit' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">Exclude from MRR</Label>
                <p className="text-sm text-gray-600">Remove this customer from revenue calculations</p>
              </div>
              <Switch checked={isExcluded} onCheckedChange={setIsExcluded} />
            </div>
            
            {isExcluded && (
              <div>
                <Label htmlFor="exclusion-reason">Reason for Exclusion</Label>
                <Textarea
                  id="exclusion-reason"
                  placeholder="Why is this customer excluded?"
                  value={exclusionReason}
                  onChange={(e) => setExclusionReason(e.target.value)}
                  className="mt-1"
                />
              </div>
            )}
          </div>
        )}
        
        {mode === 'view' && customer.isExcluded && (
          <div className="space-y-2">
            <Label className="text-base font-medium">MRR Status</Label>
            <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
              <p className="text-sm text-orange-800 font-medium">This customer is excluded from MRR calculations</p>
              {customer.exclusionReason && (
                <p className="text-sm text-orange-600 mt-1">Reason: {customer.exclusionReason}</p>
              )}
            </div>
          </div>
        )}

        {/* Invoice History */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Invoice History</h3>
          {loadingInvoices ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-500">Loading invoices...</span>
            </div>
          ) : customerInvoices.length > 0 ? (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead>Date</TableHead>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Billing Frequency</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customerInvoices.map((invoice) => {
                    // Convert invoice amount to selected currency
                    const convertedAmount = convertCurrency(
                      invoice.amount,
                      invoice.currency,
                      selectedCurrency
                    );
                    const isConverted = invoice.currency !== selectedCurrency;
                    
                    return (
                      <TableRow key={invoice.id}>
                        <TableCell>{new Date(invoice.issued_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</TableCell>
                        <TableCell className="font-mono text-sm">{invoice.invoice_number || '-'}</TableCell>
                        <TableCell className="font-semibold">
                          <div className="flex flex-col">
                            <span>{formatCurrency(convertedAmount, selectedCurrency)}</span>
                            {/* {isConverted && (
                              <span className="text-xs text-gray-500">
                                ({formatCurrency(invoice.amount, invoice.currency)})
                              </span>
                            )} */}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            className={
                              invoice.status === 'paid' ? 'bg-green-100 text-green-800 border-green-200' : 
                              invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                              'bg-red-100 text-red-800 border-red-200'
                            }
                          >
                            {invoice.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="capitalize">{invoice.type}</TableCell>
                        <TableCell>
                          <Select
                            value={(invoice as any).manual_billing_frequency || 'auto'}
                            onValueChange={(value) => handleBillingFrequencyChange(invoice.id, value)}
                            disabled={updatingInvoiceId === invoice.id}
                          >
                            <SelectTrigger className="w-[130px] !bg-white">
                              <SelectValue placeholder="Auto-detect" />
                            </SelectTrigger>
                            <SelectContent className="!bg-white">
                              <SelectItem value="auto">Auto-detect</SelectItem>
                              <SelectItem value="monthly">Monthly</SelectItem>
                              <SelectItem value="quarterly">Quarterly</SelectItem>
                              <SelectItem value="yearly">Yearly</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8 border rounded-lg bg-gray-50">No invoices found for this customer</p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {mode === 'edit' ? 'Cancel' : 'Close'}
          </Button>
          {mode === 'edit' && (
            <Button onClick={handleSave} className="btn-primary">
              Save Changes
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}