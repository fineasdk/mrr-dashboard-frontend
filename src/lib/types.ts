export type Currency = 'DKK' | 'EUR' | 'USD';
export type Platform = 'e-conomic' | 'shopify' | 'stripe';
export type CustomerStatus = 'active' | 'paused' | 'inactive';
export type BillingFrequency = 'monthly' | 'yearly' | 'quarterly';

export interface Customer {
  id: string;
  name: string;
  email: string;
  platform: Platform;
  mrr: number;
  originalMrr: number;
  currency: Currency;
  status: CustomerStatus;
  billingFrequency: BillingFrequency;
  joinDate: string;
  invoiceCount: number;
  isExcluded: boolean;
  exclusionReason?: string;
  excludedDate?: string;
  excludedBy?: string;
  isTemporaryExclusion?: boolean;
  exclusionExpiry?: string;
  clv: number;
  churnRisk: 'low' | 'medium' | 'high';
}

export interface Invoice {
  id: string;
  customerId: string;
  date: string;
  amount: number;
  currency: Currency;
  status: 'paid' | 'pending' | 'failed' | 'refunded';
  billingFrequency: BillingFrequency;
  isExcluded: boolean;
  exclusionReason?: string;
  type: 'subscription' | 'setup' | 'one-time' | 'refund';
}

export interface MRRData {
  month: string;
  date?: string; // Support both month and date properties
  mrr: number;
  value?: number; // Support both mrr and value properties
  growth: number;
  newRevenue: number;
  churn: number;
  netNew: number;
  customers: number;
  currency: Currency;
}

export interface MetricData {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  description?: string;
  currency?: Currency;
}

export interface PlatformBreakdown {
  platform: string;
  revenue: number;
  percentage: number;
  customers: number;
  color: string;
  currency: Currency;
  lastSync: string;
  status: 'connected' | 'error' | 'syncing';
}

export interface SyncStatus {
  platform: Platform;
  status: 'connected' | 'error' | 'syncing';
  lastSync: string;
  nextSync?: string;
  customers: number;
  revenue: number;
  syncFrequency: string;
  errorCount: number;
  lastError?: string;
  currency: Currency;
}

export interface CohortData {
  month: string;
  newCustomers: number;
  retention: number[];
  revenue: number[];
}

export interface ChurnData {
  month: string;
  churnRate: number;
  churnedCustomers: number;
  churnedRevenue: number;
  atRiskCustomers: number;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: 'exclude_customer' | 'include_customer' | 'exclude_invoice' | 'include_invoice' | 'update_billing_frequency';
  resourceId: string;
  resourceType: 'customer' | 'invoice';
  oldValue?: any;
  newValue?: any;
  reason?: string;
  impact: {
    mrrChange: number;
    currency: Currency;
  };
}

export interface CurrencyRate {
  from: Currency;
  to: Currency;
  rate: number;
  lastUpdated: string;
}

export interface RevenueGoals {
  monthlyMrrGrowth: number;
  annualArrGoal: number;
  customerGrowthTarget: number;
  currency: Currency;
}

export interface AnalyticsPreferences {
  defaultTimePeriod: string;
  primaryCurrency: Currency;
  secondaryCurrencies: Currency[];
  showCurrencyConversions: boolean;
  enablePredictiveAnalytics: boolean;
}