import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { AlertTriangle, Eye, Calendar, User, CreditCard, Building2, Mail, MapPin, Phone, DollarSign, TrendingUp, Activity, Clock } from 'lucide-react';
import { Customer, Invoice, AuditLogEntry } from '../../lib/types';
import { formatCurrency, convertCurrency } from '../../lib/currency-service';
import { mockInvoices, mockAuditLog } from '../../lib/mock-data';

interface CustomerDetailModalProps {
  customer: Customer | null;
  open: boolean;
  onClose: () => void;
  onSave: (customer: Customer) => void;
  mode?: 'view' | 'edit';
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

export function CustomerDetailModal({ customer, open, onClose, onSave, mode = 'view' }: CustomerDetailModalProps) {
  const [isExcluded, setIsExcluded] = React.useState(customer?.isExcluded || false);
  const [exclusionReason, setExclusionReason] = React.useState(customer?.exclusionReason || '');
  
  React.useEffect(() => {
    if (customer) {
      setIsExcluded(customer.isExcluded || false);
      setExclusionReason(customer.exclusionReason || '');
    }
  }, [customer]);
  
  if (!customer) return null;

  const customerInvoices = mockInvoices.filter(inv => inv.customerId === customer.id);
  const customerAuditLog = mockAuditLog.filter(log => log.resourceId === customer.id);
  
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            {mode === 'edit' ? 'Edit Customer' : 'Customer Details'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
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
              <p className="text-xl font-bold text-gray-900">{formatCurrency(customer.mrr, customer.currency)}</p>
            </div>
            <div>
              <Label className="text-sm text-gray-600">Original MRR</Label>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(customer.originalMrr, customer.currency)}</p>
            </div>
            <div>
              <Label className="text-sm text-gray-600">Lifetime Value</Label>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(customer.clv, customer.currency)}</p>
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
        {/* <div className="space-y-4">
          <h3 className="text-lg font-medium">Invoice History</h3>
          {customerInvoices.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Type</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customerInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell>{new Date(invoice.date).toLocaleDateString()}</TableCell>
                    <TableCell>{formatCurrency(invoice.amount, invoice.currency)}</TableCell>
                    <TableCell>
                      <Badge variant={invoice.status === 'paid' ? 'secondary' : 'destructive'}>
                        {invoice.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="capitalize">{invoice.type}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-gray-500 text-center py-8">No invoices found</p>
          )}
        </div> */}

        <div className="flex justify-end space-x-3 pt-6 border-t">
          <Button variant="outline" onClick={onClose}>
            {mode === 'edit' ? 'Cancel' : 'Close'}
          </Button>
          {mode === 'edit' && (
            <Button onClick={handleSave}>
              Save Changes
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}