'use client';

import { eventTypes } from '@/lib/data';
import { SelectableCard } from './SelectableCard';
import type { icons } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/Icon';

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
            isSelected={false} // This component navigates on select, so it's never "selected" in this view
            onSelect={() => onSelect(type.id)}
          >
            <Card className="h-full group-hover:-translate-y-1 transition-transform duration-300">
                 <CardContent className="flex flex-col items-center justify-center p-6 gap-3 text-center h-full">
                    <div className="p-4 bg-accent/10 rounded-full">
                        <Icon name={type.icon as keyof typeof icons} className="h-10 w-10 text-accent" />
                    </div>
                    <span className="font-semibold text-lg text-foreground">{type.name}</span>
                </CardContent>
            </Card>
          </SelectableCard>
        ))}
      </div>
    </div>
  );
}
