"use client"

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CsvImport } from "@/components/import/csv-import"
import { FileSpreadsheet, Settings as SettingsIcon, Sliders } from "lucide-react"
import { Button } from '../ui/button'
import { Switch } from '../ui/switch'
import { Label } from '../ui/label'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '../ui/select'
import { ShopifyMonthRebuild } from '../shopify/shopify-month-rebuild'

export function SettingsPage() {
  const [primaryCurrency, setPrimaryCurrency] = useState('DKK')
  const [autoExcludeSetupFees, setAutoExcludeSetupFees] = useState(true)
  const [normalizeAnnualSubscriptions, setNormalizeAnnualSubscriptions] = useState(true)

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground text-sm sm:text-base mt-2">
          Manage your dashboard preferences and import historical data
        </p>
      </div>

      <Tabs defaultValue="import" className="space-y-6">
        {/* <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="import" className="gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            <span className="hidden sm:inline">Import Data</span>
            <span className="sm:hidden">Import</span>
          </TabsTrigger>
          <TabsTrigger value="preferences" className="gap-2">
            <Sliders className="h-4 w-4" />
            <span className="hidden sm:inline">Preferences</span>
            <span className="sm:hidden">Settings</span>
          </TabsTrigger>
        </TabsList> */}

        <TabsContent value="import">
          <div className="space-y-6">
            <CsvImport />
            <ShopifyMonthRebuild />
          </div>
        </TabsContent>

        <TabsContent value="preferences">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-4 sm:gap-6">
            {/* Currency Settings */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg sm:text-xl">Currency Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Primary Currency</Label>
                  <Select value={primaryCurrency} onValueChange={setPrimaryCurrency}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="DKK">🇩🇰 Danish Krone (DKK)</SelectItem>
                      <SelectItem value="EUR">🇪🇺 Euro (EUR)</SelectItem>
                      <SelectItem value="USD">🇺🇸 US Dollar (USD)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    All revenue will be converted to this currency for reporting
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* MRR Calculation Settings */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg sm:text-xl">MRR Calculation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-0.5">
                    <Label className="text-sm font-medium">Auto-exclude setup fees</Label>
                    <p className="text-xs text-muted-foreground">
                      Automatically exclude one-time setup fees from MRR calculations
                    </p>
                  </div>
                  <Switch 
                    checked={autoExcludeSetupFees} 
                    onCheckedChange={setAutoExcludeSetupFees}
                    className="shrink-0"
                  />
                </div>

                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-0.5">
                    <Label className="text-sm font-medium">Normalize annual subscriptions</Label>
                    <p className="text-xs text-muted-foreground">
                      Convert yearly subscriptions to monthly equivalents (÷12)
                    </p>
                  </div>
                  <Switch 
                    checked={normalizeAnnualSubscriptions} 
                    onCheckedChange={setNormalizeAnnualSubscriptions}
                    className="shrink-0"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}








