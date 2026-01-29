'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function AddMealRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  useEffect(() => {
    // Redirect to the client version with query params preserved
    const type = searchParams.get('type') || 'breakfast';
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
    
    const params = new URLSearchParams();
    if (type) params.set('type', type);
    if (date) params.set('date', date);
    
    router.replace(`/client/meals/add?${params.toString()}`);
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-muted-foreground">Redirecting...</div>
    </div>
  );
}

export default function AddMealPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    }>
      <AddMealRedirect />
    </Suspense>
  );
}
