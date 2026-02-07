'use client';

import { services } from '@/lib/data';
import { SelectableCard } from './SelectableCard';
import { Button } from '@/components/ui/button';
import type { BookingData } from './BookingFlow';
import type { icons } from 'lucide-react';

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
            iconName={service.icon as keyof typeof icons}
            title={service.name}
            isSelected={service.id !== 'autre' && bookingData.services.includes(service.id)}
            onSelect={() => handleSelectService(service.id)}
          />
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
