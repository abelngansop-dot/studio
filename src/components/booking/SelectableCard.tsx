'use client';

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import Icon from '@/components/Icon';
import { CheckCircle2 } from 'lucide-react';
import type { icons } from 'lucide-react';

type SelectableCardProps = {
  iconName: keyof typeof icons;
  title: string;
  isSelected: boolean;
  onSelect: () => void;
};

export function SelectableCard({
  iconName,
  title,
  isSelected,
  onSelect,
}: SelectableCardProps) {
  return (
    <Card
      className={cn(
        'cursor-pointer transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-xl',
        isSelected
          ? 'border-primary ring-2 ring-primary ring-offset-2 bg-primary/5'
          : 'hover:border-primary/50',
        'bg-background/80'
      )}
      onClick={onSelect}
      role="button"
      aria-pressed={isSelected}
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect()}
    >
      <CardContent className="relative flex flex-col items-center justify-center p-6 gap-3 text-center">
        {isSelected && (
          <CheckCircle2 className="absolute top-2 right-2 h-6 w-6 text-primary animate-in fade-in zoom-in" />
        )}
        <div className="p-4 bg-accent/10 rounded-full">
            <Icon name={iconName} className="h-10 w-10 text-accent" />
        </div>
        <span className="font-semibold text-lg text-foreground">{title}</span>
      </CardContent>
    </Card>
  );
}
