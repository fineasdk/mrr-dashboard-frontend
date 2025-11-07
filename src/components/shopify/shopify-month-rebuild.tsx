"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Label } from "../ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"
import { integrationsApi, shopifyApi } from "@/lib/api"
import { Loader2, RefreshCw } from "lucide-react"

type ShopifyIntegration = {
  id: string
  platform_name: string
  status: string
}

type RequestState = {
  loading: boolean
  message: string | null
  error: string | null
  syncLogId?: number
}

const previousMonth = () => {
  const date = new Date()
  date.setDate(1)
  date.setMonth(date.getMonth() - 1)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
}

export function ShopifyMonthRebuild() {
  const [integrations, setIntegrations] = useState<ShopifyIntegration[]>([])
  const [loadingIntegrations, setLoadingIntegrations] = useState(true)
  const [selectedIntegration, setSelectedIntegration] = useState<string>("")
  const [month, setMonth] = useState(previousMonth)
  const [state, setState] = useState<RequestState>({
    loading: false,
    message: null,
    error: null,
  })

  useEffect(() => {
    let mounted = true

    const load = async () => {
      setLoadingIntegrations(true)
      try {
        const response = await integrationsApi.getAll()
        const data = response.data?.data ?? []
        const shopifyIntegrations = data.filter(
          (integration: any) => integration.platform === "shopify"
        )

        if (!mounted) return

        setIntegrations(
          shopifyIntegrations.map((integration: any) => ({
            id: String(integration.id),
            platform_name: integration.platform_name ?? "Shopify",
            status: integration.status,
          }))
        )

        if (shopifyIntegrations.length === 1) {
          setSelectedIntegration(String(shopifyIntegrations[0].id))
        }
      } catch (error: any) {
        if (!mounted) return
        setState((prev) => ({
          ...prev,
          error:
            error?.response?.data?.message ??
            "Failed to load Shopify integrations. Please refresh and try again.",
        }))
      } finally {
        if (mounted) {
          setLoadingIntegrations(false)
        }
      }
    }

    load()

    return () => {
      mounted = false
    }
  }, [])

  const disableAction = useMemo(() => {
    return (
      state.loading ||
      loadingIntegrations ||
      !month ||
      integrations.length === 0 ||
      (!selectedIntegration && integrations.length > 1)
    )
  }, [state.loading, loadingIntegrations, month, integrations, selectedIntegration])

  const handleSubmit = async () => {
    setState({ loading: true, message: null, error: null })
    try {
      const payload: { month: string; integration_id?: string } = { month }
      if (selectedIntegration) {
        payload.integration_id = selectedIntegration
      }

      const response = await shopifyApi.rebuildMonth(payload)
      const syncLogId = response.data?.data?.sync_log_id

      setState({
        loading: false,
        message: "Shopify month rebuild queued successfully.",
        error: null,
        syncLogId,
      })
    } catch (error: any) {
      setState({
        loading: false,
        message: null,
        error:
          error?.response?.data?.message ??
          "Failed to queue Shopify rebuild. Please try again.",
      })
    }
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
          <RefreshCw className="h-5 w-5 text-slate-600" />
          Shopify Data Rebuild
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Reprocess a specific month directly from the Shopify Partner API. This
          refresh is idempotent and only touches the selected month.
        </p>

        {integrations.length === 0 && !loadingIntegrations ? (
          <div className="rounded-md border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-muted-foreground">
            Connect a Shopify Partner integration to enable month rebuilds.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Month</Label>
              <input
                type="month"
                value={month}
                onChange={(event) => setMonth(event.target.value)}
                className="w-full rounded-md border border-input bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
              <p className="text-xs text-muted-foreground">
                Only invoices between the first and last day of this month will
                be refreshed.
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Shopify integration</Label>
              <Select
                value={selectedIntegration}
                onValueChange={setSelectedIntegration}
                disabled={loadingIntegrations || integrations.length <= 1}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={loadingIntegrations ? "Loading" : "Select integration"} />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {integrations.map((integration) => (
                    <SelectItem key={integration.id} value={integration.id}>
                      {integration.platform_name} ({integration.status})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {integrations.length > 1
                  ? "Choose which Shopify Partner connection to rebuild."
                  : "Detected active Shopify Partner connection."}
              </p>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <Button
            onClick={handleSubmit}
            disabled={disableAction}
            className="w-full sm:w-auto"
          >
            {state.loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Queuing rebuild…
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Rebuild month
              </span>
            )}
          </Button>

          {state.syncLogId && (
            <span className="text-xs text-muted-foreground">
              Sync log ID: {state.syncLogId}
            </span>
          )}
        </div>

        {state.message && (
          <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {state.message}
          </div>
        )}

        {state.error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {state.error}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
