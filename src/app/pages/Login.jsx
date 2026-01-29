'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        if (!fullName.trim()) {
          toast.error('Please enter your name');
          setLoading(false);
          return;
        }
        const result = await signUp(email, password, fullName);
        if (result?.error) {
          toast.error(result.error.message || 'Failed to create account');
          setLoading(false);
          return;
        }
        if (result?.warning) {
          toast.warning(result.warning);
          setIsSignUp(false); // Switch to sign in mode
          setLoading(false);
          return;
        }
        toast.success('Account created! Redirecting...');
        router.push('/client/onboarding');
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          toast.error(error.message || 'Invalid email or password');
          setLoading(false);
          return;
        }
        toast.success('Welcome back!');
        
        // Check onboarding status
        try {
          const profileResponse = await fetch('/api/client/profile');
          if (profileResponse.ok) {
            const { profile } = await profileResponse.json();
            if (!profile || !profile.onboarding_completed) {
              router.push('/client/onboarding');
              return;
            }
          }
        } catch (err) {
          console.error('Error checking onboarding status:', err);
        }
        
        router.push('/client/dashboard');
      }
    } catch (err) {
      toast.error(err.message || 'An error occurred');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <h1 className="text-3xl font-bold text-foreground mb-2">NutritionCents</h1>
        
        <img 
          src="/assets/logo.png" 
          alt="NutritionCents Logo" 
          className="w-24 h-24 object-contain mb-4"
        />
        
        <h2 className="text-xl font-semibold mb-1">
          {isSignUp ? 'Create an account' : 'Sign In'}
        </h2>
        <p className="text-muted-foreground text-sm mb-6">
          {isSignUp ? 'Welcome to Beta Testing Program' : 'Welcome to Beta Testing Program'}
        </p>

        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
          {isSignUp && (
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Name (John Doe)"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="bg-background"
              />
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="email@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-background"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Password ********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="bg-background"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-primary hover:bg-primary/90"
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Continue'}
          </Button>
        </form>

        <p className="text-xs text-muted-foreground mt-4 text-center">
          By clicking continue, you agree to our{' '}
          <span className="text-foreground underline cursor-pointer">Terms of Service</span>
          {' '}and{' '}
          <span className="text-foreground underline cursor-pointer">Privacy Policy</span>
        </p>

        <button
          onClick={() => setIsSignUp(!isSignUp)}
          className="mt-4 text-sm text-primary hover:underline"
        >
          {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
        </button>
      </div>

      <div className="h-48 overflow-hidden">
        <img 
          src="/assets/food-banner.jpg" 
          alt="Healthy food" 
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
}
