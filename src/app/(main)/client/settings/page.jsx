'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserLayout } from '@/components/layout/UserLayout';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import { 
  Settings, Bell, Shield, Moon, 
  Trash2, LogOut, Save 
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    notifications: true,
    emailUpdates: true,
    darkMode: false,
  });

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    loadSettings();
  }, [user, router]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      // Load settings from localStorage or API
      const savedSettings = localStorage.getItem(`settings_${user?.id}`);
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      // Save to localStorage (you can extend this to save to API)
      localStorage.setItem(`settings_${user?.id}`, JSON.stringify(settings));
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }
    toast.info('Account deletion feature coming soon');
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  if (loading) {
    return (
      <UserLayout>
        <div className="px-4 py-6 flex items-center justify-center min-h-[60vh]">
          <div className="text-muted-foreground">Loading settings...</div>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="px-4 py-6 space-y-6 pb-24">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Settings className="w-8 h-8" />
          Settings
        </h1>

        {/* Notifications */}
        <div className="bg-card rounded-lg border border-border p-4 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notifications
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Push Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications about your nutrition goals
                </p>
              </div>
              <Switch
                checked={settings.notifications}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, notifications: checked }))
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Updates</Label>
                <p className="text-sm text-muted-foreground">
                  Receive weekly nutrition summaries via email
                </p>
              </div>
              <Switch
                checked={settings.emailUpdates}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, emailUpdates: checked }))
                }
              />
            </div>
          </div>
        </div>

        {/* Appearance */}
        <div className="bg-card rounded-lg border border-border p-4 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Moon className="w-5 h-5" />
            Appearance
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Dark Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Switch between light and dark theme
                </p>
              </div>
              <Switch
                checked={settings.darkMode}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, darkMode: checked }))
                }
              />
            </div>
          </div>
        </div>

        {/* Privacy & Security */}
        <div className="bg-card rounded-lg border border-border p-4 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Privacy & Security
          </h2>
          <div className="space-y-3">
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Your data is encrypted and stored securely. We never share your personal information.
              </AlertDescription>
            </Alert>
            <Button variant="outline" className="w-full" onClick={() => toast.info('Privacy policy coming soon')}>
              View Privacy Policy
            </Button>
            <Button variant="outline" className="w-full" onClick={() => toast.info('Terms coming soon')}>
              View Terms of Service
            </Button>
          </div>
        </div>

        {/* Save Button */}
        <Button
          onClick={handleSaveSettings}
          disabled={saving}
          className="w-full bg-primary hover:bg-primary/90"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>

        <Separator />

        {/* Account Actions */}
        <div className="bg-card rounded-lg border border-border p-4 space-y-4">
          <h2 className="text-lg font-semibold">Account</h2>
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full text-destructive hover:text-destructive"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
            <Button
              variant="outline"
              className="w-full text-destructive hover:text-destructive"
              onClick={handleDeleteAccount}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Account
            </Button>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
