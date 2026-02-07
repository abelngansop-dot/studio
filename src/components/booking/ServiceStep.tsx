'use client';

import { services } from '@/lib/data';
import { SelectableCard } from './SelectableCard';
import { Button } from '@/components/ui/button';
import type { BookingData } from './BookingFlow';
import type { icons } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/Icon';


type ServiceStepProps = {
  bookingData: BookingData;
  updateBookingData: (data: Partial<BookingData>) => void;
  onNext: () => void;
  onBack: () => void;
  onSelectOther: () => void;
};

export function ServiceStep({
  bookingData,
  updateBookingData,
  onNext,
  onBack,
  onSelectOther,
}: ServiceStepProps) {
  const handleSelectService = (serviceId: string) => {
    if (serviceId === 'autre') {
      onSelectOther();
      return;
    }

    const newServices = bookingData.services.includes(serviceId)
      ? bookingData.services.filter((s) => s !== serviceId)
      : [...bookingData.services, serviceId];
    updateBookingData({ services: newServices });
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold font-headline tracking-tight">
          De quels services avez-vous besoin ?
        </h2>
        <p className="mt-2 text-muted-foreground">
          Vous pouvez en sélectionner plusieurs.
        </p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {services.map((service) => (
           <SelectableCard
            key={service.id}
            isSelected={service.id !== 'autre' && bookingData.services.includes(service.id)}
            onSelect={() => handleSelectService(service.id)}
          >
            <Card className="h-full group-hover:-translate-y-1 transition-transform duration-300">
                <CardContent className="flex flex-col items-center justify-center p-6 gap-3 text-center h-full">
                    <div className="p-4 bg-accent/10 rounded-full">
                        <Icon name={service.icon as keyof typeof icons} className="h-10 w-10 text-accent" />
                    </div>
                    <span className="font-semibold text-lg text-foreground">{service.name}</span>
                </CardContent>
            </Card>
          </SelectableCard>
        ))}
      </div>

      <div className="mt-8 flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Précédent
        </Button>
        <Button onClick={onNext} disabled={bookingData.services.length === 0}>Suivant</Button>
      </div>
    </div>
  );
}
