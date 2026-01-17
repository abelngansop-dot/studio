'use client';

import { useState } from 'react';
import type { Date } from 'date-fns';

import { ProgressBar } from '@/components/booking/ProgressBar';
import { EventTypeStep } from '@/components/booking/EventTypeStep';
import { ServiceStep } from '@/components/booking/ServiceStep';
import { DetailsStep } from '@/components/booking/DetailsStep';
import { ConfirmationStep } from '@/components/booking/ConfirmationStep';

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

export default function BookingPage() {
  const [step, setStep] = useState(1);
  const [bookingData, setBookingData] =
    useState<BookingData>(initialBookingData);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const updateBookingData = (data: Partial<BookingData>) => {
    setBookingData((prev) => ({ ...prev, ...data }));
  };

  const nextStep = () => {
    if (step < TOTAL_STEPS) {
      setStep((s) => s + 1);
    } else {
      // Final submission logic would go here
      setIsConfirmed(true);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep((s) => s - 1);
    }
  };

  const handleBackFromConfirmation = () => {
    setIsConfirmed(false);
  };

  if (isConfirmed) {
    return (
      <ConfirmationStep
        bookingData={bookingData}
        updateBookingData={updateBookingData}
        onBack={handleBackFromConfirmation}
      />
    );
  }

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4 sm:px-6 lg:px-8">
      <ProgressBar currentStep={step} totalSteps={TOTAL_STEPS} />
      <div className="mt-8">
        {step === 1 && (
          <EventTypeStep
            onSelect={(eventType) => {
              updateBookingData({ eventType });
              nextStep();
            }}
          />
        )}
        {step === 2 && (
          <ServiceStep
            bookingData={bookingData}
            updateBookingData={updateBookingData}
            onNext={nextStep}
            onBack={prevStep}
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
  );
}
