'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckCircle, Phone, MessageSquare, AlertCircle } from 'lucide-react';
import type { BookingData } from '@/app/booking/page';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

type ConfirmationStepProps = {
  bookingData: BookingData;
  updateBookingData: (data: Partial<BookingData>) => void;
};

export function ConfirmationStep({ bookingData, updateBookingData }: ConfirmationStepProps) {
  const [email, setEmail] = useState(bookingData.email);
  const [phone, setPhone] = useState(bookingData.phone);
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; phone?: string, consent?: string }>({});
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

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
      if (contactMethod === 'call') {
        window.location.href = `tel:${phone.replace(/\s/g, '')}`;
      } else {
        const message = encodeURIComponent("Bonjour, je confirme ma réservation avec Inoubliable.");
        window.open(`https://wa.me/${phone.replace(/[\s+()-]/g, '')}?text=${message}`, '_blank');
      }
    }
  };

  const isFormValid = email && phone && consent && isEmailValid(email) && isPhoneValid(phone);

  return (
    <div className="flex items-center justify-center py-12 animate-in fade-in duration-500">
      <Card className="w-full max-w-2xl shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-3xl font-bold font-headline mt-4">
            Demande enregistrée !
          </CardTitle>
          <CardDescription className="text-lg pt-2">
            Votre demande a bien été prise en compte. Une équipe vous contactera
            très bientôt.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 px-4 md:px-6">
          <Separator />
          <div className="text-center">
             <h3 className="text-xl font-semibold font-headline">Comment préférez-vous être contacté ?</h3>
             <p className="text-muted-foreground mt-1 text-sm md:text-base">Veuillez renseigner vos informations pour activer les options de contact.</p>
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
            <Button size="lg" disabled={!isFormValid} onClick={() => handleContactClick('call')} className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <Phone className="mr-2 h-5 w-5" />
              Me faire appeler
            </Button>
            <Button size="lg" disabled={!isFormValid} onClick={() => handleContactClick('message')}>
              <MessageSquare className="mr-2 h-5 w-5" />
              Message WhatsApp
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex-col gap-4 pt-6">
            <Separator />
            <Button asChild variant="link" className="text-muted-foreground">
              <Link href="/">Retour à l'accueil</Link>
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
