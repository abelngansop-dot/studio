'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckCircle, Phone, MessageSquare, AlertCircle, ArrowLeft, PartyPopper, Briefcase, Sparkles, ListChecks, Calendar, Clock, MapPin, Hourglass, Loader2 } from 'lucide-react';
import type { BookingData } from '@/components/booking/BookingFlow';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

type ConfirmationStepProps = {
  bookingData: BookingData;
  updateBookingData: (data: Partial<BookingData>) => void;
  onBack: () => void;
  onBookingComplete: () => void;
};

// A small component for a summary item
const SummaryItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | React.ReactNode }) => (
    <div className="flex items-start justify-between py-2">
        <div className="flex items-center gap-3">
            {icon}
            <span className="text-muted-foreground">{label}</span>
        </div>
        <span className="font-semibold text-right capitalize">{value}</span>
    </div>
);


export function ConfirmationStep({ bookingData, updateBookingData, onBack, onBookingComplete }: ConfirmationStepProps) {
  const [email, setEmail] = useState(bookingData.email);
  const [phone, setPhone] = useState(bookingData.phone);
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; phone?: string, consent?: string }>({});
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const isEmailValid = (email: string) => /^\S+@\S+\.\S+$/.test(email);
  const isPhoneValid = (phone: string) => /^\+?[0-9\s-()]{8,}$/.test(phone);

  const validate = () => {
    const newErrors: { email?: string; phone?: string, consent?: string } = {};
    if (!email) {
      newErrors.email = 'Veuillez saisir un e-mail.';
    } else if (!isEmailValid(email)) {
      newErrors.email = 'Veuillez saisir un e-mail valide.';
    }

    if (!phone) {
      newErrors.phone = 'Veuillez saisir un numéro de téléphone.';
    } else if (!isPhoneValid(phone)) {
        newErrors.phone = "Format du numéro de téléphone invalide."
    }

    if (!consent) {
        newErrors.consent = "Vous devez accepter les conditions pour être contacté."
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }
  
  useEffect(() => {
    if (hasAttemptedSubmit) {
      validate();
    }
  }, [email, phone, consent, hasAttemptedSubmit]);
  
  const handleContactClick = (contactMethod: 'call' | 'message') => {
    setHasAttemptedSubmit(true);
    if (validate()) {
      setIsSubmitting(true);
      // Simulate backend submission
      setTimeout(() => {
        setIsSubmitting(false);
        setIsSubmitted(true);
        if (contactMethod === 'call') {
          window.location.href = `tel:${phone.replace(/\s/g, '')}`;
        } else {
          const message = encodeURIComponent("Bonjour, je confirme ma réservation avec Inoubliable.");
          window.open(`https://wa.me/${phone.replace(/[\s+()-]/g, '')}?text=${message}`, '_blank');
        }
        setTimeout(() => {
            onBookingComplete();
        }, 3000);

      }, 1500)
    }
  };

  const isFormValid = email && phone && consent && isEmailValid(email) && isPhoneValid(phone);
  
  const getEventIcon = () => {
    switch (bookingData.eventType) {
      case 'mariage':
        return <PartyPopper className="h-5 w-5 text-primary" />;
      case 'entreprise':
        return <Briefcase className="h-5 w-5 text-primary" />;
      default:
        return <Sparkles className="h-5 w-5 text-primary" />;
    }
  };

  const selectedDateDisplay = bookingData.date
    ? format(bookingData.date, 'EEEE d MMMM yyyy', { locale: fr })
    : 'Non précisée';
    
  if (isSubmitted) {
      return (
          <div className="flex flex-col items-center justify-center text-center p-8 min-h-[50vh]">
            <PartyPopper className="h-16 w-16 text-accent mb-4 animate-in fade-in zoom-in" />
            <h2 className="text-2xl font-bold font-headline">Demande enregistrée !</h2>
            <p className="text-muted-foreground mt-2 max-w-sm">
                Merci de votre confiance. Vous pouvez fermer cette fenêtre, notre équipe vous contactera très prochainement.
            </p>
            <Button onClick={onBookingComplete} className="mt-6">Fermer</Button>
          </div>
      )
  }

  return (
    <div className="p-4 md:p-6">
      <Card className="w-full max-w-2xl shadow-none border-none">
        <CardHeader className="text-center px-0">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold font-headline mt-4">
            Un dernier coup d'œil
          </CardTitle>
          <CardDescription className="text-lg pt-2">
            Vérifiez les détails de votre demande avant de finaliser.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 px-0">
            <Card className="bg-background/50">
                <CardHeader>
                    <CardTitle className="text-xl font-headline">Récapitulatif</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 text-sm">
                    <SummaryItem icon={getEventIcon()} label="Événement" value={bookingData.eventType} />
                    <Separator />
                    <SummaryItem icon={<ListChecks className="h-5 w-5 text-primary" />} label="Services" value={bookingData.services.join(', ') || 'Non précisés'} />
                     <Separator />
                    <SummaryItem icon={<Calendar className="h-5 w-5 text-primary" />} label="Date" value={selectedDateDisplay} />
                     <Separator />
                    <SummaryItem icon={<Clock className="h-5 w-5 text-primary" />} label="Heure" value={bookingData.time || 'Non précisée'} />
                     <Separator />
                    <SummaryItem icon={<MapPin className="h-5 w-5 text-primary" />} label="Ville" value={bookingData.city || 'Non précisée'} />
                     <Separator />
                    <SummaryItem icon={<Hourglass className="h-5 w-5 text-primary" />} label="Durée" value={bookingData.duration || 'Non précisée'} />
                </CardContent>
            </Card>
            
          <Separator />

          <div className="text-center">
             <h3 className="text-xl font-semibold font-headline">Confirmez pour être contacté</h3>
             <p className="text-muted-foreground mt-1 text-sm md:text-base">Veuillez renseigner vos informations pour finaliser votre demande.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-2">
                <Label htmlFor="email" className={cn(errors.email && "text-destructive")}>Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="vous@exemple.com"
                  value={email}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    setEmail(newValue);
                    updateBookingData({ email: newValue });
                  }}
                  className={cn(errors.email && 'border-destructive focus-visible:ring-destructive')}
                />
                {errors.email && <p className="text-sm text-destructive flex items-center gap-1 pt-1"><AlertCircle className="h-4 w-4" />{errors.email}</p>}
             </div>
             <div className="space-y-2">
                <Label htmlFor="phone" className={cn(errors.phone && "text-destructive")}>Téléphone</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+237 6 XX XX XX XX"
                  value={phone}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    setPhone(newValue);
                    updateBookingData({ phone: newValue });
                  }}
                  className={cn(errors.phone && 'border-destructive focus-visible:ring-destructive')}
                />
                {errors.phone && <p className="text-sm text-destructive flex items-center gap-1 pt-1"><AlertCircle className="h-4 w-4" />{errors.phone}</p>}
             </div>
          </div>
          <div className="items-top flex space-x-3 pt-2">
            <Checkbox id="terms1" checked={consent} onCheckedChange={(checked) => setConsent(checked as boolean)} className={cn('mt-0.5', errors.consent && 'border-destructive')}/>
            <div className="grid gap-1.5 leading-none">
                <label
                htmlFor="terms1"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                Je confirme mes informations
                </label>
                <p className="text-sm text-muted-foreground">
                J’accepte que mon numéro et mon e-mail soient utilisés pour être contacté par l’équipe Inoubliable.
                </p>
                {errors.consent && <p className="text-sm text-destructive flex items-center gap-1 pt-1"><AlertCircle className="h-4 w-4" />{errors.consent}</p>}
            </div>
           </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            <Button size="lg" disabled={!isFormValid || isSubmitting} onClick={() => handleContactClick('call')} className="bg-accent hover:bg-accent/90 text-accent-foreground">
              {isSubmitting && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              <Phone className="mr-2 h-5 w-5" />
              Confirmer par Appel
            </Button>
            <Button size="lg" disabled={!isFormValid || isSubmitting} onClick={() => handleContactClick('message')}>
              {isSubmitting && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              <MessageSquare className="mr-2 h-5 w-5" />
              Confirmer par Message
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex-col sm:flex-row justify-between items-center gap-4 pt-6 px-0">
            <Button variant="outline" size="lg" onClick={onBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Précédent
            </Button>
            <Button asChild variant="link" className="text-muted-foreground">
              <Link href="/">Retour à l'accueil</Link>
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
