'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { useAuth } from '@/firebase'; // Make sure this hook provides the auth instance
import { FirebaseError } from 'firebase/app';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false); // To toggle between Sign In and Sign Up
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();

  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        // Sign Up
        await createUserWithEmailAndPassword(auth, email, password);
        toast({
          title: 'Compte créé !',
          description: 'Vous êtes maintenant connecté.',
        });
      } else {
        // Sign In
        await signInWithEmailAndPassword(auth, email, password);
        toast({
          title: 'Connexion réussie !',
          description: 'Bienvenue sur votre tableau de bord.',
        });
      }
      router.push('/dashboard');
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

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader>
          <CardTitle className="text-2xl">{isSignUp ? 'Créer un compte' : 'Connexion'}</CardTitle>
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
                placeholder="m@exemple.com"
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
