'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * This page acts as a redirect from the `/admin` path to the `/dashboard` page.
 * It's a user-friendly way to ensure that users who manually type `/admin`
 * are taken to the correct place.
 */
export default function AdminRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="text-center">
        <p className="text-lg text-muted-foreground">
          Redirection vers le tableau de bord...
        </p>
      </div>
    </div>
  );
}
