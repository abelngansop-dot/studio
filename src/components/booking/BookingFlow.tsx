'use client';

import { useState } from 'react';
import type { Date } from 'date-fns';

import { ProgressBar } from '@/components/booking/ProgressBar';
import { EventTypeStep } from '@/components/booking/EventTypeStep';
import { ServiceStep } from '@/components/booking/ServiceStep';
import { DetailsStep } from '@/components/booking/DetailsStep';
import { ConfirmationStep } from '@/components/booking/ConfirmationStep';
import { OtherRequestStep } from '@/components/booking/OtherRequestStep';
import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useBookingProgress } from '@/hooks/use-booking-progress';


export type BookingData = {
  eventType: string;
  services: string[];
  city: string;
  date: Date | undefined;
  time: string;
  duration: string;
  email: string;
  phone: string;
};

const initialBookingData: BookingData = {
  eventType: '',
  services: [],
  city: '',
  date: undefined,
  time: '',
  duration: '',
  email: '',
  phone: '',
};

const TOTAL_STEPS = 3;

type BookingFlowProps = {
    initialServiceId?: string;
    closeModal: () => void;
}

export function BookingFlow({ initialServiceId, closeModal }: BookingFlowProps) {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const { bookingData, updateBookingData, clearBookingProgress } = useBookingProgress({
    ...initialBookingData,
    services: initialServiceId ? [initialServiceId] : []
  });
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isOtherFlow, setIsOtherFlow] = useState(false);

  const nextStep = () => {
    if (step < TOTAL_STEPS) {
      setStep((s) => s + 1);
    } else {
      setIsConfirmed(true);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep((s) => s - 1);
    }
  };

  const handleEventTypeSelect = (eventType: string) => {
    updateBookingData({ eventType });
    if (eventType === 'autre') {
      setIsOtherFlow(true);
    } else {
      setIsOtherFlow(false);
      nextStep();
    }
  };

  const handleBackFromConfirmation = () => {
    setIsConfirmed(false);
  };
  
  const handleBookingComplete = () => {
    clearBookingProgress();
    closeModal();
    toast({
      title: "Votre demande a été envoyée !",
      description: "Notre équipe vous contactera très bientôt.",
    })
  }

  const handleBackFromOtherFlow = () => {
      setIsOtherFlow(false);
      // If we entered this flow from step 1 (Event Type selection), reset event type
      if (bookingData.eventType === 'autre') {
          updateBookingData({ eventType: '' });
      }
  };


  if (isOtherFlow) {
    return <OtherRequestStep onBack={handleBackFromOtherFlow} closeModal={closeModal} />;
  }

  if (isConfirmed) {
    return (
      <ConfirmationStep
        bookingData={bookingData}
        updateBookingData={updateBookingData}
        onBack={handleBackFromConfirmation}
        onBookingComplete={handleBookingComplete}
      />
    );
  }

  return (
    <>
      <DialogHeader className="p-6 pb-0">
        <DialogTitle className="text-center text-3xl font-bold font-headline tracking-tight">Votre réservation</DialogTitle>
        <DialogDescription className="text-center">
            Suivez les étapes pour compléter votre demande.
        </DialogDescription>
      </DialogHeader>
      <div className="container mx-auto max-w-4xl py-8 px-4 sm:px-6 lg:px-8">
        <ProgressBar currentStep={step} totalSteps={TOTAL_STEPS} />
        <div className="mt-8">
          {step === 1 && (
            <EventTypeStep
              onSelect={handleEventTypeSelect}
            />
          )}
          {step === 2 && (
            <ServiceStep
              bookingData={bookingData}
              updateBookingData={updateBookingData}
              onNext={nextStep}
              onBack={prevStep}
              onSelectOther={() => setIsOtherFlow(true)}
            />
          )}
          {step === 3 && (
            <DetailsStep
              bookingData={bookingData}
              updateBookingData={updateBookingData}
              onConfirm={nextStep}
              onBack={prevStep}
            />
          )}
        </div>
      </div>
    </>
  );
}
