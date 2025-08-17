import { 
  Customer, 
  MRRData, 
  MetricData, 
  PlatformBreakdown, 
  SyncStatus, 
  Invoice,
  CohortData,
  ChurnData,
  AuditLogEntry,
  CurrencyRate,
  Currency
} from './types';

// Currency conversion rates (DKK as base)
export const mockCurrencyRates: CurrencyRate[] = [
  { from: 'DKK', to: 'EUR', rate: 0.134, lastUpdated: '2024-02-15 14:30:00' },
  { from: 'DKK', to: 'USD', rate: 0.146, lastUpdated: '2024-02-15 14:30:00' },
  { from: 'EUR', to: 'DKK', rate: 7.46, lastUpdated: '2024-02-15 14:30:00' },
  { from: 'USD', to: 'DKK', rate: 6.85, lastUpdated: '2024-02-15 14:30:00' },
];

export const mockCustomers: Customer[] = [
  {
    id: '1',
    name: 'ACME Corporation',
    email: 'billing@acme.com',
    platform: 'e-conomic',
    mrr: 16400, // DKK
    originalMrr: 16400,
    currency: 'DKK',
    status: 'active',
    billingFrequency: 'monthly',
    joinDate: '2023-01-15',
    invoiceCount: 24,
    isExcluded: false,
    clv: 125000,
    churnRisk: 'low',
  },
  {
    id: '2',
    name: 'TechStart Inc',
    email: 'hello@techstart.io',
    platform: 'shopify',
    mrr: 12300, // DKK equivalent
    originalMrr: 12300,
    currency: 'DKK',
    status: 'active',
    billingFrequency: 'monthly',
    joinDate: '2023-03-22',
    invoiceCount: 12,
    isExcluded: false,
    clv: 98000,
    churnRisk: 'medium',
  },
  {
    id: '3',
    name: 'Manufacturing Co',
    email: 'billing@mfg.com',
    platform: 'stripe',
    mrr: 21900, // DKK equivalent
    originalMrr: 21900,
    currency: 'DKK',
    status: 'paused',
    billingFrequency: 'yearly',
    joinDate: '2022-11-08',
    invoiceCount: 6,
    isExcluded: false,
    clv: 156000,
    churnRisk: 'high',
  },
  {
    id: '4',
    name: 'Digital Agency',
    email: 'pay@digitalag.com',
    platform: 'e-conomic',
    mrr: 6500, // DKK
    originalMrr: 6500,
    currency: 'DKK',
    status: 'active',
    billingFrequency: 'monthly',
    joinDate: '2023-02-10',
    invoiceCount: 18,
    isExcluded: false,
    clv: 72000,
    churnRisk: 'low',
  },
  {
    id: '5',
    name: 'StartupCorp',
    email: 'finance@startup.com',
    platform: 'stripe',
    mrr: 8200, // DKK equivalent
    originalMrr: 8200,
    currency: 'DKK',
    status: 'active',
    billingFrequency: 'monthly',
    joinDate: '2023-04-01',
    invoiceCount: 10,
    isExcluded: false,
    clv: 85000,
    churnRisk: 'medium',
  },
  {
    id: '6',
    name: 'Excluded Corp',
    email: 'test@excluded.com',
    platform: 'shopify',
    mrr: 0, // Excluded
    originalMrr: 4500,
    currency: 'DKK',
    status: 'active',
    billingFrequency: 'monthly',
    joinDate: '2023-01-20',
    invoiceCount: 8,
    isExcluded: true,
    exclusionReason: 'One-time project payment, not recurring revenue',
    excludedDate: '2024-01-15',
    excludedBy: 'Magnus B.',
    clv: 0,
    churnRisk: 'low',
  },
];

