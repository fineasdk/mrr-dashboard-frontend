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
import { AlertTriangle, Eye, Calendar, User, CreditCard } from 'lucide-react';
import { Customer, Invoice, AuditLogEntry } from '../../lib/types';
import { formatCurrency, mockInvoices, mockAuditLog } from '../../lib/mock-data';

interface CustomerDetailModalProps {
  customer: Customer | null;
  open: boolean;
  onClose: () => void;
  onSave: (customer: Customer) => void;
}

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

export function CustomerDetailModal({ customer, open, onClose, onSave }: CustomerDetailModalProps) {
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <span>Customer Details - {customer.name}</span>
            <Badge 
              variant="secondary" 
              className={statusColors[customer.status]}
            >
              {customer.status === 'active' && '✅'} 
              {customer.status === 'paused' && '⚠️'} 
              {customer.status === 'inactive' && '❌'} 
              {customer.status}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Customer Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm text-muted-foreground">Company</Label>
                <p className="font-medium">{customer.name}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Email</Label>
                <p className="font-medium">{customer.email}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Platform</Label>
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{platformIcons[customer.platform]}</span>
                  <span className="capitalize font-medium">{customer.platform}</span>
                </div>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Customer Since</Label>
                <p className="font-medium">{new Date(customer.joinDate).toLocaleDateString()}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Churn Risk</Label>
                <Badge variant={
                  customer.churnRisk === 'high' ? 'destructive' : 
                  customer.churnRisk === 'medium' ? 'secondary' : 'outline'
                }>
                  {customer.churnRisk} risk
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Subscription Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5" />
                <span>Subscription Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm text-muted-foreground">Current MRR</Label>
                <p className="text-2xl font-bold">{formatCurrency(customer.mrr, customer.currency)}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Original MRR</Label>
                <p className="font-medium">{formatCurrency(customer.originalMrr, customer.currency)}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Billing Frequency</Label>
                <p className="capitalize font-medium">{customer.billingFrequency}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Currency</Label>
                <p className="font-medium">{customer.currency}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Customer Lifetime Value</Label>
                <p className="font-medium">{formatCurrency(customer.clv, customer.currency)}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Total Invoices</Label>
                <p className="font-medium">{customer.invoiceCount}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Exclusion Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5" />
              <span>Revenue Control</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Exclude Customer from MRR</Label>
                <p className="text-sm text-muted-foreground">
                  Remove this customer from recurring revenue calculations
                </p>
              </div>
              <Switch checked={isExcluded} onCheckedChange={setIsExcluded} />
            </div>
            
            {isExcluded && (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="exclusion-reason">Reason for Exclusion</Label>
                  <Textarea
                    id="exclusion-reason"
                    placeholder="Explain why this customer should be excluded..."
                    value={exclusionReason}
                    onChange={(e) => setExclusionReason(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <p className="text-sm text-orange-800">
                    <strong>Impact:</strong> {mrrImpact < 0 ? '' : '+'}{formatCurrency(mrrImpact, customer.currency)} MRR change
                  </p>
                </div>
              </div>
            )}
            
            {customer.isExcluded && !isExcluded && (
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-green-800">
                  <strong>Restore Impact:</strong> +{formatCurrency(customer.originalMrr, customer.currency)} MRR
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Invoice History */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice History</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Currency</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Excluded</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customerInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell>{new Date(invoice.date).toLocaleDateString()}</TableCell>
                    <TableCell>{formatCurrency(invoice.amount, invoice.currency)}</TableCell>
                    <TableCell>{invoice.currency}</TableCell>
                    <TableCell>
                      <Badge variant={invoice.status === 'paid' ? 'secondary' : 'destructive'}>
                        {invoice.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="capitalize">{invoice.type}</TableCell>
                    <TableCell>
                      <Switch 
                        checked={invoice.isExcluded} 
                        disabled={invoice.type === 'setup'} 
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Separator />

        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}