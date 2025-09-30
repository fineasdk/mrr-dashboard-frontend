'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Mail, Calendar, Shield, Settings, Eye, EyeOff, Check, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';

interface UserProfile {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  
  const [profileData, setProfileData] = useState({
    name: '',
    email: ''
  });
  
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: ''
  });
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const router = useRouter();

  const loadUserProfile = useCallback(async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await api.get('/auth/me');
      if (response.data.success) {
        const userData = response.data.user;
        setUser(userData);
        setProfileData({
          name: userData.name || '',
          email: userData.email || ''
        });
      }
    } catch (err: any) {
      console.error('Failed to load profile:', err);
      if (err.response?.status === 401) {
        router.push('/login');
      } else {
        setError('Failed to load profile information');
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadUserProfile();
  }, [loadUserProfile]);

  const updateProfile = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    setFieldErrors({});

    try {
      const response = await api.put('/auth/profile', profileData);

      if (response.data.success) {
        setSuccess('Profile updated successfully!');
        const updatedUser = { ...user, ...profileData };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser as UserProfile);
      }
    } catch (err: any) {
      if (err.response?.data?.errors) {
        setFieldErrors(err.response.data.errors);
      }
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const updatePassword = async () => {
    if (passwordData.new_password !== passwordData.new_password_confirmation) {
      setError('New passwords do not match');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');
    setFieldErrors({});

    try {
      const response = await api.put('/auth/password', passwordData);

      if (response.data.success) {
        setSuccess('Password updated successfully!');
        setPasswordData({
          current_password: '',
          new_password: '',
          new_password_confirmation: ''
        });
      }
    } catch (err: any) {
      if (err.response?.data?.errors) {
        setFieldErrors(err.response.data.errors);
      }
      setError(err.response?.data?.message || 'Failed to update password');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 sm:h-32 sm:w-32 border-b-2 border-violet-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-sm sm:text-base">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-3 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Mobile-optimized Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Profile Settings</h1>
          <p className="text-gray-600 text-sm sm:text-base">Manage your account settings and preferences</p>
        </div>

        {/* Alert Messages - Mobile optimized */}
        {error && (
          <Alert className="mb-4 sm:mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700 text-sm">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-4 sm:mb-6 border-green-200 bg-green-50">
            <Check className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700 text-sm">{success}</AlertDescription>
          </Alert>
        )}

        {/* Responsive Tabs */}
        <Tabs defaultValue="general" className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-white shadow-sm h-auto p-1">
            <TabsTrigger value="general" className="flex items-center justify-center space-x-2 py-3 px-4 text-sm sm:text-base">
              <User className="h-4 w-4" />
              <span className="hidden xs:inline">General</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center justify-center space-x-2 py-3 px-4 text-sm sm:text-base">
              <Shield className="h-4 w-4" />
              <span className="hidden xs:inline">Security</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Card className="card">
              <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
                <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
                  <User className="h-5 w-5 text-violet-600" />
                  <span>Profile Information</span>
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Update your personal information and account details
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-6">
                {/* Profile Avatar Section - Mobile optimized */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-4 p-4 bg-violet-50 rounded-lg">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-violet-600 to-purple-700 rounded-full flex items-center justify-center text-white font-bold text-xl sm:text-2xl">
                    {profileData.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-center sm:text-left">
                    <h3 className="font-semibold text-gray-900 text-lg sm:text-xl">{profileData.name}</h3>
                    <p className="text-gray-600 text-sm sm:text-base break-all sm:break-normal">{profileData.email}</p>
                    <div className="flex items-center justify-center sm:justify-start mt-2 text-sm text-gray-500">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>Joined {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Form Fields - Mobile-first grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter your full name"
                      className="w-full"
                    />
                    {fieldErrors.name && (
                      <p className="text-sm text-red-600">{fieldErrors.name[0]}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Enter your email"
                      className="w-full"
                    />
                    {fieldErrors.email && (
                      <p className="text-sm text-red-600">{fieldErrors.email[0]}</p>
                    )}
                  </div>
                </div>

                {/* Save Button - Mobile optimized */}
                <div className="flex justify-stretch sm:justify-end pt-4">
                  <Button 
                    onClick={updateProfile} 
                    disabled={saving}
                    className="w-full sm:w-auto button-primary bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 py-3 sm:py-2"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card className="card">
              <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
                <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
                  <Shield className="h-5 w-5 text-violet-600" />
                  <span>Change Password</span>
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Update your password to keep your account secure
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-4 sm:space-y-6">
                {/* Password Fields - Mobile optimized */}
                <div className="space-y-2">
                  <Label htmlFor="current_password" className="text-sm font-medium">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="current_password"
                      type={showPasswords.current ? 'text' : 'password'}
                      value={passwordData.current_password}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, current_password: e.target.value }))}
                      placeholder="Enter current password"
                      className="w-full pr-12"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                    >
                      {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {fieldErrors.current_password && (
                    <p className="text-sm text-red-600">{fieldErrors.current_password[0]}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new_password" className="text-sm font-medium">New Password</Label>
                  <div className="relative">
                    <Input
                      id="new_password"
                      type={showPasswords.new ? 'text' : 'password'}
                      value={passwordData.new_password}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, new_password: e.target.value }))}
                      placeholder="Enter new password"
                      className="w-full pr-12"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                    >
                      {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {fieldErrors.new_password && (
                    <p className="text-sm text-red-600">{fieldErrors.new_password[0]}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm_password" className="text-sm font-medium">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirm_password"
                      type={showPasswords.confirm ? 'text' : 'password'}
                      value={passwordData.new_password_confirmation}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, new_password_confirmation: e.target.value }))}
                      placeholder="Confirm new password"
                      className="w-full pr-12"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                    >
                      {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {fieldErrors.new_password_confirmation && (
                    <p className="text-sm text-red-600">{fieldErrors.new_password_confirmation[0]}</p>
                  )}
                </div>

                {/* Update Button - Mobile optimized */}
                <div className="flex justify-stretch sm:justify-end pt-4">
                  <Button 
                    onClick={updatePassword} 
                    disabled={saving || !passwordData.current_password || !passwordData.new_password}
                    className="w-full sm:w-auto button-primary bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 py-3 sm:py-2"
                  >
                    {saving ? 'Updating...' : 'Update Password'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 