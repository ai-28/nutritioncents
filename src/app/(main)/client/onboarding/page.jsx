'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import { Check, Camera } from 'lucide-react';

const healthGoals = ['Diary', 'Fitness', 'Weight Loss', 'Muscle Gain'];
const genderOptions = ['Men', 'Women', 'Other'];

export default function OnboardingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const [avatarUrl, setAvatarUrl] = useState('');
  
  const [formData, setFormData] = useState({
    healthGoal: 'Diary',
    age: '',
    gender: 'Men',
    weight: ''
  });

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // For now, just store the file - you can implement upload later
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
    if (e.target) {
      e.target.value = '';
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const response = await fetch('/api/client/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          healthGoal: formData.healthGoal,
          age: parseInt(formData.age) || undefined,
          gender: formData.gender,
          weight: parseFloat(formData.weight) || undefined,
          avatarUrl: avatarUrl,
          onboardingCompleted: true,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save profile');
      }

      toast.success('Profile saved!');
      router.push('/client/dashboard');
    } catch (err) {
      toast.error(err.message || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1 flex flex-col items-center px-6 py-12">
        {/* Avatar Upload */}
        <div className="relative mb-8">
          <Avatar className="h-24 w-24">
            <AvatarImage src={avatarUrl || ''} />
            <AvatarFallback className="bg-primary/10">
              <Check className="w-8 h-8 text-primary" />
            </AvatarFallback>
          </Avatar>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
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

        <div className="w-full max-w-sm space-y-6">
          {/* Health Goal */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base">What's goal in health journey?</Label>
              <Check className="w-5 h-5 text-primary" />
            </div>
            <div className="space-y-2">
              {healthGoals.map((goal) => (
                <div key={goal} className="flex items-center space-x-2">
                  <Checkbox
                    id={goal}
                    checked={formData.healthGoal === goal}
                    onCheckedChange={() => setFormData(prev => ({ ...prev, healthGoal: goal }))}
                  />
                  <Label htmlFor={goal} className="text-sm font-normal cursor-pointer">
                    {goal}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Age */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base">How old are you?</Label>
              <Check className="w-5 h-5 text-primary" />
            </div>
            <Input
              type="number"
              placeholder="48"
              value={formData.age}
              onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
              className="bg-background"
            />
          </div>

          {/* Gender */}
          <div className="space-y-3">
            <Label className="text-base">Are you women or men?</Label>
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
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base">How much do you weigh?</Label>
              <Check className="w-5 h-5 text-primary" />
            </div>
            <Input
              type="number"
              placeholder="62"
              value={formData.weight}
              onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
              className="bg-background"
            />
          </div>

          <Button 
            onClick={handleSave}
            className="w-full bg-primary hover:bg-primary/90"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>
    </div>
  );
}
