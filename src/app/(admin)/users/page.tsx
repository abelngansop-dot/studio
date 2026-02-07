'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * This page is a temporary redirect to the correct admin path.
 */
export default function RedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/users');
  }, [router]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="text-center">
        <p className="text-lg text-muted-foreground">Redirection en cours...</p>
      </div>
    </div>
  );
}
