/**
 * Frontend Configuration Validation
 *
 * This file validates required environment variables and provides typed access to configuration.
 */

interface Config {
  apiUrl: string
  isDevelopment: boolean
  isProduction: boolean
  appName: string
  companyName: string
  features: {
    debugMode: boolean
    betaFeatures: boolean
  }
  analytics?: {
    googleAnalyticsId?: string
    sentryDsn?: string
  }
}

const requiredEnvVars = {
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
}

const optionalEnvVars = {
  NEXT_PUBLIC_GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
  NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
  NEXT_PUBLIC_ENABLE_DEBUG_MODE: process.env.NEXT_PUBLIC_ENABLE_DEBUG_MODE,
  NEXT_PUBLIC_ENABLE_BETA_FEATURES:
    process.env.NEXT_PUBLIC_ENABLE_BETA_FEATURES,
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  NEXT_PUBLIC_COMPANY_NAME: process.env.NEXT_PUBLIC_COMPANY_NAME,
}

// Validate required environment variables
function validateConfig(): void {
  const missing = Object.entries(requiredEnvVars)
    .filter(([, value]) => !value)
    .map(([key]) => key)

  if (missing.length > 0) {
    const errorMessage = `
❌ Missing required environment variables:
${missing.map((key) => `  - ${key}`).join('\n')}

Please create a .env.local file with the following variables:

# Required
${missing.map((key) => `${key}=your_value_here`).join('\n')}

# Optional (recommended)
NEXT_PUBLIC_GA_MEASUREMENT_ID=your_ga_id
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
NEXT_PUBLIC_ENABLE_DEBUG_MODE=false
NEXT_PUBLIC_ENABLE_BETA_FEATURES=false
NEXT_PUBLIC_APP_NAME="MRR Dashboard"
NEXT_PUBLIC_COMPANY_NAME="Your Company"

Example .env.local:
NEXT_PUBLIC_API_URL=https://your-api-domain.com/api
    `.trim()

    throw new Error(errorMessage)
  }
}

// Validate configuration on import
validateConfig()

// Create typed configuration object
export const config: Config = {
  apiUrl: requiredEnvVars.NEXT_PUBLIC_API_URL!,
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  appName: optionalEnvVars.NEXT_PUBLIC_APP_NAME || 'MRR Dashboard',
  companyName: optionalEnvVars.NEXT_PUBLIC_COMPANY_NAME || 'Your Company',
  features: {
    debugMode: optionalEnvVars.NEXT_PUBLIC_ENABLE_DEBUG_MODE === 'true',
    betaFeatures: optionalEnvVars.NEXT_PUBLIC_ENABLE_BETA_FEATURES === 'true',
  },
  analytics: {
    googleAnalyticsId: optionalEnvVars.NEXT_PUBLIC_GA_MEASUREMENT_ID,
    sentryDsn: optionalEnvVars.NEXT_PUBLIC_SENTRY_DSN,
  },
}

// Helper functions
export const isFeatureEnabled = (
  feature: keyof Config['features']
): boolean => {
  return config.features[feature]
}

export const getApiUrl = (path?: string): string => {
  const baseUrl = config.apiUrl.replace(/\/$/, '') // Remove trailing slash
  return path ? `${baseUrl}/${path.replace(/^\//, '')}` : baseUrl
}

export const logConfig = (): void => {
  if (config.isDevelopment) {
    console.log('🔧 Configuration loaded:', {
      apiUrl: config.apiUrl,
      appName: config.appName,
      features: config.features,
      hasAnalytics: !!(
        config.analytics?.googleAnalyticsId || config.analytics?.sentryDsn
      ),
    })
  }
}

// Log configuration in development
if (typeof window !== 'undefined' && config.isDevelopment) {
  logConfig()
}

export default config


