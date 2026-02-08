'use client';

import { useState, useEffect } from 'react';
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
import { allCountries, allCities, cameroonCities } from '@/lib/locations';
import { durations } from '@/lib/data';
import { cn } from '@/lib/utils';
import {
  AlertCircle,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Sparkles,
  PartyPopper,
  Briefcase,
  CheckCircle,
  MessageSquare,
} from 'lucide-react';
import { format, parse, isValid, isPast, startOfToday } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { BookingData } from './BookingFlow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';

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
    country?: string;
    city?: string;
    email?: string;
    phone?: string;
    requestDetails?: string;
  }>({});
  const [timeInput, setTimeInput] = useState(bookingData.time);
  const [timeInputError, setTimeInputError] = useState<string | undefined>();
  const [dateInput, setDateInput] = useState<string>(
    bookingData.date ? format(bookingData.date, 'dd/MM/yyyy') : ''
  );
  const [dateError, setDateError] = useState<string | undefined>();
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [showCustomCityInput, setShowCustomCityInput] = useState(false);

  const shouldShowOtherDetails =
    bookingData.eventType === 'autre' ||
    bookingData.services.includes('autre');

  useEffect(() => {
    if (bookingData.country) {
      const country = allCountries.find(c => c.name === bookingData.country);
      if (country) {
        if (country.code === 'CM') {
          setAvailableCities(cameroonCities.map(c => c.name));
        } else {
          const capital = allCities.find(c => c.countryCode === country.code);
          setAvailableCities(capital ? [capital.name] : []);
        }
      }
    } else {
      setAvailableCities([]);
    }
  }, [bookingData.country]);

  useEffect(() => {
    const cityIsPredefined =
      availableCities.length > 0 && availableCities.includes(bookingData.city);
    if (bookingData.city && !cityIsPredefined) {
      setShowCustomCityInput(true);
    }
  }, [availableCities, bookingData.city]);

  const handleCountrySelect = (countryName: string) => {
    updateBookingData({ country: countryName, city: '' });
    setShowCustomCityInput(false);
    if (errors.country) setErrors(prev => ({ ...prev, country: undefined }));
    if (errors.city) setErrors(prev => ({ ...prev, city: undefined }));
  };

  const handleCitySelect = (value: string) => {
    if (value === 'Autre') {
      setShowCustomCityInput(true);
      updateBookingData({ city: '' });
    } else {
      setShowCustomCityInput(false);
      updateBookingData({ city: value });
      if (errors.city) {
        setErrors(prev => ({ ...prev, city: undefined }));
      }
    }
  };

  const handleTimeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    setTimeInput(newTime);
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
      setErrors(prev => ({ ...prev, time: undefined }));
    }
  };

  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const lowercasedValue = rawValue.trim().toLowerCase();

    if ("aujourd'hui".startsWith(lowercasedValue)) {
      setDateInput(rawValue);
      if (lowercasedValue === "aujourd'hui") {
        const today = startOfToday();
        updateBookingData({ date: today });
        setDateError(undefined);
        if (errors.date) setErrors(prev => ({ ...prev, date: undefined }));
      } else {
        updateBookingData({ date: undefined });
        setDateError(undefined);
      }
      return;
    }

    const digits = rawValue.replace(/\D/g, '');
    let formattedValue = digits;
    if (digits.length > 2) {
      formattedValue = `${digits.slice(0, 2)}/${digits.slice(2)}`;
    }
    if (digits.length > 4) {
      formattedValue = `${digits.slice(0, 2)}/${digits.slice(
        2,
        4
      )}/${digits.slice(4, 8)}`;
    }

    setDateInput(formattedValue);

    if (formattedValue.length === 10) {
      const parsedDate = parse(formattedValue, 'dd/MM/yyyy', new Date(), {
        locale: fr,
      });
      if (isValid(parsedDate)) {
        if (
          isPast(parsedDate) &&
          format(parsedDate, 'yyyy-MM-dd') !== format(startOfToday(), 'yyyy-MM-dd')
        ) {
          setDateError('La date ne peut pas être dans le passé.');
          updateBookingData({ date: undefined });
        } else {
          setDateError(undefined);
          updateBookingData({ date: parsedDate });
          if (errors.date) setErrors(prev => ({ ...prev, date: undefined }));
        }
      } else {
        setDateError('Date invalide.');
        updateBookingData({ date: undefined });
      }
    } else {
      updateBookingData({ date: undefined });
      setDateError(undefined);
    }
  };

  const handleConfirm = () => {
    const newErrors: typeof errors = {};
    if (!bookingData.date) newErrors.date = 'Veuillez sélectionner une date.';
    if (!bookingData.time) newErrors.time = 'Veuillez choisir une heure.';
    if (!bookingData.country)
      newErrors.country = 'Veuillez sélectionner un pays.';
    if (!bookingData.city.trim()) newErrors.city = 'Veuillez préciser la ville.';
    if (!bookingData.phone)
      newErrors.phone = 'Le numéro de téléphone est obligatoire.';
    else if (!/^\+?[0-9\s-()]{8,}$/.test(bookingData.phone))
      newErrors.phone = 'Veuillez entrer un numéro de téléphone valide.';
    if (!bookingData.email) newErrors.email = "L'adresse e-mail est obligatoire.";
    else if (!/^\S+@\S+\.\S+$/.test(bookingData.email))
      newErrors.email = 'Veuillez entrer un email valide.';

    if (shouldShowOtherDetails && !bookingData.requestDetails?.trim()) {
      newErrors.requestDetails =
        "Veuillez préciser la nature de votre demande 'Autre'.";
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

      {shouldShowOtherDetails && (
        <Alert className="mb-8 border-accent text-accent-foreground bg-accent/5 animate-in fade-in duration-300">
          <MessageSquare className="h-4 w-4" />
          <AlertTitle className="font-bold">Demande spécifique</AlertTitle>
          <AlertDescription>
            Vous avez sélectionné "Autre". Veuillez décrire votre besoin dans la
            section dédiée plus bas.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-8">
          <Card className="overflow-hidden shadow-lg border-primary/20">
            <CardHeader className="flex-row items-center gap-4 space-y-0 bg-primary/5">
              <div className="p-3 bg-primary/10 rounded-lg">
                <CalendarIcon className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-2xl font-headline">Quand ?</CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <div className="space-y-4">
                <Label
                  htmlFor="date"
                  className="text-lg font-medium flex items-center gap-2"
                >
                  <CalendarIcon className="h-5 w-5" /> Date de l'événement
                </Label>
                <div className="relative">
                  <Input
                    id="date"
                    type="text"
                    placeholder="dd/mm/yyyy ou aujourd'hui"
                    value={dateInput}
                    onChange={handleDateInputChange}
                    className={cn(
                      'pr-8',
                      dateError &&
                        'border-destructive focus-visible:ring-destructive',
                      bookingData.date &&
                        !dateError &&
                        'border-green-500 focus-visible:ring-green-500'
                    )}
                  />
                  {bookingData.date && !dateError && (
                    <CheckCircle className="absolute right-2 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />
                  )}
                </div>
                {(dateError || errors.date) && (
                  <p className="text-sm text-destructive">
                    {dateError || errors.date}
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
                  <p className="text-sm text-destructive">
                    {timeInputError || errors.time}
                  </p>
                )}

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                      ou
                    </span>
                  </div>
                </div>

                <ScrollArea className="h-48 border rounded-md">
                  <div className="grid grid-cols-3 gap-2 p-2">
                    {timeSlots.map(time => (
                      <Button
                        key={time}
                        variant={
                          bookingData.time === time ? 'default' : 'outline'
                        }
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

          {shouldShowOtherDetails && (
            <Card className="shadow-md animate-in fade-in duration-300">
              <CardHeader className="flex-row items-center gap-4 space-y-0">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl font-headline">
                  Précisez votre demande
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Label
                  htmlFor="request-details"
                  className={cn(
                    'font-medium mb-2 block',
                    errors.requestDetails && 'text-destructive'
                  )}
                >
                  Description de la demande 'Autre'
                </Label>
                <Textarea
                  id="request-details"
                  placeholder="Décrivez votre besoin spécifique (événement, service, etc.)..."
                  value={bookingData.requestDetails || ''}
                  onChange={e =>
                    updateBookingData({ requestDetails: e.target.value })
                  }
                  className={cn(
                    'min-h-[100px]',
                    errors.requestDetails &&
                      'border-destructive focus-visible:ring-destructive'
                  )}
                />
                {errors.requestDetails && (
                  <p className="text-sm text-destructive flex items-center gap-1 pt-2">
                    <AlertCircle className="h-4 w-4" />
                    {errors.requestDetails}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="shadow-md">
              <CardHeader className="flex-row items-center gap-4 space-y-0">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl font-headline">Où ?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label
                    htmlFor="country"
                    className={cn(errors.country && 'text-destructive')}
                  >
                    Pays <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    onValueChange={handleCountrySelect}
                    value={bookingData.country}
                  >
                    <SelectTrigger
                      id="country"
                      className={cn(errors.country && 'border-destructive')}
                    >
                      <SelectValue placeholder="Choisir un pays" />
                    </SelectTrigger>
                    <SelectContent>
                      {allCountries.map(c => (
                        <SelectItem key={c.code} value={c.name}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.country && (
                    <p className="text-sm text-destructive mt-2">
                      {errors.country}
                    </p>
                  )}
                </div>
                {bookingData.country && (
                  <div className="animate-in fade-in duration-300">
                    <Label
                      htmlFor="city"
                      className={cn(errors.city && 'text-destructive')}
                    >
                      Ville <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      onValueChange={handleCitySelect}
                      value={showCustomCityInput ? 'Autre' : bookingData.city || ''}
                    >
                      <SelectTrigger
                        id="city"
                        className={cn(errors.city && 'border-destructive')}
                      >
                        <SelectValue placeholder="Choisir une ville" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableCities.map(city => (
                          <SelectItem key={city} value={city}>
                            {city}
                          </SelectItem>
                        ))}
                        <SelectItem value="Autre">Autre (préciser)</SelectItem>
                      </SelectContent>
                    </Select>
                    {showCustomCityInput && (
                      <Input
                        id="custom-city"
                        placeholder="Précisez votre ville"
                        value={bookingData.city}
                        onChange={e =>
                          updateBookingData({ city: e.target.value })
                        }
                        className="mt-2 animate-in fade-in duration-300"
                      />
                    )}
                    {errors.city && (
                      <p className="text-sm text-destructive mt-2">
                        {errors.city}
                      </p>
                    )}
                  </div>
                )}
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
                {durations.map(duration => (
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
              <div className="flex justify-between items-start">
                <span className="text-muted-foreground">Lieu</span>
                <span className="font-medium capitalize text-right">
                  {bookingData.city ? `${bookingData.city}, ` : ''}
                  {bookingData.country || 'Non précisé'}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="font-headline text-xl">
                Vos Coordonnées
              </CardTitle>
              <p className="text-sm text-muted-foreground pt-1">
                Ces champs sont obligatoires pour continuer.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="phone"
                  className={cn(errors.phone && 'text-destructive')}
                >
                  Téléphone <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+237 6 XX XX XX XX"
                  value={bookingData.phone}
                  onChange={e => updateBookingData({ phone: e.target.value })}
                  className={cn(
                    errors.phone &&
                      'border-destructive focus-visible:ring-destructive'
                  )}
                />
                {errors.phone && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.phone}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className={cn(errors.email && 'text-destructive')}
                >
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="vous@exemple.com"
                  value={bookingData.email}
                  onChange={e => updateBookingData({ email: e.target.value })}
                  className={cn(
                    errors.email &&
                      'border-destructive focus-visible:ring-destructive'
                  )}
                />
                {errors.email && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.email}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
          {(errors.date ||
            errors.time ||
            errors.country ||
            errors.city ||
            errors.phone ||
            errors.email ||
            errors.requestDetails) && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Champs manquants ou invalides</AlertTitle>
              <AlertDescription>
                Veuillez vérifier que tous les champs obligatoires sont bien
                renseignés.
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
