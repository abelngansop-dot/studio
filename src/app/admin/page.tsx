'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { useAuth, useUser, useFirestore } from '@/firebase';
import { FirebaseError } from 'firebase/app';
import { Loader2 } from 'lucide-react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoginView, setIsLoginView] = useState(true);
  
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();

  // Redirects the user to the dashboard if they are already logged in.
  useEffect(() => {
    if (!isUserLoading && user) {
      router.replace('/admin/dashboard');
    }
  }, [user, isUserLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !firestore) {
      toast({ variant: 'destructive', title: 'Erreur', description: "Les services Firebase ne sont pas disponibles." });
      return;
    }
    setIsSubmitting(true);

    try {
      if (isLoginView) {
        await signInWithEmailAndPassword(auth, email, password);
        toast({ title: 'Connexion réussie !', description: 'Redirection vers votre tableau de bord...' });
      } else {
        // Registration Logic
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const newUser = userCredential.user;
        
        // Create the user document with the default 'client' role.
        // This is a secure operation allowed by Firestore rules.
        const userDocRef = doc(firestore, 'users', newUser.uid);
        await setDoc(userDocRef, {
            uid: newUser.uid,
            email: newUser.email,
            displayName: newUser.displayName,
            photoURL: newUser.photoURL,
            role: 'client', // Always create as a non-privileged user first.
            createdAt: serverTimestamp()
        });
        
        toast({ title: 'Compte créé !', description: 'Veuillez maintenant vous connecter et suivre les instructions pour devenir administrateur.' });
        setIsLoginView(true); // Switch to login view after successful registration
      }
    } catch (error) {
      console.error(error);
      let description = 'Une erreur est survenue.';
      if (error instanceof FirebaseError) {
        switch (error.code) {
          case 'auth/user-not-found':
            description = 'Aucun compte trouvé pour cet email.';
            break;
          case 'auth/wrong-password':
          case 'auth/invalid-credential':
            description = 'Email ou mot de passe invalide.';
            break;
          case 'auth/email-already-in-use':
            description = 'Un compte existe déjà avec cette adresse email.';
            break;
          default:
            description = "Une erreur inconnue est survenue. Veuillez réessayer.";
        }
      }
      toast({ variant: 'destructive', title: isLoginView ? 'Échec de la connexion' : "Échec de l'inscription", description });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isUserLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-3 text-muted-foreground">Vérification...</p>
      </div>
    );
  }

  if (user && !isUserLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-3 text-muted-foreground">Redirection...</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader>
          <CardTitle className="text-2xl">{isLoginView ? 'Accès Administrateur' : 'Créer un Compte'}</CardTitle>
          <CardDescription>
            {isLoginView ? "Entrez vos identifiants pour accéder à votre tableau de bord." : "Créez un compte, puis connectez-vous."}
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
              {isLoginView ? 'Se connecter' : "S'inscrire"}
            </Button>
          </form>
           <div className="mt-4 text-center text-sm">
              {isLoginView ? "Besoin d'un compte ?" : "Déjà un compte ?"}
              <Button variant="link" onClick={() => setIsLoginView(!isLoginView)}>
               {isLoginView ? "S'inscrire" : "Se connecter"}
              </Button>
           </div>
        </CardContent>
      </Card>
    </div>
  );
}
