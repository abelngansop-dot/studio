'use client';

import { useState } from 'react';
import type { Date } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { cities, durations } from '@/lib/data';
import { cn } from '@/lib/utils';
import {
  AlertCircle,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Sparkles,
  PartyPopper,
  Briefcase,
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { BookingData } from '@/app/booking/page';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const timeSlots = Array.from({ length: 29 }, (_, i) => {
  const hour = Math.floor(i / 2) + 8;
  const minute = (i % 2) * 30;
  return `${hour.toString().padStart(2, '0')}:${minute
    .toString()
    .padStart(2, '0')}`;
});

type DetailsStepProps = {
  bookingData: BookingData;
  updateBookingData: (data: Partial<BookingData>) => void;
  onConfirm: () => void;
  onBack: () => void;
};

export function DetailsStep({
  bookingData,
  updateBookingData,
  onConfirm,
  onBack,
}: DetailsStepProps) {
  const [errors, setErrors] = useState<{
    date?: string;
    time?: string;
    contact?: string;
  }>({});
  const [timeInput, setTimeInput] = useState(bookingData.time);
  const [timeInputError, setTimeInputError] = useState<string | undefined>();

  const handleTimeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    setTimeInput(newTime);
    // Basic validation HH:MM for immediate feedback
    if (newTime && !/^(?:2[0-3]|[01]?[0-9]):[0-5][0-9]$/.test(newTime)) {
      setTimeInputError('Format invalide (HH:MM)');
    } else {
      setTimeInputError(undefined);
      updateBookingData({ time: newTime });
    }
  };

  const handleTimeSlotSelect = (time: string) => {
    setTimeInput(time);
    updateBookingData({ time });
    setTimeInputError(undefined);
     if (errors.time) {
      setErrors(prev => ({...prev, time: undefined}));
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    updateBookingData({ date });
    if (errors.date) {
      setErrors(prev => ({...prev, date: undefined}));
    }
  }

  const handleConfirm = () => {
    const newErrors: { date?: string; time?: string; contact?: string } = {};
    if (!bookingData.date) {
      newErrors.date = 'Veuillez sélectionner une date.';
    }
    if (!bookingData.time) {
      newErrors.time = 'Veuillez choisir une heure.';
    }
    if (bookingData.email && !/^\S+@\S+\.\S+$/.test(bookingData.email)) {
      newErrors.contact = 'Veuillez entrer un email valide.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    onConfirm();
  };

  const selectedDateDisplay = bookingData.date
    ? format(bookingData.date, 'EEEE d MMMM yyyy', { locale: fr })
    : 'Aucune date';

  const getEventIcon = () => {
    switch (bookingData.eventType) {
      case 'mariage':
        return <PartyPopper className="h-6 w-6 text-primary" />;
      case 'entreprise':
        return <Briefcase className="h-6 w-6 text-primary" />;
      default:
        return <Sparkles className="h-6 w-6 text-primary" />;
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold font-headline tracking-tight">
          Finalisez votre demande
        </h2>
        <p className="mt-2 text-muted-foreground">
          Ces informations nous aideront à préparer votre devis personnalisé.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-8">
          {/* Date & Time */}
          <Card className="overflow-hidden shadow-lg border-primary/20">
            <CardHeader className="flex-row items-center gap-4 space-y-0 bg-primary/5">
              <div className="p-3 bg-primary/10 rounded-lg">
                <CalendarIcon className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-2xl font-headline">Quand ?</CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <div className="flex flex-col items-center">
                <Calendar
                  mode="single"
                  selected={bookingData.date}
                  onSelect={handleDateSelect}
                  locale={fr}
                  disabled={(date) =>
                    date < new Date(new Date().setHours(0, 0, 0, 0))
                  }
                  className="rounded-md border"
                />
                {errors.date && (
                  <p className="mt-2 text-sm text-destructive self-start">
                    {errors.date}
                  </p>
                )}
              </div>

              <div className="space-y-4">
                <Label
                  htmlFor="time"
                  className="text-lg font-medium flex items-center gap-2"
                >
                  <Clock className="h-5 w-5" /> Heure de début
                </Label>
                <Input
                  id="time"
                  type="time"
                  value={timeInput}
                  onChange={handleTimeInputChange}
                />
                {(timeInputError || errors.time) && (
                  <p className="text-sm text-destructive">{timeInputError || errors.time}</p>
                )}

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">ou</span>
                  </div>
                </div>

                <ScrollArea className="h-48 border rounded-md">
                  <div className="grid grid-cols-3 gap-2 p-2">
                    {timeSlots.map((time) => (
                      <Button
                        key={time}
                        variant={bookingData.time === time ? 'default' : 'outline'}
                        className="w-full"
                        onClick={() => handleTimeSlotSelect(time)}
                      >
                        {time}
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </CardContent>
          </Card>

          {/* Location & Duration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="shadow-md">
              <CardHeader className="flex-row items-center gap-4 space-y-0">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl font-headline">Où ?</CardTitle>
              </CardHeader>
              <CardContent>
                <Select
                  onValueChange={(value) => updateBookingData({ city: value })}
                  defaultValue={bookingData.city}
                >
                  <SelectTrigger id="city">
                    <SelectValue placeholder="Choisir une ville" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
            <Card className="shadow-md">
              <CardHeader className="flex-row items-center gap-4 space-y-0">
                <div className="p-3 bg-primary/10 rounded-lg">
                  {getEventIcon()}
                </div>
                <CardTitle className="text-xl font-headline">Durée ?</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {durations.map((duration) => (
                  <Button
                    key={duration}
                    variant={
                      bookingData.duration === duration ? 'default' : 'outline'
                    }
                    onClick={() => updateBookingData({ duration: duration })}
                  >
                    {duration}
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Contact and Summary */}
        <div className="space-y-8">
          <Card className="shadow-md sticky top-24">
            <CardHeader>
              <CardTitle className="font-headline text-xl">
                Récapitulatif
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between items-start">
                <span className="text-muted-foreground">Événement</span>
                <span className="font-medium capitalize text-right">
                  {bookingData.eventType}
                </span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-muted-foreground">Services</span>
                <span className="font-medium text-right">
                  {bookingData.services.join(', ')}
                </span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium capitalize text-right">
                  {selectedDateDisplay}
                </span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-muted-foreground">Heure</span>
                <span className="font-medium">{bookingData.time || '...'}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="font-headline text-xl">
                Contact (Optionnel)
              </CardTitle>
              <p className="text-sm text-muted-foreground pt-1">
                Pour un rappel rapide et un devis personnalisé.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="vous@exemple.com"
                  value={bookingData.email}
                  onChange={(e) => updateBookingData({ email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+237 6 XX XX XX XX"
                  value={bookingData.phone}
                  onChange={(e) => updateBookingData({ phone: e.target.value })}
                />
              </div>
              {errors.contact && (
                <p className="text-sm text-center text-destructive">
                  {errors.contact}
                </p>
              )}
            </CardContent>
          </Card>
          {(errors.date || errors.time) && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Champs manquants</AlertTitle>
              <AlertDescription>
                Veuillez vérifier que la date et l'heure sont bien renseignées.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>

      <div className="mt-12 flex justify-between">
        <Button variant="outline" size="lg" onClick={onBack}>
          Précédent
        </Button>
        <Button
          onClick={handleConfirm}
          size="lg"
          className="bg-accent text-accent-foreground hover:bg-accent/90"
        >
          Confirmer ma réservation
        </Button>
      </div>
    </div>
  );
}