export const mockMRRData: MRRData[] = [
  { month: 'Sep 2023', mrr: 608000, growth: 5.2, newRevenue: 82000, churn: -31000, netNew: 51000, customers: 198, currency: 'DKK' },
  { month: 'Oct 2023', mrr: 666000, growth: 9.4, newRevenue: 104000, churn: -46000, netNew: 58000, customers: 212, currency: 'DKK' },
  { month: 'Nov 2023', mrr: 703000, growth: 5.5, newRevenue: 87000, churn: -50000, netNew: 37000, customers: 225, currency: 'DKK' },
  { month: 'Dec 2023', mrr: 740000, growth: 5.3, newRevenue: 97000, churn: -60000, netNew: 37000, customers: 241, currency: 'DKK' },
  { month: 'Jan 2024', mrr: 777000, growth: 5.0, newRevenue: 104000, churn: -67000, netNew: 37000, customers: 253, currency: 'DKK' },
  { month: 'Feb 2024', mrr: 858000, growth: 10.4, newRevenue: 127000, churn: -46000, netNew: 81000, customers: 284, currency: 'DKK' },
];

export const mockMetrics: MetricData[] = [
  {
    title: 'Monthly Revenue',
    value: '85 kr',
    change: '+81.000 kr (+10.4%)',
    trend: 'up',
    description: 'vs last month',
    currency: 'DKK'
  },
  {
    title: 'Total Customers',
    value: '284',
    change: '+31 (+12.3%)',
    trend: 'up',
    description: 'vs last month'
  },
  {
    title: 'Monthly Growth',
    value: '+10.4%',
    change: '+5.4pp',
    trend: 'up',
    description: 'vs last month'
  },
  {
    title: 'Annual Revenue',
    value: '10.3M kr',
    change: '+1.9M kr (+22.8%)',
    trend: 'up',
    description: 'vs last year',
    currency: 'DKK'
  },
];

export const mockPlatformBreakdown: PlatformBreakdown[] = [
  {
    platform: 'E-conomic',
    revenue: 371000, // DKK
    percentage: 43.2,
    customers: 128,
    color: '#3b82f6',
    currency: 'DKK',
    lastSync: '5 minutes ago',
    status: 'connected'
  },
  {
    platform: 'Shopify',
    revenue: 265000, // DKK
    percentage: 30.9,
    customers: 89,
    color: '#10b981',
    currency: 'DKK',
    lastSync: '1 hour ago',
    status: 'connected'
  },
  {
    platform: 'Stripe',
    revenue: 222000, // DKK
    percentage: 25.9,
    customers: 67,
    color: '#f59e0b',
    currency: 'DKK',
    lastSync: '15 minutes ago',
    status: 'connected'
  },
];

export const mockSyncStatus: SyncStatus[] = [
  {
    platform: 'e-conomic',
    status: 'connected',
    lastSync: '5 minutes ago',
    nextSync: 'In 10 minutes',
    customers: 128,
    revenue: 371000,
    syncFrequency: 'Every 15 minutes',
    errorCount: 0,
    currency: 'DKK'
  },
  {
    platform: 'shopify',
    status: 'connected',
    lastSync: '1 hour ago',
    nextSync: 'In 14 minutes',
    customers: 89,
    revenue: 265000,
    syncFrequency: 'Every 15 minutes',
    errorCount: 1,
    lastError: 'Rate limit exceeded',
    currency: 'DKK'
  },
  {
    platform: 'stripe',
    status: 'connected',
    lastSync: '15 minutes ago',
    nextSync: 'In 5 minutes',
    customers: 67,
    revenue: 222000,
    syncFrequency: 'Every 15 minutes',
    errorCount: 0,
    currency: 'DKK'
  },
];

