'use client';

import * as LucideIcons from 'lucide-react';
import { type LucideProps } from 'lucide-react';

interface IconProps extends Omit<LucideProps, 'ref'> {
  name: keyof typeof LucideIcons;
}

/**
 * A robust wrapper for Lucide icons that handles dynamic name lookups.
 * Using wildcard import ensures all exported icons are accessible.
 */
const Icon = ({ name, ...props }: IconProps) => {
  const SelectedIcon = LucideIcons[name] as React.ComponentType<LucideProps>;

  if (!SelectedIcon) {
    // Fallback to a default icon if the requested one is missing
    const FallbackIcon = LucideIcons.HelpCircle || LucideIcons.Package;
    return <FallbackIcon {...props} />;
  }

  return <SelectedIcon {...props} />;
};

export default Icon;
