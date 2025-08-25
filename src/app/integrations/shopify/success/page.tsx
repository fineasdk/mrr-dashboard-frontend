"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, Loader2, ShoppingBag, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

export default function ShopifySuccessPage() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { label: 'Connection Established', description: 'Successfully connected to Shopify' },
    { label: 'Syncing Customers', description: 'Importing customer data' },
    { label: 'Syncing Orders', description: 'Processing order history' },
    { label: 'Calculating MRR', description: 'Computing monthly recurring revenue' },
    { label: 'Setup Complete', description: 'Your Shopify data is ready' },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + 2;
      });
    }, 100);

    const stepTimer = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= steps.length - 1) {
          clearInterval(stepTimer);
          return prev;
        }
        return prev + 1;
      });
    }, 2000);

    // Auto-redirect after completion
    const redirectTimer = setTimeout(() => {
      router.push('/dashboard');
    }, 12000);

    return () => {
      clearInterval(timer);
      clearInterval(stepTimer);
      clearTimeout(redirectTimer);
    };
  }, [router]);

  const connectingDomain = typeof window !== 'undefined' 
    ? localStorage.getItem('shopify_connecting_domain') 
    : null;

  const handleGoToDashboard = () => {
    router.push('/dashboard');
  };

  const handleViewIntegrations = () => {
    router.push('/integrations');
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <div className="space-y-6">
        {/* Success Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Shopify Connected!</h1>
          <p className="text-gray-600">
            {connectingDomain && (
              <>
                Your store <span className="font-mono font-medium">{connectingDomain}</span> has been connected successfully.
              </>
            )}
            {!connectingDomain && (
              <>Your Shopify store has been connected successfully.</>
            )}
          </p>
        </div>

        {/* Progress Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" />
              Setting Up Your Integration
            </CardTitle>
            <CardDescription>
              We're now syncing your Shopify data. This process usually takes a few minutes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Steps */}
            <div className="space-y-3">
              {steps.map((step, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    {index < currentStep ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : index === currentStep ? (
                      <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${
                      index <= currentStep ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {step.label}
                    </p>
                    <p className={`text-xs ${
                      index <= currentStep ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      {step.description}
                    </p>
                  </div>
                  {index < currentStep && (
                    <Badge variant="secondary" className="text-xs">
                      Complete
                    </Badge>
                  )}
                  {index === currentStep && (
                    <Badge variant="default" className="text-xs">
                      In Progress
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">What's Next?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Real-time Sync</p>
                  <p className="text-sm text-gray-600">
                    We've set up webhooks to automatically sync new orders and customers
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">MRR Calculations</p>
                  <p className="text-sm text-gray-600">
                    Your dashboard will show accurate MRR based on subscription orders
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Growth Analytics</p>
                  <p className="text-sm text-gray-600">
                    Track customer growth, churn, and revenue trends over time
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={handleGoToDashboard} 
            className="flex-1"
            size="lg"
          >
            <ArrowRight className="w-4 h-4 mr-2" />
            View Dashboard
          </Button>
          <Button 
            onClick={handleViewIntegrations} 
            variant="outline"
            className="flex-1"
            size="lg"
          >
            Manage Integrations
          </Button>
        </div>

        {/* Auto-redirect Notice */}
        <div className="text-center">
          <p className="text-sm text-gray-500">
            You'll be automatically redirected to your dashboard in a few seconds.
          </p>
        </div>
      </div>
    </div>
  );
} 