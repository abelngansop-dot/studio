'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { MessageSquare, Mail, AlertCircle, ArrowLeft, PartyPopper, Briefcase, Sparkles, ListChecks, Calendar, Clock, MapPin, Hourglass, Loader2, CheckCircle } from 'lucide-react';
import type { BookingData } from '@/components/booking/BookingFlow';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useFirestore, useUser } from '@/firebase';
import { collection, serverTimestamp } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';

type ConfirmationStepProps = {
  bookingData: BookingData;
  updateBookingData: (data: Partial<BookingData>) => void;
  onBack: () => void;
  onBookingComplete: () => void;
};

// A small component for a summary item
const SummaryItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | React.ReactNode }) => (
    <div className="flex items-start justify-between py-3">
        <div className="flex items-center gap-3">
            {icon}
            <span className="text-muted-foreground">{label}</span>
        </div>
        <span className="font-semibold text-right capitalize">{value}</span>
    </div>
);

const generateBookingSummaryText = (bookingData: any): string => {
  const summaryLines = [
    `Bonjour,`,
    `Je souhaite confirmer ma demande de réservation pour un événement Inoublevents.`,
    `Voici le proforma de ma demande :`,
    ``,
    `--- DÉTAILS DE L'ÉVÉNEMENT ---`,
    `Type d'événement : ${bookingData.eventType}`,
    `Service(s) demandé(s) : ${bookingData.services.join(', ')}`,
    `Date : ${bookingData.date ? format(bookingData.date, 'EEEE d MMMM yyyy', { locale: fr }) : 'Non précisée'}`,
    `Heure de début : ${bookingData.time || 'Non précisée'}`,
    `Ville : ${bookingData.city || 'Non précisée'}`,
    `Durée estimée : ${bookingData.duration || 'Non précisée'}`,
    ``,
    `--- MES COORDONNÉES ---`,
    `Email : ${bookingData.email}`,
    `Téléphone : ${bookingData.phone}`,
    ``,
    `Merci de me recontacter pour finaliser le devis.`,
  ];
  return summaryLines.join('\n');
};


