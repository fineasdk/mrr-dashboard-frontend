// Script to set valid auth token in browser localStorage
// Run this in the browser console at your frontend URL

console.log('🔧 Setting up auth token for testing...')

// Set the valid token
const validToken = '6|SRdPj4j8jLXfaPYsRA9V8zKLu927NC38n9E7BBqk3c9b8c1a'
localStorage.setItem('auth_token', validToken)

// Set test user data
const testUser = {
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
}
localStorage.setItem('user', JSON.stringify(testUser))

console.log('✅ Auth token set:', validToken)
console.log('✅ User data set:', testUser)
console.log('🔄 Please refresh the page to see the dashboard with data')

// Verify the token works by testing the API
fetch('https://mrr-dashboard-api-production.up.railway.app/api/dashboard/metrics', {
  headers: {
    Accept: 'application/json',
    Authorization: `Bearer ${validToken}`,
  },
})
  .then((response) => response.json())
  .then((data) => {
    console.log('🧪 API Test successful:')
    console.log('💰 Total MRR:', data.data.metrics.total_mrr.formatted)
    console.log('👥 Total Customers:', data.data.metrics.total_customers.value)
  })
  .catch((error) => {
    console.error('❌ API Test failed:', error)
  })
