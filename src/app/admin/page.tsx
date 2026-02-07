'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useAuth, useUser } from '@/firebase';
import { FirebaseError } from 'firebase/app';
import { Loader2 } from 'lucide-react';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();

  // Redirects the user to the dashboard if they are already logged in.
  useEffect(() => {
    if (!isUserLoading && user) {
      router.replace('/admin/dashboard');
    }
  }, [user, isUserLoading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: "Le service d'authentification n'est pas disponible.",
      });
      return;
    }
    setIsSubmitting(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: 'Connexion réussie !',
        description: 'Bienvenue sur votre tableau de bord.',
      });
      // On success, the useEffect hook above will handle redirection.
    } catch (error) {
      console.error(error);
      let description = 'Une erreur est survenue.';
      if (error instanceof FirebaseError) {
        switch (error.code) {
          case 'auth/user-not-found':
          case 'auth/wrong-password':
          case 'auth/invalid-credential':
            description = 'Email ou mot de passe invalide.';
            break;
          default:
            description = "Une erreur inconnue est survenue. Veuillez réessayer.";
        }
      }
      toast({
        variant: 'destructive',
        title: 'Échec de la connexion',
        description: description,
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // While checking auth state, show a generic loader.
  if (isUserLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-3 text-muted-foreground">Vérification...</p>
      </div>
    );
  }

  // If user is logged in, show a redirection message while useEffect redirects.
  if (user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-3 text-muted-foreground">Redirection...</p>
      </div>
    );
  }

  // If not loading and no user, show the login form.
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader>
          <CardTitle className="text-2xl">Accès Administrateur</CardTitle>
          <CardDescription>
            Entrez vos identifiants pour accéder à votre tableau de bord.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="grid gap-4">
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
