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
      // Étape 1 : AUTHENTIFIER l'utilisateur via Firebase Auth.
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Étape 2 : IDENTIFIER le rôle en consultant Firestore.
      const userDocRef = doc(firestore, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      let userRole: string | null = null;
      
      if (userDoc.exists()) {
          userRole = userDoc.data()?.role;
      } else if (user.email === SUPERADMIN_EMAIL) {
          // Étape 2.1 : Si le document n'existe pas et que l'email correspond, créez le superadmin.
          await setDoc(userDocRef, {
              uid: user.uid,
              email: user.email,
              displayName: 'Super Admin',
              role: 'superadmin',
              active: true,
              createdAt: serverTimestamp()
          });
          userRole = 'superadmin';
          toast({ title: 'Compte Super Admin initialisé !', description: 'Redirection vers votre tableau de bord...' });
      }

      // Étape 3 : AUTORISER en fonction du rôle.
      if (userRole === 'admin' || userRole === 'superadmin') {
          toast({ title: 'Connexion réussie !', description: 'Redirection vers votre tableau de bord...' });
          router.replace('/admin/dashboard');
      } else {
          // Si l'authentification a réussi mais que le rôle n'est pas suffisant, déconnectez et affichez un message clair.
          await signOut(auth);
          toast({
              variant: 'destructive',
              title: 'Accès non autorisé',
              description: "Vous n'avez pas les permissions nécessaires pour accéder à cette section."
          });
      }

    } catch (error) {
        // Ce bloc ne gère QUE les erreurs d'authentification réelles ou les problèmes techniques.
        let title = 'Échec de la connexion';
        let description = 'Une erreur est survenue.';
        
        if (error instanceof FirebaseError) {
            switch (error.code) {
                case 'auth/user-not-found':
                case 'auth/wrong-password':
                case 'auth/invalid-credential':
                    description = 'Email ou mot de passe invalide.';
                    break;
                default:
                    console.error("Erreur de connexion inattendue:", error);
                    description = "Une erreur technique est survenue. Veuillez réessayer.";
                    break;
            }
        } else {
             console.error("Erreur non-Firebase:", error);
        }
        toast({ variant: 'destructive', title, description });
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
