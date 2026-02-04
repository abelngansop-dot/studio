'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * This page acts as a permanent redirect from the old `/login` path to the new `/admin` login page.
 */
export default function LoginRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin');
  }, [router]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="text-center">
        <p className="text-lg text-muted-foreground">
          Redirection vers la page de connexion...
        </p>
      </div>
    </div>
  );
}
