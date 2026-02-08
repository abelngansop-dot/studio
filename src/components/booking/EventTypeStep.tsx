'use client';

import { SelectableCard } from './SelectableCard';
import type { icons } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/Icon';
import { useFirestore, useMemoFirebase } from '@/firebase/provider';
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection, query, orderBy } from 'firebase/firestore';
import { Skeleton } from '../ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

type EventType = {
  id: string;
  name: string;
  icon: keyof typeof icons;
}

type EventTypeStepProps = {
  onSelect: (eventType: string) => void;
};

// Default data to ensure the booking flow is always usable, even with an empty database.
// The admin can override this by adding event types in the admin panel.
const defaultEventTypes: EventType[] = [
    { id: 'mariage', name: 'Mariage', icon: 'Heart' },
    { id: 'anniversaire', name: 'Anniversaire', icon: 'Cake' },
    { id: 'bapteme', name: 'Baptême', icon: 'Sparkles' },
    { id: 'entreprise', name: 'Entreprise', icon: 'Briefcase' },
    { id: 'deuil', name: 'Deuil', icon: 'Flower2' },
    { id: 'autre', name: 'Autre', icon: 'PlusCircle' },
];


const EventTypeSkeleton = () => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
    {Array.from({length: 4}).map((_, i) => (
      <Card key={i}>
        <CardContent className="flex flex-col items-center justify-center p-6 gap-3 text-center h-full">
          <Skeleton className="h-12 w-12 rounded-full" />
          <Skeleton className="h-6 w-24" />
        </CardContent>
      </Card>
    ))}
  </div>
);

export function EventTypeStep({ onSelect }: EventTypeStepProps) {
  const firestore = useFirestore();
  const eventTypesQuery = useMemoFirebase(() => firestore && query(collection(firestore, 'eventTypes'), orderBy('name', 'asc')), [firestore]);
  const { data: eventTypes, isLoading, error } = useCollection<EventType>(eventTypesQuery);

  // If firestore has data, use it. Otherwise, use the default list.
  const displayTypes = (!isLoading && eventTypes && eventTypes.length > 0) ? eventTypes : defaultEventTypes;

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
      {isLoading ? (
        <EventTypeSkeleton />
      ) : (
        <>
          {(!eventTypes || eventTypes.length === 0) && !error && (
            <Alert className="mb-6 bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-200">
              <Info className="h-4 w-4 !text-blue-600 dark:!text-blue-300" />
              <AlertTitle className="font-semibold">Information</AlertTitle>
              <AlertDescription>
                Ces catégories sont des exemples. L'administrateur peut les gérer depuis la section "Catalogue" du panneau d'administration.
              </AlertDescription>
            </Alert>
          )}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {displayTypes?.map((type) => (
              <SelectableCard
                key={type.id}
                isSelected={false} // This component navigates on select, so it's never "selected" in this view
                onSelect={() => onSelect(type.name.toLowerCase())}
              >
                <Card className="h-full group-hover:-translate-y-1 transition-transform duration-300">
                    <CardContent className="flex flex-col items-center justify-center p-6 gap-3 text-center h-full">
                        <div className="p-4 bg-accent/10 rounded-full">
                            <Icon name={type.icon as keyof typeof icons} className="h-10 w-10 text-accent" />
                        </div>
                        <span className="font-semibold text-lg text-foreground capitalize">{type.name}</span>
                    </CardContent>
                </Card>
              </SelectableCard>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
