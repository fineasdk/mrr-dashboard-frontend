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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  const pageSizeOptions = [50, 100, 250, 500] as const
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState<number>(pageSizeOptions[0])
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

  const handlePageSizeChange = (value: string) => {
    const parsed = Number(value)
    if (!Number.isNaN(parsed) && parsed > 0) {
      setPage(1)
      setPerPage(parsed)
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
      <DialogContent className="w-[95vw] max-w-7xl overflow-hidden rounded-3xl border border-slate-200 bg-white p-0 shadow-xl">
        <div className="flex max-h-[80vh] flex-col">
          <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-violet-500 to-emerald-500" />
          <DialogHeader className="border-b border-slate-200 bg-white px-6 py-5">
            <DialogTitle className="flex flex-col gap-1">
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">{platformLabel}</span>
              <span className="text-3xl font-bold text-slate-900">
                {monthLabel || 'All invoices'}
              </span>
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-600">
              Browse every invoice in a fast, friendly view. Use search, pagination, or export to reconcile with confidence.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto bg-slate-50/80">
            {!platform || !month ? (
              <div className="px-6 py-12 text-center text-sm text-slate-500">
                Missing context to load invoices.
              </div>
            ) : error ? (
              <div className="px-6 py-12 text-center text-sm text-red-600">{error}</div>
            ) : loading && !data ? (
              <div className="px-6 py-12 text-center text-sm text-slate-500">
                <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                <p className="mt-3">Loading invoices…</p>
              </div>
            ) : (
              <div className="space-y-6 px-6 py-6">
                {/* Summary */}
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Total invoices
                      <Badge variant="secondary" className="rounded-full bg-slate-100 text-slate-600">
                        {data?.meta.total_pages ?? 1} pages
                      </Badge>
                    </p>
                    <p className="mt-3 text-3xl font-bold text-slate-900">
                      {totalInvoices.toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-500">
                      Fast filtering, paging, and export for every record.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-emerald-200/60 bg-gradient-to-br from-emerald-50 via-white to-white p-5 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                      Converted revenue
                    </p>
                    <p className="mt-3 text-3xl font-bold text-emerald-700">
                      {totalConverted}
                    </p>
                    <p className="text-xs text-emerald-700/70">
                      Captures refunds and multi-currency conversions.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Currently viewing
                    </p>
                    <p className="mt-3 text-3xl font-bold text-slate-900">
                      {data?.meta.page ?? 1} / {data?.meta.total_pages ?? 1}
                    </p>
                    <p className="text-xs text-slate-500">
                      Showing {startIndex}-{endIndex} of {data?.meta.total ?? 0}
                    </p>
                  </div>
                </div>

                {/* Currency breakdown */}
                {currencyBreakdown.length > 0 && (
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
                      Currency breakdown
                    </h4>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {currencyBreakdown.map(([code, breakdown]) => (
                        <div
                          key={code}
                          className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm shadow-sm"
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
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="relative w-full sm:w-72">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        placeholder="Search by customer or invoice number"
                        value={search}
                        onChange={(event) => {
                          setPage(1)
                          setSearch(event.target.value)
                        }}
                        className="h-11 rounded-full border-slate-200 bg-white pl-9 shadow-sm"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        Rows per page
                      </span>
                      <Select value={String(perPage)} onValueChange={handlePageSizeChange}>
                        <SelectTrigger className="w-28 rounded-full border-slate-200 bg-white shadow-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {pageSizeOptions.map((size) => (
                            <SelectItem key={size} value={String(size)}>
                              {size}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleExport}
                      className="h-11 rounded-full border-slate-200 bg-white px-5 shadow-sm"
                      disabled={!data || data.invoices.length === 0}
                    >
                      <Download className="mr-2 h-4 w-4" /> Export CSV
                    </Button>
                  </div>
                </div>

                {/* Table */}
                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="max-h-[420px] overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-100">
                          <TableHead className="sticky top-0 z-10 bg-slate-100">Invoice</TableHead>
                          <TableHead className="sticky top-0 z-10 bg-slate-100">Customer</TableHead>
                          <TableHead className="sticky top-0 z-10 bg-slate-100">Status</TableHead>
                          <TableHead className="sticky top-0 z-10 bg-slate-100">Issued</TableHead>
                          <TableHead className="sticky top-0 z-10 bg-slate-100">Occurred</TableHead>
                          <TableHead className="sticky top-0 z-10 bg-slate-100 text-right">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loading && data ? (
                          <TableRow>
                            <TableCell colSpan={6} className="py-10 text-center text-sm text-slate-500">
                              <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                            </TableCell>
                          </TableRow>
                        ) : data && data.invoices.length > 0 ? (
                          data.invoices.map((invoice, index) => (
                            <TableRow
                              key={`${invoice.invoice_number}-${index}`}
                              className="hover:bg-slate-50"
                            >
                              <TableCell>
                                <div className="text-sm font-semibold text-slate-900">
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
                                    <Badge variant="secondary" className="w-fit rounded-full bg-slate-200/70 text-xs capitalize text-slate-600">
                                      {invoice.type}
                                    </Badge>
                                  )}
                                  {invoice.status && (
                                    <Badge
                                      variant={invoice.status === 'paid' ? 'default' : 'secondary'}
                                      className={`w-fit rounded-full text-xs capitalize ${invoice.status === 'paid' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-slate-200/60 text-slate-600'}`}
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
                            <TableCell colSpan={6} className="py-10 text-center text-sm text-slate-500">
                              No invoices found for this month.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* Pagination */}
                {data && (
                  <div className="flex flex-col gap-3 text-sm text-slate-600 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      Showing {startIndex}-{endIndex} of {data.meta.total} invoices
                      {debouncedSearch && ` for "${debouncedSearch}"`}. Use the pager to review every record.
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange('prev')}
                        className="rounded-full px-4"
                        disabled={page === 1 || loading}
                      >
                        <ChevronLeft className="mr-1 h-4 w-4" /> Previous
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange('next')}
                        className="rounded-full px-4"
                        disabled={page === data.meta.total_pages || loading}
                      >
                        Next <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
