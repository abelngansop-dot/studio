'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword } from 'firebase/auth';
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
        // --- ÉTAPE 1: Tenter la connexion ---
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // --- ÉTAPE 2: Connexion réussie, vérifier l'autorisation ---
        const userDocRef = doc(firestore, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        let userRole = userDoc.exists() ? userDoc.data()?.role : null;
        
        // Si l'utilisateur connecté est le superadmin mais n'a pas de document, on le crée
        if (!userDoc.exists() && user.email === SUPERADMIN_EMAIL) {
            await setDoc(userDocRef, {
                uid: user.uid,
                email: user.email,
                displayName: 'Super Admin',
                role: 'superadmin',
                createdAt: serverTimestamp()
            });
            userRole = 'superadmin';
        }

        // --- ÉTAPE 3: Rediriger ou éjecter ---
        if (userRole === 'admin' || userRole === 'superadmin') {
            toast({ title: 'Connexion réussie !', description: 'Redirection vers votre tableau de bord...' });
            router.replace('/admin/dashboard');
        } else {
            await signOut(auth);
            toast({
                variant: 'destructive',
                title: 'Accès non autorisé',
                description: "Vous n'avez pas les permissions nécessaires pour accéder à cette section."
            });
        }
    } catch (error) {
        // --- ÉTAPE 1.1: La connexion a échoué, analyser pourquoi ---
        if (error instanceof FirebaseError && (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') && email === SUPERADMIN_EMAIL) {
            // --- CAS SPÉCIAL: L'utilisateur est le SUPERADMIN et n'existe pas, on le crée ---
            try {
                const newUserCredential = await createUserWithEmailAndPassword(auth, email, password);
                const newUser = newUserCredential.user;
                
                // Créer le document Firestore pour le nouveau superadmin
                const userDocRef = doc(firestore, "users", newUser.uid);
                await setDoc(userDocRef, {
                    uid: newUser.uid,
                    email: newUser.email,
                    displayName: 'Super Admin',
                    role: 'superadmin',
                    createdAt: serverTimestamp()
                });

                toast({ title: 'Compte Super Admin créé !', description: 'Redirection vers votre tableau de bord...' });
                router.replace('/admin/dashboard');

            } catch (creationError) {
                // Erreur lors de la création (ex: mot de passe trop faible)
                let description = "Une erreur est survenue lors de la création du compte admin.";
                if (creationError instanceof FirebaseError) {
                    if(creationError.code === 'auth/weak-password') {
                        description = 'Le mot de passe est trop faible. Il doit contenir au moins 6 caractères.';
                    }
                }
                toast({ variant: 'destructive', title: 'Erreur de création', description });
            }
        } else if (error instanceof FirebaseError && (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential')) {
            // --- CAS CLASSIQUE: Identifiants incorrects ---
             toast({ variant: 'destructive', title: 'Échec de la connexion', description: 'Email ou mot de passe invalide.' });
        } else {
            // --- AUTRES ERREURS INATTENDUES ---
            console.error("Erreur de connexion inattendue:", error);
            toast({ variant: 'destructive', title: 'Échec de la connexion', description: "Une erreur technique est survenue." });
        }
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
