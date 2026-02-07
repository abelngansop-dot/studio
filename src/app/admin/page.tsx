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
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();

  useEffect(() => {
    if (!isUserLoading && user) {
      router.replace('/admin/dashboard');
    }
  }, [user, isUserLoading, router]);


  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !firestore) {
        toast({
            variant: 'destructive',
            title: "Erreur d'authentification",
            description: "Le service d'authentification ou de base de données n'est pas disponible.",
        });
        return;
    }
    setIsLoading(true);

    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const newUser = userCredential.user;
        
        // Create user document in Firestore with superadmin role
        const userDocRef = doc(firestore, 'users', newUser.uid);
        await setDoc(userDocRef, {
            uid: newUser.uid,
            email: newUser.email,
            displayName: newUser.displayName || email.split('@')[0],
            photoURL: newUser.photoURL,
            role: 'superadmin',
            createdAt: serverTimestamp()
        });

        toast({
          title: 'Compte créé !',
          description: 'Vous êtes maintenant connecté avec les droits de super administrateur.',
        });
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        
        // Ensure user has a role document in Firestore.
        // This handles cases where a user was created in Auth but not in Firestore.
        const userDocRef = doc(firestore, 'users', userCredential.user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (!userDocSnap.exists()) {
          // If the user document doesn't exist, create it with superadmin role.
          // This is a failsafe for the admin user.
          await setDoc(userDocRef, {
            uid: userCredential.user.uid,
            email: userCredential.user.email,
            displayName: userCredential.user.displayName || email.split('@')[0],
            photoURL: userCredential.user.photoURL,
            role: 'superadmin',
            createdAt: serverTimestamp()
          });
        }
        
        toast({
          title: 'Connexion réussie !',
          description: 'Bienvenue sur votre tableau de bord.',
        });
      }
      // On success, the useEffect hook will redirect to the dashboard
    } catch (error) {
      console.error(error);
      let title = 'Erreur';
      let description = 'Une erreur est survenue.';
      if (error instanceof FirebaseError) {
        switch (error.code) {
          case 'auth/user-not-found':
            description = 'Aucun utilisateur trouvé avec cet e-mail.';
            break;
          case 'auth/wrong-password':
            description = 'Mot de passe incorrect.';
            break;
          case 'auth/email-already-in-use':
            description = 'Cette adresse e-mail est déjà utilisée.';
            break;
           case 'auth/invalid-credential':
             description = 'Email ou mot de passe invalide.';
             break;
          default:
            description = error.message;
        }
      }
      toast({
        variant: 'destructive',
        title: title,
        description: description,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isUserLoading || user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2">Redirection...</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader>
          <CardTitle className="text-2xl">{isSignUp ? 'Créer un compte' : 'Accès Administrateur'}</CardTitle>
          <CardDescription>
            {isSignUp ? 'Entrez vos informations pour créer un compte administrateur' : 'Entrez vos identifiants pour accéder à votre tableau de bord'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuthAction} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@exemple.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Mot de passe</Label>
              </div>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSignUp ? "S'inscrire" : 'Se connecter'}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            {isSignUp ? 'Vous avez déjà un compte ?' : 'Pas encore de compte ?'}{' '}
            <Button variant="link" onClick={() => setIsSignUp(!isSignUp)} className="p-0">
              {isSignUp ? 'Se connecter' : "S'inscrire"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
