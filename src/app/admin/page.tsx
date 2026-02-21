'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword } from 'firebase/auth';
import { useAuth, useFirestore } from '@/firebase/provider';
import { FirebaseError } from 'firebase/app';
import { Loader2, AlertCircle } from 'lucide-react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// The designated email for the superadmin to bootstrap the application.
const SUPERADMIN_EMAIL = 'abelnono1994@gmail.com';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  const firestore = useFirestore();

  const handleBootstrapSuperAdmin = async (uid: string, userEmail: string) => {
    if (!firestore) return false;
    try {
        const userDocRef = doc(firestore, "users", uid);
        await setDoc(userDocRef, {
            uid: uid,
            email: userEmail,
            displayName: 'Super Admin',
            role: 'superadmin',
            createdAt: serverTimestamp()
        });
        return true;
    } catch (e) {
        console.error("Bootstrap error:", e);
        return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!auth || !firestore) {
      toast({ variant: 'destructive', title: 'Erreur', description: "Les services Firebase ne sont pas disponibles." });
      return;
    }
    setIsSubmitting(true);

    try {
        // --- ÉTAPE 1: Tenter la connexion ---
        let user;
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            user = userCredential.user;
        } catch (signInError: any) {
            // Si l'utilisateur n'existe pas et que c'est l'email superadmin, on tente de le créer
            if ((signInError.code === 'auth/user-not-found' || signInError.code === 'auth/invalid-credential') && email === SUPERADMIN_EMAIL) {
                const newUserCredential = await createUserWithEmailAndPassword(auth, email, password);
                user = newUserCredential.user;
            } else {
                throw signInError; // Relancer pour le catch externe
            }
        }

        // --- ÉTAPE 2: Vérifier/Créer le document Firestore ---
        const userDocRef = doc(firestore, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        let userRole = userDoc.exists() ? userDoc.data()?.role : null;
        
        if (!userDoc.exists() && user.email === SUPERADMIN_EMAIL) {
            const success = await handleBootstrapSuperAdmin(user.uid, user.email!);
            if (success) {
                userRole = 'superadmin';
            } else {
                throw new Error("Impossible de créer le profil superadmin dans Firestore. Vérifiez les règles de sécurité.");
            }
        }

        // --- ÉTAPE 3: Rediriger ou éjecter ---
        if (userRole === 'admin' || userRole === 'superadmin') {
            toast({ title: 'Connexion réussie !', description: 'Bienvenue dans votre espace sécurisé.' });
            router.replace('/admin/dashboard');
        } else {
            await signOut(auth);
            setErrorMessage("Accès non autorisé : Vous n'avez pas le rôle d'administrateur.");
        }
    } catch (error: any) {
        console.error("Admin login error:", error);
        let message = "Une erreur est survenue lors de la connexion.";
        
        if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
            message = "Email ou mot de passe incorrect.";
        } else if (error.code === 'auth/weak-password') {
            message = "Le mot de passe doit contenir au moins 6 caractères.";
        } else if (error.message) {
            message = error.message;
        }
        
        setErrorMessage(message);
    } finally {
        setIsSubmitting(false);
    }
};

  return (
    <div className="flex items-center justify-center min-h-screen bg-secondary/20">
      <Card className="mx-auto max-w-sm w-full shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold font-headline text-primary">Kabapo Admin</CardTitle>
          <CardDescription>
            Authentification requise pour accéder au cockpit.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {errorMessage && (
              <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Échec</AlertTitle>
                  <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
          )}
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email professionnel</Label>
              <Input
                id="email"
                type="email"
                placeholder="votre.email@kabapo.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            <Button type="submit" className="w-full h-11" disabled={isSubmitting}>
              {isSubmitting ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                  "Accéder au Dashboard"
              )}
            </Button>
          </form>
           <div className="mt-6 text-center">
            <Button variant="link" asChild className="text-muted-foreground text-sm">
                <Link href="/">Retour au site public</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}