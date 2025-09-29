'use client'

import { useState, useEffect } from 'react'
import {
  ShoppingBag,
  Plus,
  Key,
  Trash2,
  Users,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { shopifyApi } from '@/lib/api'

interface Shop {
  shop_domain: string
  installation_id: string
  has_token: boolean
  status: string
}

interface ShopifyShopsManagerProps {
  integrationId: number
}

export function ShopifyShopsManager({
  integrationId,
}: ShopifyShopsManagerProps) {
  const [shops, setShops] = useState<Shop[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null)
  const [isTokenDialogOpen, setIsTokenDialogOpen] = useState(false)
  const [tokenForm, setTokenForm] = useState({ access_token: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    loadShops()
  }, [])

  const loadShops = async () => {
    try {
      setIsLoading(true)
      const response = await shopifyApi.listShops()
      if (response.data.success) {
        setShops(response.data.data)
      } else {
        setError(response.data.message || 'Failed to load shops')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load shops')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddToken = (shop: Shop) => {
    setSelectedShop(shop)
    setTokenForm({ access_token: '' })
    setIsTokenDialogOpen(true)
  }

  const handleSubmitToken = async () => {
    if (!selectedShop || !tokenForm.access_token) return

    try {
      setIsSubmitting(true)
      const response = await shopifyApi.storeShopToken(
        selectedShop.shop_domain,
        {
          access_token: tokenForm.access_token,
        }
      )

      if (response.data.success) {
        setIsTokenDialogOpen(false)
        setTokenForm({ access_token: '' })
        await loadShops() // Refresh the list
      } else {
        setError(response.data.message || 'Failed to store token')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to store token')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRemoveToken = async (shopDomain: string) => {
    if (!confirm(`Remove access token for ${shopDomain}?`)) return

    try {
      const response = await shopifyApi.removeShopToken(shopDomain)
      if (response.data.success) {
        await loadShops() // Refresh the list
      } else {
        setError(response.data.message || 'Failed to remove token')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to remove token')
    }
  }

  const handleViewCustomers = async (shopDomain: string) => {
    try {
      const response = await shopifyApi.getShopCustomers(shopDomain)
      if (response.data.success) {
        const customerCount = response.data.data.customer_count
        alert(`${shopDomain} has ${customerCount} customers`)
      } else {
        setError(response.data.message || 'Failed to get customers')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to get customers')
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className='flex items-center justify-center py-8'>
          <Loader2 className='h-6 w-6 animate-spin mr-2' />
          Loading shops...
        </CardContent>
      </Card>
    )
  }

  return (
    <div className='space-y-4'>
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <ShoppingBag className='h-5 w-5' />
            Shop-Specific Access Management
          </CardTitle>
          <CardDescription>
            Manage individual shop access tokens to get detailed customer and
            order data from each shop. Partner API provides app-level data, but
            individual shop tokens enable customer-level insights.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant='destructive' className='mb-4'>
              <AlertCircle className='h-4 w-4' />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {shops.length === 0 ? (
            <div className='text-center py-8 text-gray-500'>
              <ShoppingBag className='h-12 w-12 mx-auto mb-4 text-gray-300' />
              <p>No shops found in your Partner account</p>
              <p className='text-sm'>
                Make sure your Partner API has the correct permissions
              </p>
            </div>
          ) : (
            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
              {shops.map((shop) => (
                <Card key={shop.shop_domain} className='relative'>
                  <CardHeader className='pb-3'>
                    <div className='flex items-center justify-between'>
                      <CardTitle className='text-sm font-medium truncate'>
                        {shop.shop_domain}
                      </CardTitle>
                      <Badge
                        variant={shop.has_token ? 'default' : 'secondary'}
                        className='ml-2'
                      >
                        {shop.has_token ? (
                          <CheckCircle className='h-3 w-3 mr-1' />
                        ) : (
                          <XCircle className='h-3 w-3 mr-1' />
                        )}
                        {shop.has_token ? 'Connected' : 'No Token'}
                      </Badge>
                    </div>
                    <p className='text-xs text-gray-500'>
                      Installation: {shop.installation_id}
                    </p>
                  </CardHeader>
                  <CardContent className='pt-0'>
                    <div className='flex gap-2'>
                      {shop.has_token ? (
                        <>
                          <Button
                            size='sm'
                            variant='outline'
                            onClick={() =>
                              handleViewCustomers(shop.shop_domain)
                            }
                            className='flex-1'
                          >
                            <Users className='h-3 w-3 mr-1' />
                            Customers
                          </Button>
                          <Button
                            size='sm'
                            variant='destructive'
                            onClick={() => handleRemoveToken(shop.shop_domain)}
                          >
                            <Trash2 className='h-3 w-3' />
                          </Button>
                        </>
                      ) : (
                        <Button
                          size='sm'
                          onClick={() => handleAddToken(shop)}
                          className='flex-1'
                        >
                          <Key className='h-3 w-3 mr-1' />
                          Add Token
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isTokenDialogOpen} onOpenChange={setIsTokenDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Shop Access Token</DialogTitle>
            <DialogDescription>
              Add an access token for{' '}
              <strong>{selectedShop?.shop_domain}</strong> to enable customer
              and order data access.
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-4'>
            <div>
              <Label htmlFor='access_token'>Shop Access Token</Label>
              <Input
                id='access_token'
                type='password'
                placeholder='shpat_...'
                value={tokenForm.access_token}
                onChange={(e) => setTokenForm({ access_token: e.target.value })}
                className='font-mono'
              />
              <p className='text-sm text-gray-500 mt-1'>
                Get this from your shop&apos;s admin → Apps → Private apps or
                through OAuth flow
              </p>
            </div>

            <Alert>
              <AlertCircle className='h-4 w-4' />
              <AlertDescription>
                <strong>Required permissions:</strong> read_customers,
                read_orders, read_products
              </AlertDescription>
            </Alert>

            <div className='flex gap-2 justify-end'>
              <Button
                variant='outline'
                onClick={() => setIsTokenDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitToken}
                disabled={!tokenForm.access_token || isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className='h-4 w-4 animate-spin mr-2' />
                ) : (
                  <Key className='h-4 w-4 mr-2' />
                )}
                Add Token
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
