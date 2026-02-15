'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth, useFirestore } from '@/firebase/provider';
import { FirebaseError } from 'firebase/app';
import { Loader2, Phone as PhoneIcon } from 'lucide-react';
import { useNavigationHistory } from '@/hooks/use-navigation-history';
import { Header } from '@/components/Header';
import { ContactFooter } from '@/components/ContactFooter';
import { allCountries } from '@/lib/locations';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 48 48" {...props}>
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
        <path fill="none" d="M0 0h48v48H0z" />
    </svg>
);


export default function LoginPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  const firestore = useFirestore();
  const { popLastRoute } = useNavigationHistory();
  const [countryCode, setCountryCode] = useState('+237');

  const handleSuccess = () => {
    const lastRoute = popLastRoute();
    router.push(lastRoute || '/mes-reservations');
  };

  const handleAuthError = (error: any) => {
    let description = 'Une erreur est survenue.';
    if (error instanceof FirebaseError) {
      switch (error.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          description = 'Identifiants invalides.';
          break;
        case 'auth/email-already-in-use':
            description = 'Cette adresse e-mail est déjà utilisée.';
            break;
        case 'auth/weak-password':
            description = 'Le mot de passe doit contenir au moins 6 caractères.';
            break;
        case 'auth/popup-closed-by-user':
            description = 'La fenêtre de connexion a été fermée.';
            return; // Don't show a toast for this
        default:
          description = "Une erreur inconnue est survenue.";
      }
    }
    toast({ variant: 'destructive', title: 'Échec', description });
  }

  const handleGoogleSignIn = async () => {
    if (!auth || !firestore) {
        toast({ variant: 'destructive', title: 'Erreur', description: "Les services Firebase ne sont pas disponibles." });
        return;
    }
    setIsSubmitting(true);
    const provider = new GoogleAuthProvider();

    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        const userDocRef = doc(firestore, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
            const newUserProfile = {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                role: 'client',
                createdAt: serverTimestamp()
            };
            await setDoc(userDocRef, newUserProfile, { merge: false });
            toast({ title: 'Bienvenue ! Votre compte a été créé.' });
        } else {
            toast({ title: 'Connexion réussie !' });
        }
        
        handleSuccess();

    } catch (error) {
        handleAuthError(error);
    } finally {
        setIsSubmitting(false);
    }
  };


  return (
    <div className="flex flex-col min-h-screen bg-secondary/30">
      <Header />
      <main className="flex-grow flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl">Accédez à votre espace</CardTitle>
                <CardDescription>
                Connectez-vous ou créez un compte pour gérer vos réservations.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
                <Button variant="outline" className="h-12 text-base" onClick={handleGoogleSignIn} disabled={isSubmitting}>
                    {isSubmitting ? (
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                        <GoogleIcon className="mr-3 h-5 w-5" />
                    )}
                    Continuer avec Google
                </Button>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">
                        Ou
                        </span>
                    </div>
                </div>

                <div className="grid gap-4 text-center">
                    <div className="grid gap-2 text-left">
                        <Label>Se connecter par téléphone (bientôt disponible)</Label>
                        <div className="flex gap-2">
                            <Select defaultValue={countryCode} onValueChange={setCountryCode}>
                                <SelectTrigger className="w-[140px]">
                                    <SelectValue placeholder="Code pays" />
                                </SelectTrigger>
                                <SelectContent>
                                    {allCountries.map((c) => <SelectItem key={c.code} value={c.phoneCode}>{c.name} ({c.phoneCode})</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <Input type="tel" placeholder="Numéro de téléphone" disabled/>
                        </div>
                    </div>
                    <Button 
                        type="button" 
                        className="w-full"
                        onClick={() => toast({ title: 'Bientôt disponible', description: "La connexion par téléphone arrive prochainement !"})}
                        disabled
                    >
                      Recevoir un code
                    </Button>
                </div>
                 <div className="mt-4 text-center text-sm">
                  <Button variant="link" asChild className="text-muted-foreground">
                      <Link href="/">Retour à l'accueil</Link>
                  </Button>
                </div>
            </CardContent>
        </Card>
      </main>
      <ContactFooter />
    </div>
  );
}