export function ConfirmationStep({ bookingData, updateBookingData, onBack, onBookingComplete }: ConfirmationStepProps) {
  const [email, setEmail] = useState(bookingData.email);
  const [phone, setPhone] = useState(bookingData.phone);
  const [consent, setConsent] = useState(false);
  const [emailError, setEmailError] = useState<string | undefined>();
  const [phoneError, setPhoneError] = useState<string | undefined>();
  const [consentError, setConsentError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const isEmailFormatValid = useMemo(() => (email ? /^\S+@\S+\.\S+$/.test(email) : false), [email]);
  const isPhoneFormatValid = useMemo(() => (phone ? /^\+?[0-9\s-()]{8,}$/.test(phone) : false), [phone]);

  useEffect(() => {
    if (email && !isEmailFormatValid) setEmailError('Email invalide.');
    else setEmailError(undefined);
  }, [email, isEmailFormatValid]);

  useEffect(() => {
    if (phone && !isPhoneFormatValid) setPhoneError('Téléphone invalide.');
    else setPhoneError(undefined);
  }, [phone, isPhoneFormatValid]);

  useEffect(() => {
    if (consent) setConsentError(undefined);
  }, [consent]);
  
  const handleConfirm = async (method: 'whatsapp' | 'email') => {
    if (!consent) {
        setConsentError("Vous devez accepter les conditions pour être contacté.");
        return;
    }
    
    if (!firestore) return;
    setIsSubmitting(true);

    const bookingPayload = {
      ...bookingData,
      userId: user?.uid || null,
      status: 'pending',
      createdAt: serverTimestamp(),
      contactInfo: {
        email: email,
        phone: phone
      }
    };
    
    try {
      const bookingsCol = collection(firestore, 'bookings');
      await addDocumentNonBlocking(bookingsCol, bookingPayload);

      setIsSubmitted(true);

      const summaryText = generateBookingSummaryText(bookingPayload);
      const businessWhatsapp = "237699264201";
      const businessEmail = "inoublevents@gmail.com";

      if (method === 'whatsapp') {
        const whatsappUrl = `https://wa.me/${businessWhatsapp}?text=${encodeURIComponent(summaryText)}`;
        window.open(whatsappUrl, '_blank');
      } else { // method === 'email'
        const subject = `Demande de réservation Inoublevents : ${bookingData.eventType}`;
        const mailtoUrl = `mailto:${businessEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(summaryText)}`;
        window.location.href = mailtoUrl;
      }

      setTimeout(() => {
          onBookingComplete();
      }, 3000);

    } catch (error) {
      console.error("Error saving booking:", error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Votre réservation n\'a pas pu être sauvegardée. Veuillez réessayer.'
      })
    } finally {
      setIsSubmitting(false);
    }
  };
  
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
    <div className="p-4 sm:p-6 md:p-8">
        <div className="text-center mb-8">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                <CheckCircle className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-3xl font-bold font-headline">Un dernier coup d'œil</h2>
            <p className="text-muted-foreground mt-2 text-lg">Vérifiez les détails et confirmez vos informations pour finaliser.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">

            {/* Form Section (Left) */}
            <div className="lg:col-span-3 space-y-6">
                <Card className="shadow-md">
                    <CardHeader>
                        <CardTitle className="text-xl font-headline">Vos informations de contact</CardTitle>
                        <CardDescription>Remplissez ces champs pour que notre équipe puisse vous recontacter.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="email" className={cn("font-semibold", emailError && "text-destructive")}>Email</Label>
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
                                  className={cn(emailError && 'border-destructive focus-visible:ring-destructive')}
                                />
                                {emailError && <p className="text-sm text-destructive flex items-center gap-1 pt-1"><AlertCircle className="h-4 w-4" />{emailError}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone" className={cn("font-semibold", phoneError && "text-destructive")}>Téléphone</Label>
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
                                  className={cn(phoneError && 'border-destructive focus-visible:ring-destructive')}
                                />
                                {phoneError && <p className="text-sm text-destructive flex items-center gap-1 pt-1"><AlertCircle className="h-4 w-4" />{phoneError}</p>}
                            </div>
                        </div>
                        <div className="items-top flex space-x-3 pt-2">
                            <Checkbox id="terms1" checked={consent} onCheckedChange={(checked) => setConsent(checked as boolean)} className={cn('mt-0.5', consentError && 'border-destructive')}/>
                            <div className="grid gap-1.5 leading-none">
                                <label
                                htmlFor="terms1"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                Je confirme mes informations
                                </label>
                                <p className="text-sm text-muted-foreground">
                                J’accepte que mon numéro et mon e-mail soient utilisés pour être contacté par l’équipe Inoublevents.
                                </p>
                                {consentError && <p className="text-sm text-destructive flex items-center gap-1 pt-1"><AlertCircle className="h-4 w-4" />{consentError}</p>}
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4">
                    <Button variant="outline" size="lg" onClick={onBack}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Précédent
                    </Button>
                    <Button asChild variant="link" className="text-muted-foreground">
                        <Link href="/">Retour à l'accueil</Link>
                    </Button>
                </div>
            </div>

            {/* Summary Section (Right & Sticky) */}
            <div className="lg:col-span-2 lg:sticky top-6">
                <Card className="border-primary/20 shadow-xl">
                    <CardHeader className="bg-primary/5">
                        <CardTitle className="text-2xl font-headline text-primary">Proforma de votre demande</CardTitle>
                    </CardHeader>
                    <CardContent className="divide-y divide-border pt-4">
                        <SummaryItem icon={getEventIcon()} label="Événement" value={bookingData.eventType} />
                        <SummaryItem icon={<ListChecks className="h-5 w-5 text-primary" />} label="Services" value={bookingData.services.join(', ') || 'Non précisés'} />
                        <SummaryItem icon={<Calendar className="h-5 w-5 text-primary" />} label="Date" value={selectedDateDisplay} />
                        <SummaryItem icon={<Clock className="h-5 w-5 text-primary" />} label="Heure" value={bookingData.time || 'Non précisée'} />
                        <SummaryItem icon={<MapPin className="h-5 w-5 text-primary" />} label="Ville" value={bookingData.city || 'Non précisée'} />
                        <SummaryItem icon={<Hourglass className="h-5 w-5 text-primary" />} label="Durée" value={bookingData.duration || 'Non précisée'} />
                    </CardContent>
                    <CardFooter className="flex-col gap-4 pt-6 bg-secondary/30">
                        <p className="text-xs text-center text-muted-foreground px-4">En confirmant, notre équipe vous contactera pour établir le devis final.</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                            <Button size="lg" disabled={!isPhoneFormatValid || !consent || isSubmitting} onClick={() => handleConfirm('whatsapp')} className="bg-green-600 hover:bg-green-700 text-white">
                              {isSubmitting && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                              <MessageSquare className="mr-2 h-5 w-5" />
                              Confirmer par WhatsApp
                            </Button>
                            <Button size="lg" disabled={!isEmailFormatValid || !consent || isSubmitting} onClick={() => handleConfirm('email')}>
                              {isSubmitting && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                              <Mail className="mr-2 h-5 w-5" />
                              Confirmer par Email
                            </Button>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </div>
    </div>
  );
}
