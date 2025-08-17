'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Lock, Mail, BarChart3, ArrowRight, CheckCircle, Shield } from 'lucide-react';
import { api } from '@/lib/api';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setFieldErrors({});

    try {
      const response = await api.post('/auth/login', formData);
      const data = response.data;

      if (data.success) {
        // Store token and user data
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Show success message briefly before redirect
        setTimeout(() => {
          router.push('/');
        }, 500);
      } else {
        setError(data.message || 'Login failed');
        if (data.errors) {
          setFieldErrors(data.errors);
        }
      }
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.response?.data?.errors) {
        setFieldErrors(err.response.data.errors);
        setError(err.response.data.message || 'Invalid credentials');
      } else {
        setError('Network error. Please check your connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear field-specific errors when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: [] }));
    }
    if (error) setError('');
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-violet-50/30 to-purple-50/40">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-200/20 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
            <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-purple-200/20 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-pink-200/20 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
          </div>
        </div>
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.03)_1px,transparent_1px)] bg-[size:72px_72px]"></div>

      <div className="relative z-10 min-h-screen flex">
        {/* Left Side - Brand Section */}
        <div className="hidden lg:flex lg:flex-1 flex-col justify-center px-12 xl:px-24">
          <div className="max-w-md">
            {/* Logo */}
            {/* <div className="flex items-center space-x-3 mb-8">
             
              <div>
                <h1 className="text-2xl font-bold text-gray-900">MRR Dashboard</h1>
                <p className="text-sm text-gray-500">Revenue Analytics Platform</p>
              </div>
            </div> */}

            {/* Features */}
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-900 leading-tight">
                Manage your recurring revenue with confidence
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Track MRR, analyze customer data, and integrate with your favorite platforms — all in one beautiful dashboard.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-violet-600" />
                  <span className="text-gray-700">Real-time revenue tracking</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-violet-600" />
                  <span className="text-gray-700">Multi-platform integrations</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-violet-600" />
                  <span className="text-gray-700">Advanced analytics & insights</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-violet-600" />
                  <span className="text-gray-700">Enterprise-grade security</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex-1 flex items-center justify-center px-6 py-12 lg:px-8">
          <div className="w-full max-w-md">
            <Card className="card backdrop-blur-xl bg-white/80 border-white/20 shadow-2xl shadow-violet-500/10">
              <CardHeader className="space-y-2 pb-6">
                <div className="lg:hidden flex items-center justify-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-purple-700 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-bold text-gray-900">MRR Dashboard</span>
                </div>
                <CardTitle className="text-2xl font-bold text-center text-gray-900">
                  Welcome back
                </CardTitle>
                <CardDescription className="text-center text-gray-600">
                  Sign in to your account to continue
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {error && (
                  <Alert className="border-red-200 bg-red-50/50 backdrop-blur-sm">
                    <AlertDescription className="text-red-700 text-sm">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                      Email address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        className="pl-10 h-11 bg-white/60 backdrop-blur-sm border-gray-200 focus:border-violet-400 focus:ring-violet-400/20"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled={loading}
                      />
                    </div>
                    {fieldErrors.email && (
                      <p className="text-sm text-red-600">{fieldErrors.email[0]}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        className="pl-10 pr-10 h-11 bg-white/60 backdrop-blur-sm border-gray-200 focus:border-violet-400 focus:ring-violet-400/20"
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleInputChange}
                        disabled={loading}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {fieldErrors.password && (
                      <p className="text-sm text-red-600">{fieldErrors.password[0]}</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        id="remember-me"
                        name="remember-me"
                        type="checkbox"
                        className="h-4 w-4 text-violet-600 focus:ring-violet-500 border-gray-300 rounded"
                      />
                      <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                        Remember me
                      </label>
                    </div>

                    <div className="text-sm">
                      <Link 
                        href="/forgot-password" 
                        className="font-medium text-violet-600 hover:text-violet-500 transition-colors"
                      >
                        Forgot password?
                      </Link>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-11 button-primary bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-medium shadow-lg transition-all duration-300 group"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Signing in...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        Sign in
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    )}
                  </Button>
                </form>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white/80 text-gray-500">New to MRR Dashboard?</span>
                  </div>
                </div>

                <div className="text-center">
                  <Link 
                    href="/register" 
                    className="inline-flex items-center justify-center w-full h-11 px-4 py-2 border border-violet-200 text-violet-600 bg-violet-50/50 hover:bg-violet-100/50 rounded-lg font-medium transition-all duration-200 group"
                  >
                    Create your account
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Demo Credentials */}
            {/* <div className="mt-6 p-4 bg-violet-50/50 backdrop-blur-sm border border-violet-200 rounded-lg">
              <h4 className="text-sm font-medium text-violet-800 mb-2">Demo Credentials</h4>
              <div className="text-xs space-y-1 text-violet-700">
                <div><strong>Email:</strong> magnus@billerstroem.com</div>
                <div><strong>Password:</strong> password</div>
              </div>
            </div> */}

            {/* Trust Indicators */}
            {/* <div className="mt-8 text-center space-y-2">
              <p className="text-xs text-gray-500">
                Protected by enterprise-grade security
              </p>
              <div className="flex items-center justify-center space-x-4 text-xs text-gray-400">
                <span>• SSL Encrypted</span>
                <span>• SOC 2 Compliant</span>
                <span>• GDPR Ready</span>
              </div>
            </div> */}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
} 