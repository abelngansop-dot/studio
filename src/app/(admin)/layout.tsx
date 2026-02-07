'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * This layout serves as a redirect handler to fix a routing conflict.
 * It catches any requests to unprefixed admin pages (e.g., /dashboard)
 * and redirects them to the correct, prefixed URL (e.g., /admin/dashboard).
 */
export default function RedirectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Construct the new path with the /admin prefix
    const targetPath = `/admin${pathname}`;
    // Use replace to avoid adding the old URL to the browser history
    router.replace(targetPath);
  }, [pathname, router]);

  // Render a loading state while redirecting
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="text-center">
        <p className="text-lg text-muted-foreground">Redirection en cours...</p>
      </div>
    </div>
  );
}
