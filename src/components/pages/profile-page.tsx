'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Mail, Calendar, Shield, Eye, EyeOff, Check, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';

interface UserProfile {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

export function ProfilePage() {
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

  const loadUserProfile = useCallback(async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
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
      setError('Failed to load profile information');
    } finally {
      setLoading(false);
    }
  }, []);

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
      <div className="min-h-screen bg-gray-50">
        <div className="layout-container section-padding">
          <div className="flex items-center justify-center py-12 animate-fade-in">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center animate-pulse">
                <User className="w-8 h-8 text-white" />
              </div>
              <p className="mt-4 text-slate-600">Loading your profile...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="layout-container section-padding space-y-6 sm:space-y-8">
        {/* Enhanced Header */}
        <div className="animate-fade-in">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
              Profile Settings
            </h1>
            <p className="text-gray-600 text-sm sm:text-base lg:text-lg">
              Manage your account settings and preferences
            </p>
          </div>
        </div>

        {/* Alert Messages */}
        {error && (
          <Alert className="border-red-200 bg-red-50 animate-slide-down">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-200 bg-green-50 animate-slide-down">
            <Check className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">{success}</AlertDescription>
          </Alert>
        )}

        {/* Enhanced Tabs */}
        <div className="animate-slide-up">
          <Tabs defaultValue="general" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 bg-white shadow-sm h-auto p-1 rounded-xl">
              <TabsTrigger value="general" className="flex items-center justify-center space-x-2 py-3 px-4 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-50 data-[state=active]:to-purple-50 data-[state=active]:text-indigo-700">
                <User className="h-4 w-4" />
                <span>General</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center justify-center space-x-2 py-3 px-4 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-50 data-[state=active]:to-purple-50 data-[state=active]:text-indigo-700">
                <Shield className="h-4 w-4" />
                <span>Security</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="general">
              <div className="card-elevated animate-scale-in">
                <div className="p-6 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-600 rounded-md flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">Profile Information</h3>
                      <p className="text-sm text-slate-600">Update your personal information and account details</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 space-y-6">
                  {/* Profile Avatar Section */}
                  <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-600 rounded-full flex items-center justify-center text-white font-bold text-xl sm:text-2xl shadow-sm">
                      {profileData.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-center sm:text-left">
                      <h3 className="font-semibold text-slate-900 text-lg sm:text-xl">{profileData.name}</h3>
                      <p className="text-slate-600 text-sm sm:text-base break-all sm:break-normal">{profileData.email}</p>
                      <div className="flex items-center justify-center sm:justify-start mt-2 text-sm text-slate-500">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>Joined {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium text-slate-700">Full Name</Label>
                      <Input
                        id="name"
                        value={profileData.name}
                        onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter your full name"
                        className="rounded-lg"
                      />
                      {fieldErrors.name && (
                        <p className="text-sm text-red-600">{fieldErrors.name[0]}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium text-slate-700">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="Enter your email"
                        className="rounded-lg"
                      />
                      {fieldErrors.email && (
                        <p className="text-sm text-red-600">{fieldErrors.email[0]}</p>
                      )}
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="flex justify-end pt-4">
                    <Button 
                      onClick={updateProfile} 
                      disabled={saving}
                      className="btn-primary px-6 py-3"
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="security">
              <div className="card-elevated animate-scale-in">
                <div className="p-6 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-600 rounded-md flex items-center justify-center">
                      <Shield className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">Change Password</h3>
                      <p className="text-sm text-slate-600">Update your password to keep your account secure</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 space-y-6">
                  {/* Password Fields */}
                  <div className="space-y-2">
                    <Label htmlFor="current_password" className="text-sm font-medium text-slate-700">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="current_password"
                        type={showPasswords.current ? 'text' : 'password'}
                        value={passwordData.current_password}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, current_password: e.target.value }))}
                        placeholder="Enter current password"
                        className="rounded-lg pr-12"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
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
                    <Label htmlFor="new_password" className="text-sm font-medium text-slate-700">New Password</Label>
                    <div className="relative">
                      <Input
                        id="new_password"
                        type={showPasswords.new ? 'text' : 'password'}
                        value={passwordData.new_password}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, new_password: e.target.value }))}
                        placeholder="Enter new password"
                        className="rounded-lg pr-12"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
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
                    <Label htmlFor="confirm_password" className="text-sm font-medium text-slate-700">Confirm New Password</Label>
                    <div className="relative">
                      <Input
                        id="confirm_password"
                        type={showPasswords.confirm ? 'text' : 'password'}
                        value={passwordData.new_password_confirmation}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, new_password_confirmation: e.target.value }))}
                        placeholder="Confirm new password"
                        className="rounded-lg pr-12"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                      >
                        {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {fieldErrors.new_password_confirmation && (
                      <p className="text-sm text-red-600">{fieldErrors.new_password_confirmation[0]}</p>
                    )}
                  </div>

                  {/* Update Button */}
                  <div className="flex justify-end pt-4">
                    <Button 
                      onClick={updatePassword} 
                      disabled={saving || !passwordData.current_password || !passwordData.new_password}
                      className="btn-primary px-6 py-3"
                    >
                      {saving ? 'Updating...' : 'Update Password'}
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
