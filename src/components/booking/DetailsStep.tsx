'use client';

import { useState } from 'react';
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cities, durations } from '@/lib/data';
import { cn } from '@/lib/utils';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { BookingData } from '@/app/booking/page';

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
  const [errors, setErrors] = useState<{ date?: string; contact?: string }>({});

  const handleConfirm = () => {
    if (!bookingData.date) {
      setErrors({ date: 'Veuillez sélectionner une date pour votre événement.' });
      return;
    }
    if (bookingData.email && !/^\S+@\S+\.\S+$/.test(bookingData.email)) {
       setErrors({ contact: "Veuillez entrer un email valide." });
       return;
    }
    setErrors({});
    onConfirm();
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold font-headline tracking-tight">
          Dites-nous en plus sur votre événement
        </h2>
        <p className="mt-2 text-muted-foreground">
          Ces informations nous aideront à préparer votre devis.
        </p>
      </div>

      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="city">Ville</Label>
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
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Date de l'événement</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={'outline'}
                  id="date"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !bookingData.date && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {bookingData.date ? (
                    format(bookingData.date, 'PPP', { locale: fr })
                  ) : (
                    <span>Choisir une date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={bookingData.date}
                  onSelect={(date) => updateBookingData({ date: date as Date })}
                  initialFocus
                  locale={fr}
                  disabled={(date) => date < new Date()}
                />
              </PopoverContent>
            </Popover>
             {errors.date && <p className="text-sm text-destructive">{errors.date}</p>}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="time">Heure de début</Label>
            <Input
              id="time"
              type="time"
              value={bookingData.time}
              onChange={(e) => updateBookingData({ time: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="duration">Durée de la prestation</Label>
            <Select
              onValueChange={(value) => updateBookingData({ duration: value })}
              defaultValue={bookingData.duration}
            >
              <SelectTrigger id="duration">
                <SelectValue placeholder="Choisir une durée" />
              </SelectTrigger>
              <SelectContent>
                {durations.map((duration) => (
                  <SelectItem key={duration} value={duration}>
                    {duration}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t">
           <p className="text-center text-sm text-muted-foreground">Optionnel : laissez-nous vos contacts pour un rappel rapide.</p>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
           </div>
            {errors.contact && <p className="text-sm text-center text-destructive">{errors.contact}</p>}
        </div>
      </div>

      <div className="mt-12 flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Précédent
        </Button>
        <Button onClick={handleConfirm} className="bg-primary hover:bg-primary/90">
          Confirmer ma réservation
        </Button>
      </div>
    </div>
  );
}
