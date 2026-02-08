'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { useAuth, useFirestore } from '@/firebase';
import { FirebaseError } from 'firebase/app';
import { Loader2 } from 'lucide-react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

// The designated email for the superadmin to bootstrap the application.
const SUPERADMIN_EMAIL = 'abelnono1994@gmail.com';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  const firestore = useFirestore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !firestore) {
      toast({ variant: 'destructive', title: 'Erreur', description: "Les services Firebase ne sont pas disponibles." });
      return;
    }
    setIsSubmitting(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const authenticatedUser = userCredential.user;

      const userDocRef = doc(firestore, "users", authenticatedUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        if (authenticatedUser.email === SUPERADMIN_EMAIL) {
          await setDoc(userDocRef, {
              uid: authenticatedUser.uid,
              email: authenticatedUser.email,
              displayName: 'Super Admin',
              role: 'superadmin',
              createdAt: serverTimestamp()
          });
          toast({ title: 'Compte Super Admin initialisé !', description: 'Redirection vers votre tableau de bord...' });
        } else {
          await signOut(auth);
          toast({ variant: 'destructive', title: 'Accès non autorisé', description: "Ce compte n'est pas configuré pour l'accès administrateur." });
          setIsSubmitting(false);
          return;
        }
      }
      
      toast({ title: 'Connexion réussie !', description: 'Redirection vers votre tableau de bord...' });
      router.replace('/admin/dashboard');

    } catch (error) {
      console.error(error);
      let description = 'Une erreur est survenue.';
      if (error instanceof FirebaseError) {
        switch (error.code) {
          case 'auth/user-not-found':
          case 'auth/wrong-password':
          case 'auth/invalid-credential':
            description = 'Email ou mot de passe invalide. Accès refusé.';
            break;
          default:
            description = "Une erreur inconnue est survenue. Veuillez réessayer.";
        }
      }
      toast({ variant: 'destructive', title: 'Échec de la connexion', description });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader>
          <CardTitle className="text-2xl">Accès Administrateur</CardTitle>
          <CardDescription>
            Veuillez vous authentifier pour accéder au tableau de bord.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@exemple.com"
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
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Se connecter
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
