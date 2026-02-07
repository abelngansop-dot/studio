'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ArrowLeft, Loader2, PartyPopper } from 'lucide-react';
import { useFirestore, useUser } from '@/firebase';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { collection, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';


type OtherRequestStepProps = {
    onBack: () => void;
    closeModal: () => void;
}

export function OtherRequestStep({ onBack, closeModal }: OtherRequestStepProps) {
    const [details, setDetails] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [errors, setErrors] = useState<{ details?: string, phone?: string, email?: string }>({});

    const firestore = useFirestore();
    const { user } = useUser();
    const { toast } = useToast();

    const validate = () => {
        const newErrors: { details?: string, phone?: string, email?: string } = {};
        if (!details.trim()) {
            newErrors.details = 'Veuillez décrire votre besoin.';
        }
        if (!phone.trim()) {
            newErrors.phone = 'Le numéro de téléphone est obligatoire.';
        } else if (!/^\+?[0-9\s-()]{8,}$/.test(phone)) {
            newErrors.phone = 'Veuillez entrer un numéro de téléphone valide.';
        }
        if (!email.trim()) {
            newErrors.email = 'L\'adresse e-mail est obligatoire.';
        }
        else if (!/^\S+@\S+\.\S+$/.test(email)) {
            newErrors.email = 'Veuillez entrer une adresse e-mail valide.';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    const handleSubmit = async () => {
        if (!validate() || !firestore) return;
        setIsSubmitting(true);

        const payload = {
            eventType: 'autre',
            requestDetails: details,
            contactInfo: {
                phone,
                email,
            },
            userId: user?.uid || null,
            status: 'pending',
            createdAt: serverTimestamp(),
            services: [],
        }

        try {
            await addDocumentNonBlocking(collection(firestore, 'bookings'), payload);
            setIsSubmitted(true);
            toast({
                title: "Demande envoyée !",
                description: "Notre équipe vous contactera très bientôt.",
            });
            setTimeout(() => {
                closeModal();
            }, 3000);
        } catch (error) {
            console.error("Error saving 'other' request:", error);
            toast({
                variant: 'destructive',
                title: 'Erreur',
                description: 'Votre demande n\'a pas pu être envoyée. Veuillez réessayer.'
            });
            setIsSubmitting(false);
        }
    }
    
    if (isSubmitted) {
      return (
          <div className="flex flex-col items-center justify-center text-center p-8 min-h-[50vh] animate-in fade-in">
            <PartyPopper className="h-16 w-16 text-accent mb-4" />
            <h2 className="text-2xl font-bold font-headline">Demande envoyée !</h2>
            <p className="text-muted-foreground mt-2 max-w-sm">
                Merci de votre confiance. Notre équipe vous contactera très prochainement pour discuter de votre projet.
            </p>
            <Button onClick={closeModal} className="mt-6">Fermer</Button>
          </div>
      )
    }

    return (
        <>
            <DialogHeader className="p-6 pb-0">
                <DialogTitle className="text-center text-3xl font-bold font-headline tracking-tight">Besoin spécifique ?</DialogTitle>
                <DialogDescription className="text-center">
                    Décrivez-nous votre projet, nous vous recontacterons dans les plus brefs délais.
                </DialogDescription>
            </DialogHeader>
            <div className="p-6 space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="details" className={cn('font-semibold', errors.details && 'text-destructive')}>
                        Décrivez votre besoin <span className="text-destructive">*</span>
                    </Label>
                    <Textarea 
                        id="details" 
                        placeholder="Ex : J'organise une conférence et j'ai besoin d'un service de projection et de micros..."
                        value={details}
                        onChange={(e) => setDetails(e.target.value)}
                        className="min-h-[120px]"
                    />
                    {errors.details && <p className="text-sm text-destructive">{errors.details}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <Label htmlFor="phone" className={cn('font-semibold', errors.phone && 'text-destructive')}>
                            Téléphone <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="phone"
                            type="tel"
                            placeholder="+237 6 XX XX XX XX"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className={cn(errors.phone && 'border-destructive focus-visible:ring-destructive')}
                        />
                        {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email" className={cn('font-semibold', errors.email && 'text-destructive')}>
                            Email <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="vous@exemple.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={cn(errors.email && 'border-destructive focus-visible:ring-destructive')}
                        />
                        {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                    </div>
                </div>

                <div className="flex justify-between items-center pt-4">
                    <Button variant="outline" onClick={onBack} disabled={isSubmitting}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Précédent
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Envoyer ma demande
                    </Button>
                </div>
            </div>
        </>
    )
}
