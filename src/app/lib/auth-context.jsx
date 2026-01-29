'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useSession, signIn as nextAuthSignIn, signOut as nextAuthSignOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const { data: session, status } = useSession();
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      setUser({
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
      });
    } else if (status === 'unauthenticated') {
      setUser(null);
    }
  }, [session, status]);

  const signIn = async (email, password) => {
    try {
      const result = await nextAuthSignIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        return { error: { message: result.error } };
      }

      return { error: null };
    } catch (error) {
      return { error: { message: error.message || 'Failed to sign in' } };
    }
  };

  const signUp = async (email, password, fullName) => {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, fullName }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: { message: data.error || 'Failed to create account' } };
      }

      // Small delay to ensure database transaction is committed
      await new Promise(resolve => setTimeout(resolve, 100));

      // After successful signup, automatically sign in
      const signInResult = await signIn(email, password);
      
      if (signInResult?.error) {
        // If auto sign-in fails, return success but with a note
        // User can manually sign in
        console.warn('Auto sign-in after signup failed:', signInResult.error);
        return { 
          error: null, 
          warning: 'Account created successfully. Please sign in manually.' 
        };
      }
      
      return signInResult;
    } catch (error) {
      console.error('Signup error:', error);
      return { error: { message: error.message || 'Failed to create account' } };
    }
  };

  const signOut = async () => {
    try {
      await nextAuthSignOut({ redirect: false });
      setUser(null);
      router.push('/login');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const value = {
    user,
    signIn,
    signUp,
    signOut,
    loading: status === 'loading',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
