'use client';

import { useState, useMemo, useCallback } from 'react';
import { services } from '@/lib/data';
import { SelectableCard } from './SelectableCard';
import { Button } from '@/components/ui/button';
import { AITip } from '@/components/AITip';
import type { BookingData } from '@/app/booking/page';
import type { icons } from 'lucide-react';

type ServiceStepProps = {
  bookingData: BookingData;
  updateBookingData: (data: Partial<BookingData>) => void;
  onNext: () => void;
  onBack: () => void;
};

export function ServiceStep({
  bookingData,
  updateBookingData,
  onNext,
  onBack,
}: ServiceStepProps) {
  const [error, setError] = useState('');
  const [pastMessages, setPastMessages] = useState<string[]>([]);

  const handleSelectService = (serviceId: string) => {
    setError('');
    const newServices = bookingData.services.includes(serviceId)
      ? bookingData.services.filter((s) => s !== serviceId)
      : [...bookingData.services, serviceId];
    updateBookingData({ services: newServices });
  };

  const handleNext = () => {
    if (bookingData.services.length === 0) {
      setError('Veuillez choisir au moins un service pour continuer.');
      return;
    }
    onNext();
  };
  
  const addPastMessage = useCallback((message: string) => {
    setPastMessages(prev => [...prev, message]);
  }, []);

  const firstSelectedService = useMemo(() => {
    const firstServiceId = bookingData.services[0];
    if (!firstServiceId) return '';
    return services.find(s => s.id === firstServiceId)?.name || '';
  }, [bookingData.services]);

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
            isSelected={bookingData.services.includes(service.id)}
            onSelect={() => handleSelectService(service.id)}
          />
        ))}
      </div>

      {firstSelectedService && (
         <AITip 
          userType="nouveau client"
          serviceRequested={firstSelectedService}
          pastMessages={pastMessages}
          onNewMessage={addPastMessage}
        />
      )}

      {error && (
        <p className="mt-4 text-center text-destructive font-medium">{error}</p>
      )}

      <div className="mt-8 flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Précédent
        </Button>
        <Button onClick={handleNext}>Suivant</Button>
      </div>
    </div>
  );
}
