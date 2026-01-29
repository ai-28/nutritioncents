'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { UserLayout } from '@/components/layout/UserLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import { Camera, Save, User, Mail, Calendar, Scale, Ruler, Activity } from 'lucide-react';

const genderOptions = ['Men', 'Women', 'Other'];
const activityLevels = [
  { value: 'sedentary', label: 'Sedentary' },
  { value: 'light', label: 'Light' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'active', label: 'Active' },
  { value: 'very_active', label: 'Very Active' },
];

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(null);
  const [userData, setUserData] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    age: '',
    gender: 'Men',
    weight: '',
    height: '',
    activityLevel: 'moderate',
    avatarUrl: '',
  });

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    loadProfile();
  }, [user, router]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      
      // Load user data
      const userRes = await fetch('/api/auth/session');
      if (userRes.ok) {
        const session = await userRes.json();
        if (session?.user) {
          setUserData(session.user);
          setFormData(prev => ({
            ...prev,
            name: session.user.name || '',
            email: session.user.email || '',
          }));
        }
      }

      // Load profile data
      const profileRes = await fetch('/api/client/profile');
      if (profileRes.ok) {
        const { profile: profileData } = await profileRes.json();
        if (profileData) {
          setProfile(profileData);
          
          // Calculate age from date of birth
          let age = '';
          if (profileData.date_of_birth) {
            const birthDate = new Date(profileData.date_of_birth);
            const today = new Date();
            age = Math.floor((today - birthDate) / (365.25 * 24 * 60 * 60 * 1000)).toString();
          }
          
          setFormData(prev => ({
            ...prev,
            age: age,
            gender: profileData.gender || 'Men',
            weight: profileData.weight_kg ? profileData.weight_kg.toString() : '',
            height: profileData.height_cm ? profileData.height_cm.toString() : '',
            activityLevel: profileData.activity_level || 'moderate',
            avatarUrl: profileData.avatar_url || '',
          }));
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // For now, just store the file as data URL - you can implement upload later
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, avatarUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    }
    if (e.target) {
      e.target.value = '';
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    try {
      const response = await fetch('/api/client/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          age: parseInt(formData.age) || undefined,
          gender: formData.gender,
          weight: parseFloat(formData.weight) || undefined,
          heightCm: parseFloat(formData.height) || undefined,
          activityLevel: formData.activityLevel,
          avatarUrl: formData.avatarUrl,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save profile');
      }

      toast.success('Profile updated successfully!');
      loadProfile(); // Reload to get updated data
    } catch (err) {
      toast.error(err.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <UserLayout>
        <div className="px-4 py-6 flex items-center justify-center min-h-[60vh]">
          <div className="text-muted-foreground">Loading profile...</div>
        </div>
      </UserLayout>
    );
  }

  const initials = userData?.name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || 'U';

  return (
    <UserLayout>
      <div className="px-4 py-6 space-y-6 pb-24">
        <h1 className="text-3xl font-bold">Profile</h1>

        {/* Avatar Section */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <Avatar className="h-24 w-24">
              <AvatarImage src={formData.avatarUrl || ''} />
              <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                {initials}
              </AvatarFallback>
            </Avatar>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={saving}
              className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors"
            >
              <Camera className="h-4 w-4" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              accept="image/*"
              className="hidden"
            />
          </div>
        </div>

        {/* User Information */}
        <div className="space-y-4">
          <div className="bg-card rounded-lg border border-border p-4 space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <User className="w-5 h-5" />
              Account Information
            </h2>
            
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="name"
                    value={formData.name}
                    disabled
                    className="bg-muted"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    disabled
                    className="bg-muted"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Profile Information */}
          <div className="bg-card rounded-lg border border-border p-4 space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <User className="w-5 h-5" />
              Profile Information
            </h2>
            
            <div className="space-y-4">
              {/* Age */}
              <div className="space-y-2">
                <Label htmlFor="age" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Age
                </Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="Enter your age"
                  value={formData.age}
                  onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                  className="bg-background"
                />
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <Label>Gender</Label>
                <div className="flex gap-2">
                  {genderOptions.map((gender) => (
                    <Button
                      key={gender}
                      type="button"
                      variant={formData.gender === gender ? "default" : "outline"}
                      onClick={() => setFormData(prev => ({ ...prev, gender }))}
                      className="flex-1"
                    >
                      {gender}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Weight */}
              <div className="space-y-2">
                <Label htmlFor="weight" className="flex items-center gap-2">
                  <Scale className="w-4 h-4" />
                  Weight (kg)
                </Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  placeholder="Enter your weight"
                  value={formData.weight}
                  onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                  className="bg-background"
                />
              </div>

              {/* Height */}
              <div className="space-y-2">
                <Label htmlFor="height" className="flex items-center gap-2">
                  <Ruler className="w-4 h-4" />
                  Height (cm)
                </Label>
                <Input
                  id="height"
                  type="number"
                  step="0.1"
                  placeholder="Enter your height"
                  value={formData.height}
                  onChange={(e) => setFormData(prev => ({ ...prev, height: e.target.value }))}
                  className="bg-background"
                />
              </div>

              {/* Activity Level */}
              <div className="space-y-2">
                <Label htmlFor="activityLevel" className="flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Activity Level
                </Label>
                <select
                  id="activityLevel"
                  value={formData.activityLevel}
                  onChange={(e) => setFormData(prev => ({ ...prev, activityLevel: e.target.value }))}
                  className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {activityLevels.map((level) => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <Button
            onClick={handleSave}
            className="w-full bg-primary hover:bg-primary/90"
            disabled={saving}
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </UserLayout>
  );
}
