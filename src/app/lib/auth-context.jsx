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
        // In NextAuth v5, error messages from authorize function should be in result.error
        let errorMessage = result.error;
        
        // If it's the generic CredentialsSignin error, we need to check the actual error
        // NextAuth v5 should pass through the error message from authorize function
        // But if it doesn't, we'll need to handle it differently
        
        // Check if there's error details in the result
        if (result.error === 'CredentialsSignin' || result.error === 'CredentialsSigninError') {
          // Try to get more specific error from the error description or URL
          if (result.url) {
            try {
              const url = new URL(result.url);
              const errorParam = url.searchParams.get('error');
              const errorDescription = url.searchParams.get('error_description');
              
              if (errorDescription) {
                errorMessage = decodeURIComponent(errorDescription);
              } else if (errorParam && errorParam !== 'CredentialsSignin') {
                errorMessage = decodeURIComponent(errorParam);
              } else {
                // Fallback: we can't determine the exact error, so show generic message
                // But we'll check the email in a separate call to provide better feedback
                errorMessage = 'Invalid email or password';
              }
            } catch (e) {
              // Ignore URL parsing errors
              errorMessage = 'Invalid email or password';
            }
          } else {
            errorMessage = 'Invalid email or password';
          }
        }
        
        return { error: { message: errorMessage } };
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
