'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Lock, Mail, User, BarChart3, ArrowRight, CheckCircle, Shield, Check } from 'lucide-react';
import { api } from '@/lib/api';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [passwordStrength, setPasswordStrength] = useState(0);
  const router = useRouter();

  const checkPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setFieldErrors({});

    try {
      const response = await api.post('/auth/register', formData);
      const data = response.data;

      if (data.success) {
        // Store token and user data
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Show success message
        setError(''); // Clear any previous errors
        setSuccess(true);
        
        // Redirect to dashboard after brief success display
        setTimeout(() => {
          router.push('/');
        }, 1500);
      } else {
        setError(data.message || 'Registration failed');
        if (data.errors) {
          setFieldErrors(data.errors);
        }
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      if (err.response?.data?.errors) {
        setFieldErrors(err.response.data.errors);
        setError(err.response.data.message || 'Registration failed');
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
    
    // Check password strength
    if (name === 'password') {
      setPasswordStrength(checkPasswordStrength(value));
    }
    
    // Clear field-specific errors when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: [] }));
    }
    if (error) setError('');
  };

  const getPasswordStrengthColor = (strength: number) => {
    if (strength <= 1) return 'bg-red-500';
    if (strength <= 2) return 'bg-orange-500';
    if (strength <= 3) return 'bg-yellow-500';
    if (strength <= 4) return 'bg-green-500';
    return 'bg-emerald-500';
  };

  const getPasswordStrengthText = (strength: number) => {
    if (strength <= 1) return 'Weak';
    if (strength <= 2) return 'Fair';
    if (strength <= 3) return 'Good';
    if (strength <= 4) return 'Strong';
    return 'Very Strong';
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
              <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-purple-700 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/25">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">MRR Dashboard</h1>
                <p className="text-sm text-gray-500">Revenue Analytics Platform</p>
              </div>
            </div> */}

            {/* Features */}
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-900 leading-tight">
                Start tracking your recurring revenue today
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Join thousands of businesses using MRR Dashboard to understand their revenue, track growth, and make data-driven decisions.
              </p>
              
              <div className="space-y-4">
                {/* <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-violet-600" />
                  <span className="text-gray-700">Free 14-day trial</span>
                </div> */}
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-violet-600" />
                  <span className="text-gray-700">No credit card required</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-violet-600" />
                  <span className="text-gray-700">Setup in under 5 minutes</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-violet-600" />
                  <span className="text-gray-700">Bank-level security</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Register Form */}
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
                  Create your account
                </CardTitle>
                <CardDescription className="text-center text-gray-600">
                  Get started with your free trial today
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

                {success && (
                  <Alert className="border-green-200 bg-green-50/50 backdrop-blur-sm">
                    <AlertDescription className="text-green-700 text-sm flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Account created successfully! Redirecting to dashboard...
                    </AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                      Full name
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        required
                        className="pl-10 h-11 bg-white/60 backdrop-blur-sm border-gray-200 focus:border-violet-400 focus:ring-violet-400/20"
                        placeholder="Enter your full name"
                        value={formData.name}
                        onChange={handleInputChange}
                        disabled={loading || success}
                      />
                    </div>
                    {fieldErrors.name && (
                      <p className="text-sm text-red-600">{fieldErrors.name[0]}</p>
                    )}
                  </div>

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
                        disabled={loading || success}
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
                        placeholder="Create a strong password"
                        value={formData.password}
                        onChange={handleInputChange}
                        disabled={loading || success}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    
                    {/* Password Strength Indicator */}
                    {formData.password && (
                      <div className="space-y-2">
                        <div className="flex space-x-1">
                          {[1, 2, 3, 4, 5].map((level) => (
                            <div
                              key={level}
                              className={`h-2 w-full rounded ${
                                level <= passwordStrength 
                                  ? getPasswordStrengthColor(passwordStrength)
                                  : 'bg-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                        <p className={`text-xs font-medium ${
                          passwordStrength <= 2 ? 'text-red-600' : 
                          passwordStrength <= 3 ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          Password strength: {getPasswordStrengthText(passwordStrength)}
                        </p>
                      </div>
                    )}
                    
                    {fieldErrors.password && (
                      <p className="text-sm text-red-600">{fieldErrors.password[0]}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password_confirmation" className="text-sm font-medium text-gray-700">
                      Confirm password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="password_confirmation"
                        name="password_confirmation"
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        className="pl-10 pr-10 h-11 bg-white/60 backdrop-blur-sm border-gray-200 focus:border-violet-400 focus:ring-violet-400/20"
                        placeholder="Confirm your password"
                        value={formData.password_confirmation}
                        onChange={handleInputChange}
                        disabled={loading || success}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    
                    {/* Password Match Indicator */}
                    {formData.password_confirmation && (
                      <div className={`flex items-center space-x-2 text-xs ${
                        formData.password === formData.password_confirmation && formData.password_confirmation
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        {formData.password === formData.password_confirmation && formData.password_confirmation ? (
                          <>
                            <Check className="h-3 w-3" />
                            <span>Passwords match</span>
                          </>
                        ) : (
                          <span>Passwords do not match</span>
                        )}
                      </div>
                    )}
                    
                    {fieldErrors.password_confirmation && (
                      <p className="text-sm text-red-600">{fieldErrors.password_confirmation[0]}</p>
                    )}
                  </div>

                  <div className="flex items-start space-x-3">
                    <input
                      id="terms"
                      name="terms"
                      type="checkbox"
                      required
                      className="h-4 w-4 text-violet-600 focus:ring-violet-500 border-gray-300 rounded mt-0.5"
                    />
                    <label htmlFor="terms" className="text-sm text-gray-700 leading-relaxed">
                      I agree to the{' '}
                      <Link href="/terms" className="text-violet-600 hover:text-violet-500 font-medium">
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link href="/privacy" className="text-violet-600 hover:text-violet-500 font-medium">
                        Privacy Policy
                      </Link>
                    </label>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-11 button-primary bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-medium shadow-lg transition-all duration-300 group"
                    disabled={loading || success}
                  >
                    {success ? (
                      <div className="flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Account created! Redirecting...
                      </div>
                    ) : loading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating account...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        Create account
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
                    <span className="px-4 bg-white/80 text-gray-500">Already have an account?</span>
                  </div>
                </div>

                <div className="text-center">
                  <Link 
                    href="/login" 
                    className="inline-flex items-center justify-center w-full h-11 px-4 py-2 border border-violet-200 text-violet-600 bg-violet-50/50 hover:bg-violet-100/50 rounded-lg font-medium transition-all duration-200 group"
                  >
                    Sign in to your account
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Trust Indicators */}
            {/* <div className="mt-8 text-center space-y-2">
              <p className="text-xs text-gray-500">
                Your data is protected with enterprise-grade security
              </p>
              <div className="flex items-center justify-center space-x-4 text-xs text-gray-400">
                <span>• 256-bit SSL</span>
                <span>• SOC 2 Type II</span>
                <span>• GDPR Compliant</span>
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