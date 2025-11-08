"use client"

import { useEffect, useMemo, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { dashboardApi } from '@/lib/api'
import { formatCurrency } from '@/lib/currency-service'
import { Currency } from '@/lib/types'
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Loader2,
  Search,
} from 'lucide-react'

interface CurrencyBreakdownEntry {
  original_total: number
  converted_total: number
  exchange_rate: number | null
  invoice_count: number
}

interface InvoiceRow {
  invoice_number: string | null
  customer_name: string | null
  type: string | null
  status: string | null
  issued_at: string | null
  occurred_at: string | null
  original_amount: number
  original_currency: string
  converted_amount: number
  converted_currency: string
  exchange_rate: number | null
}

interface MonthlyInvoiceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  platform?: string
  platformName?: string
  month?: string
  monthName?: string
  currency: Currency
}

interface InvoiceResponse {
  platform: string
  month: string
  currency: string
  summary: {
    invoice_count: number
    total_converted: number
    currency_breakdown: Record<string, CurrencyBreakdownEntry>
  }
  invoices: InvoiceRow[]
  meta: {
    page: number
    per_page: number
    total: number
    total_pages: number
  }
}

export function MonthlyInvoiceDialog({
  open,
  onOpenChange,
  platform,
  platformName,
  month,
  monthName,
  currency,
}: MonthlyInvoiceDialogProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [perPage] = useState(50)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [data, setData] = useState<InvoiceResponse | null>(null)

  const toCurrency = (code: string): Currency =>
    (['DKK', 'EUR', 'USD'] as Currency[]).includes(code as Currency)
      ? (code as Currency)
      : currency

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search.trim())
    }, 300)

    return () => clearTimeout(timeout)
  }, [search])

  useEffect(() => {
    if (!open) {
      setData(null)
      setError('')
      setPage(1)
      setSearch('')
      setDebouncedSearch('')
      return
    }

    if (!platform || !month) {
      return
    }

    const fetchInvoices = async () => {
      setLoading(true)
      setError('')

      try {
        const response = await dashboardApi.getMonthlyInvoices({
          platform,
          month,
          currency,
          page,
          per_page: perPage,
          search: debouncedSearch || undefined,
        })

        if (response.data.success) {
          setData(response.data.data as InvoiceResponse)
        } else {
          setError(response.data.message || 'Failed to load invoices')
        }
      } catch (err: any) {
        setError(err.response?.data?.message || err.message || 'Failed to load invoices')
      } finally {
        setLoading(false)
      }
    }

    fetchInvoices()
  }, [open, platform, month, currency, page, perPage, debouncedSearch])

  const currencyBreakdown = useMemo(() => {
    if (!data) return []
    return Object.entries(data.summary.currency_breakdown || {})
  }, [data])

  const monthLabel = monthName || month || ''
  const platformLabel = platformName || platform || 'Integration'

  const handlePageChange = (direction: 'prev' | 'next') => {
    if (!data) return

    if (direction === 'prev' && page > 1) {
      setPage(page - 1)
    }

    if (direction === 'next' && page < data.meta.total_pages) {
      setPage(page + 1)
    }
  }

  const handleExport = () => {
    if (!data || data.invoices.length === 0) return

    const header = [
      'Invoice Number',
      'Customer',
      'Status',
      'Type',
      'Issued At',
      'Occurred At',
      'Original Amount',
      'Original Currency',
      'Converted Amount',
      'Converted Currency',
      'Exchange Rate',
    ]

    const rows = data.invoices.map((invoice) => {
      return [
        invoice.invoice_number ?? '',
        invoice.customer_name ?? '',
        invoice.status ?? '',
        invoice.type ?? '',
        invoice.issued_at ?? '',
        invoice.occurred_at ?? '',
        invoice.original_amount.toString(),
        invoice.original_currency,
        invoice.converted_amount.toString(),
        invoice.converted_currency,
        invoice.exchange_rate?.toString() ?? '',
      ]
        .map((value) => `"${value.replaceAll('"', '""')}"`)
        .join(',')
    })

    const csvContent = [header.join(','), ...rows].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute(
      'download',
      `${platform ?? 'integration'}-${month ?? 'monthly'}-invoices.csv`
    )
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const totalInvoices = data?.summary.invoice_count ?? 0
  const totalConverted = data ? formatCurrency(data.summary.total_converted, currency) : formatCurrency(0, currency)
  const startIndex = data ? (data.meta.page - 1) * data.meta.per_page + 1 : 0
  const endIndex = data ? Math.min(data.meta.page * data.meta.per_page, data.meta.total) : 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle className="flex flex-col gap-1">
            <span>Invoices for {platformLabel}</span>
            <span className="text-base font-normal text-muted-foreground">
              {monthLabel || 'All invoices'}
            </span>
          </DialogTitle>
          <DialogDescription>
            Review every invoice that makes up the monthly revenue. Use search,
            pagination, and export for reconciliation.
          </DialogDescription>
        </DialogHeader>

        {!platform || !month ? (
          <div className="py-10 text-center text-sm text-muted-foreground">
            Missing context to load invoices.
          </div>
        ) : error ? (
          <div className="py-10 text-center text-sm text-red-600">{error}</div>
        ) : loading && !data ? (
          <div className="py-10 text-center text-sm text-muted-foreground">
            <Loader2 className="mx-auto h-6 w-6 animate-spin" />
            <p className="mt-3">Loading invoices…</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase text-slate-500">
                  Total invoices
                </p>
                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {totalInvoices.toLocaleString()}
                </p>
              </div>
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                <p className="text-xs font-semibold uppercase text-emerald-600">
                  Converted revenue
                </p>
                <p className="mt-2 text-2xl font-bold text-emerald-700">
                  {totalConverted}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase text-slate-500">
                  Page
                </p>
                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {data?.meta.page ?? 1} / {data?.meta.total_pages ?? 1}
                </p>
                <p className="text-xs text-slate-500">
                  Showing {startIndex}-{endIndex} of {data?.meta.total ?? 0}
                </p>
              </div>
            </div>

            {/* Currency breakdown */}
            {currencyBreakdown.length > 0 && (
              <div className="rounded-lg border border-slate-200 bg-white p-4">
                <h4 className="text-sm font-semibold text-slate-800">
                  Currency breakdown
                </h4>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {currencyBreakdown.map(([code, breakdown]) => (
                    <div
                      key={code}
                      className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-900">
                          {code}
                        </span>
                        {breakdown.exchange_rate && (
                          <span className="text-xs text-slate-500">
                            1 {code} → {formatCurrency(breakdown.exchange_rate, currency)}
                          </span>
                        )}
                      </div>
                      <div className="mt-2 flex justify-between text-xs text-slate-600">
                        <span>Original</span>
                        <span className="font-medium text-slate-900">
                          {formatCurrency(breakdown.original_total, toCurrency(code))}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-slate-600">
                        <span>Converted</span>
                        <span className="font-medium text-slate-900">
                          {formatCurrency(breakdown.converted_total, currency)}
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-slate-500">
                        {breakdown.invoice_count} invoice
                        {breakdown.invoice_count === 1 ? '' : 's'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Controls */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search by customer or invoice number"
                  value={search}
                  onChange={(event) => {
                    setPage(1)
                    setSearch(event.target.value)
                  }}
                  className="pl-9"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleExport}
                disabled={!data || data.invoices.length === 0}
              >
                <Download className="mr-2 h-4 w-4" /> Export CSV
              </Button>
            </div>

            {/* Table */}
            <div className="rounded-lg border border-slate-200 bg-white">
              <div className="max-h-[420px] overflow-y-auto">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead>Invoice</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Issued</TableHead>
                      <TableHead>Occurred</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading && data ? (
                      <TableRow>
                        <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                          <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                        </TableCell>
                      </TableRow>
                    ) : data && data.invoices.length > 0 ? (
                      data.invoices.map((invoice, index) => (
                        <TableRow key={`${invoice.invoice_number}-${index}`}>
                          <TableCell>
                            <div className="text-sm font-medium text-slate-900">
                              {invoice.invoice_number ?? 'N/A'}
                            </div>
                            <div className="text-xs text-slate-500">
                              {invoice.original_currency}{' '}
                              {invoice.original_amount.toFixed(2)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-slate-900">
                              {invoice.customer_name ?? 'Unknown customer'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              {invoice.type && (
                                <Badge variant="secondary" className="w-fit text-xs capitalize">
                                  {invoice.type}
                                </Badge>
                              )}
                              {invoice.status && (
                                <Badge
                                  variant={invoice.status === 'paid' ? 'default' : 'secondary'}
                                  className={`w-fit text-xs capitalize ${invoice.status === 'paid' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
                                >
                                  {invoice.status}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-slate-600">
                            {invoice.issued_at ?? '—'}
                          </TableCell>
                          <TableCell className="text-sm text-slate-600">
                            {invoice.occurred_at ?? '—'}
                          </TableCell>
                          <TableCell className="text-right font-semibold text-slate-900">
                            {formatCurrency(invoice.converted_amount, currency)}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                          No invoices found for this month.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Pagination */}
            {data && data.meta.total_pages > 1 && (
              <div className="flex items-center justify-between text-sm text-slate-600">
                <div>
                  Showing {startIndex}-{endIndex} of {data.meta.total} invoices
                  {debouncedSearch && ` for "${debouncedSearch}"`}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange('prev')}
                    disabled={page === 1 || loading}
                  >
                    <ChevronLeft className="mr-1 h-4 w-4" /> Previous
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange('next')}
                    disabled={page === data.meta.total_pages || loading}
                  >
                    Next <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