export const mockCohortData: CohortData[] = [
  { month: 'Jan 2024', newCustomers: 28, retention: [100, 85, 78, 72, 68, 65], revenue: [82000, 69700, 64000, 59000, 55800, 53300] },
  { month: 'Feb 2024', newCustomers: 31, retention: [100, 87, 80, 74, 70], revenue: [95000, 82650, 76000, 70300, 66500] },
  { month: 'Mar 2024', newCustomers: 23, retention: [100, 89, 83, 77], revenue: [71000, 63190, 58930, 54670] },
  { month: 'Apr 2024', newCustomers: 19, retention: [100, 84, 77], revenue: [58000, 48720, 44660] },
  { month: 'May 2024', newCustomers: 25, retention: [100, 88], revenue: [78000, 68640] },
  { month: 'Jun 2024', newCustomers: 33, retention: [100], revenue: [102000] },
];

export const mockChurnData: ChurnData[] = [
  { month: 'Sep 2023', churnRate: 2.1, churnedCustomers: 4, churnedRevenue: 31000, atRiskCustomers: 8 },
  { month: 'Oct 2023', churnRate: 2.8, churnedCustomers: 6, churnedRevenue: 46000, atRiskCustomers: 12 },
  { month: 'Nov 2023', churnRate: 3.2, churnedCustomers: 7, churnedRevenue: 50000, atRiskCustomers: 15 },
  { month: 'Dec 2023', churnRate: 2.4, churnedCustomers: 6, churnedRevenue: 60000, atRiskCustomers: 11 },
  { month: 'Jan 2024', churnRate: 1.8, churnedCustomers: 5, churnedRevenue: 67000, atRiskCustomers: 9 },
  { month: 'Feb 2024', churnRate: 2.4, churnedCustomers: 7, churnedRevenue: 46000, atRiskCustomers: 12 },
];

export const mockAuditLog: AuditLogEntry[] = [
  {
    id: '1',
    timestamp: '2024-02-15 14:25:00',
    userId: 'user1',
    userName: 'Magnus B.',
    action: 'exclude_customer',
    resourceId: '6',
    resourceType: 'customer',
    oldValue: { isExcluded: false, mrr: 4500 },
    newValue: { isExcluded: true, mrr: 0 },
    reason: 'One-time project payment, not recurring revenue',
    impact: { mrrChange: -4500, currency: 'DKK' }
  },
  {
    id: '2',
    timestamp: '2024-02-14 10:15:00',
    userId: 'user1',
    userName: 'Magnus B.',
    action: 'update_billing_frequency',
    resourceId: '3',
    resourceType: 'customer',
    oldValue: { billingFrequency: 'monthly' },
    newValue: { billingFrequency: 'yearly' },
    reason: 'Customer switched to annual plan',
    impact: { mrrChange: 0, currency: 'DKK' }
  },
];

export const mockInvoices: Invoice[] = [
  {
    id: 'inv1',
    customerId: '1',
    date: '2024-02-01',
    amount: 16400,
    currency: 'DKK',
    status: 'paid',
    billingFrequency: 'monthly',
    isExcluded: false,
    type: 'subscription'
  },
  {
    id: 'inv2',
    customerId: '1',
    date: '2024-01-01',
    amount: 16400,
    currency: 'DKK',
    status: 'paid',
    billingFrequency: 'monthly',
    isExcluded: false,
    type: 'subscription'
  },
  {
    id: 'inv3',
    customerId: '1',
    date: '2023-12-01',
    amount: 5000,
    currency: 'DKK',
    status: 'paid',
    billingFrequency: 'monthly',
    isExcluded: true,
    exclusionReason: 'Setup fee - one-time charge',
    type: 'setup'
  },
];

// Utility functions
export const formatCurrency = (amount: number, currency: Currency = 'DKK'): string => {
  const formatters = {
    'DKK': new Intl.NumberFormat('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0 }),
    'EUR': new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }),
    'USD': new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }),
  };
  return formatters[currency].format(amount);
};

export const convertCurrency = (amount: number, fromCurrency: Currency, toCurrency: Currency): number => {
  if (fromCurrency === toCurrency) return amount;
  
  const rate = mockCurrencyRates.find(r => r.from === fromCurrency && r.to === toCurrency)?.rate;
  return rate ? amount * rate : amount;
};