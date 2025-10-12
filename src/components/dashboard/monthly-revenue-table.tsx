'use client'

import { useState, useEffect } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  ChevronDown,
  ChevronRight,
  Download,
  Calendar,
  DollarSign,
} from 'lucide-react'
import { api } from '@/lib/api'
import { formatCurrency } from '@/lib/mock-data'
import { Currency } from '@/lib/types'

interface MonthlyRevenue {
  month: string
  month_name: string
  revenue: number
  invoice_count: number
  currency: string
  invoices: Array<{
    invoice_number: string
    customer_name: string
    amount: number
    type: string
    status: string
    issued_at: string
  }>
}

interface PlatformData {
  platform: string
  platform_name: string
  total_revenue: number
  monthly_breakdown: MonthlyRevenue[]
}

interface MonthlyRevenueTableProps {
  currency?: Currency
  defaultPlatform?: string
}

export function MonthlyRevenueTable({
  currency = 'DKK',
  defaultPlatform,
}: MonthlyRevenueTableProps) {
  const [data, setData] = useState<Record<string, PlatformData>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set())
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(
    defaultPlatform || 'shopify'
  )

  useEffect(() => {
    loadMonthlyRevenue()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currency, selectedPlatform])

  const loadMonthlyRevenue = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await api.get('/dashboard/monthly-revenue', {
        params: {
          currency,
          platform: selectedPlatform,
        },
      })

      if (response.data.success) {
        setData(response.data.data.platforms)
      } else {
        setError('Failed to load monthly revenue data')
      }
    } catch (err: any) {
      console.error('Failed to load monthly revenue:', err)
      setError(err.response?.data?.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const toggleMonth = (monthKey: string) => {
    const newExpanded = new Set(expandedMonths)
    if (newExpanded.has(monthKey)) {
      newExpanded.delete(monthKey)
    } else {
      newExpanded.add(monthKey)
    }
    setExpandedMonths(newExpanded)
  }

  const exportToCSV = () => {
    if (!selectedPlatform || !data[selectedPlatform]) return

    const platformData = data[selectedPlatform]
    let csv = 'Month,Revenue,Invoice Count,Currency\n'

    platformData.monthly_breakdown.forEach((month) => {
      csv += `${month.month_name},${month.revenue},${month.invoice_count},${month.currency}\n`
    })

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${selectedPlatform}-monthly-revenue-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Monthly Revenue Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Monthly Revenue Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-red-600">{error}</div>
        </CardContent>
      </Card>
    )
  }

  const platformData = selectedPlatform ? data[selectedPlatform] : null

  if (!platformData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Monthly Revenue Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            No revenue data available for this platform
          </div>
        </CardContent>
      </Card>
    )
  }

  // Sort monthly breakdown by date (newest first) and filter out months with no revenue
  const sortedMonths = [...platformData.monthly_breakdown]
    .filter((month) => month.revenue > 0 || month.invoice_count > 0) // Only show months with data
    .sort((a, b) => b.month.localeCompare(a.month))

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Monthly Revenue Breakdown
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Historical revenue by month for bookkeeping
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={exportToCSV}
              className="btn-secondary"
            >
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Platform Selector */}
        <div className="flex gap-2 mb-4">
          {Object.keys(data).map((platform) => (
            <Button
              key={platform}
              variant={selectedPlatform === platform ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedPlatform(platform)}
              className={
                selectedPlatform === platform
                  ? 'btn-primary'
                  : 'btn-secondary'
              }
            >
              {data[platform].platform_name}
            </Button>
          ))}
        </div>

        {/* Total Revenue Summary */}
        <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-900">
                Total Revenue ({sortedMonths.length} months with data)
              </p>
              <p className="text-2xl font-bold text-green-700 mt-1">
                {formatCurrency(platformData.total_revenue, currency)}
              </p>
              {sortedMonths.length > 0 && (
                <p className="text-xs text-green-600 mt-1">
                  {sortedMonths[sortedMonths.length - 1].month_name} to{' '}
                  {sortedMonths[0].month_name}
                </p>
              )}
            </div>
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        {/* Info Message */}
        {sortedMonths.length > 0 && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              ℹ️ Showing only months with revenue data. Empty months are hidden
              for clarity.
            </p>
          </div>
        )}

        {/* No Data Message */}
        {sortedMonths.length === 0 && (
          <div className="mb-6 p-8 bg-slate-50 border border-slate-200 rounded-lg text-center">
            <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-2">
              No Revenue Data Available
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              No transactions found for this platform in the last 24 months.
            </p>
            <p className="text-xs text-slate-500">
              This is normal if the integration was recently connected. New data
              will appear as transactions are synced.
            </p>
          </div>
        )}

        {/* Monthly Breakdown Table */}
        {sortedMonths.length > 0 && (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="w-12"></TableHead>
                  <TableHead className="font-semibold">Month</TableHead>
                  <TableHead className="font-semibold text-right">
                    Revenue
                  </TableHead>
                  <TableHead className="font-semibold text-center">
                    Invoices
                  </TableHead>
                  <TableHead className="font-semibold text-center">
                    Status
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
              {sortedMonths.map((month) => {
                const isExpanded = expandedMonths.has(month.month)
                return (
                  <>
                    <TableRow
                      key={month.month}
                      className="hover:bg-slate-50 cursor-pointer"
                      onClick={() => toggleMonth(month.month)}
                    >
                      <TableCell>
                        <Button variant="ghost" size="sm" className="p-0 h-6 w-6">
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                      <TableCell className="font-medium">
                        {month.month_name}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-green-700">
                        {formatCurrency(month.revenue, currency)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">
                          {month.invoice_count} invoices
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {month.revenue > 0 ? (
                          <Badge className="bg-green-500 hover:bg-green-600">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="secondary">No Revenue</Badge>
                        )}
                      </TableCell>
                    </TableRow>

                    {/* Expanded Invoice Details */}
                    {isExpanded && month.invoices.length > 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="bg-slate-50 p-0">
                          <div className="p-4">
                            <h4 className="text-sm font-semibold mb-3 text-slate-700">
                              Invoice Details ({month.invoices.length})
                            </h4>
                            <div className="space-y-2">
                              {month.invoices.map((invoice, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between p-3 bg-white rounded-md border border-slate-200 text-sm"
                                >
                                  <div className="flex-1">
                                    <p className="font-medium text-slate-900">
                                      {invoice.customer_name}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                      {invoice.invoice_number} •{' '}
                                      {invoice.issued_at}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <Badge
                                      variant={
                                        invoice.type === 'subscription'
                                          ? 'default'
                                          : 'secondary'
                                      }
                                      className="text-xs"
                                    >
                                      {invoice.type}
                                    </Badge>
                                    <Badge
                                      variant={
                                        invoice.status === 'paid'
                                          ? 'default'
                                          : 'secondary'
                                      }
                                      className={
                                        invoice.status === 'paid'
                                          ? 'bg-green-500 hover:bg-green-600'
                                          : ''
                                      }
                                    >
                                      {invoice.status}
                                    </Badge>
                                    <span className="font-semibold text-slate-900 min-w-[100px] text-right">
                                      {formatCurrency(invoice.amount, currency)}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}

                    {isExpanded && month.invoices.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="bg-slate-50 p-4 text-center text-sm text-slate-500"
                        >
                          No invoices for this month
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                )
              })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

