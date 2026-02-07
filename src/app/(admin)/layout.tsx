'use client';

/**
 * This layout is part of a legacy file structure.
 * It is intentionally left simple to avoid routing conflicts.
 * The pages within this old route group now handle their own redirects.
 */
export default function RedirectLegacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
