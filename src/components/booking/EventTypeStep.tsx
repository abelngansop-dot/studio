'use client';

import { eventTypes } from '@/lib/data';
import { SelectableCard } from './SelectableCard';
import type { icons } from 'lucide-react';

type EventTypeStepProps = {
  onSelect: (eventType: string) => void;
};

export function EventTypeStep({ onSelect }: EventTypeStepProps) {
  return (
    <div className="animate-in fade-in duration-500">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold font-headline tracking-tight">
          Quel type d'événement organisez-vous ?
        </h2>
        <p className="mt-2 text-muted-foreground">
          Choisissez une catégorie pour commencer.
        </p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {eventTypes.map((type) => (
          <SelectableCard
            key={type.id}
            iconName={type.icon as keyof typeof icons}
            title={type.name}
            isSelected={false} // This component navigates on select, so it's never "selected" in this view
            onSelect={() => onSelect(type.id)}
          />
        ))}
      </div>
    </div>
  );
}
