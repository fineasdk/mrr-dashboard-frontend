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
      <div className="page-container-mesh">
        <div className="layout-container section-padding">
          <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
            <div className="relative">
              <div className="w-10 h-10 rounded-full border-2 border-gray-200 border-t-gray-600 animate-spin" />
            </div>
            <p className="mt-6 text-gray-600 font-medium">Loading your profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container-mesh">
      <div className="layout-container section-padding space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Profile Settings</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Alert Messages */}
        {error && (
          <Alert className="bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="bg-green-50 border-green-200">
            <Check className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">{success}</AlertDescription>
          </Alert>
        )}

        {/* Tabs */}
        <div>
          <Tabs defaultValue="general" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 bg-gray-100 h-auto p-1 rounded-lg">
              <TabsTrigger value="general" className="flex items-center justify-center space-x-2 py-2.5 px-4 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <User className="h-4 w-4" />
                <span className="font-medium">General</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center justify-center space-x-2 py-2.5 px-4 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Shield className="h-4 w-4" />
                <span className="font-medium">Security</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="general">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="p-5 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gray-100">
                      <User className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-gray-900">Profile Information</h3>
                      <p className="text-xs text-gray-500">Update your personal information</p>
                    </div>
                  </div>
                </div>

                <div className="p-5 space-y-5">
                  {/* Profile Avatar Section */}
                  <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-5 p-5 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="w-16 h-16 bg-gray-900 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                      {profileData.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-center sm:text-left">
                      <h3 className="font-semibold text-gray-900 text-lg">{profileData.name}</h3>
                      <p className="text-gray-500 text-sm">{profileData.email}</p>
                      <div className="flex items-center justify-center sm:justify-start mt-2 text-xs text-gray-400">
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
