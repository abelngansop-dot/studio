'use client';

import { useUser, useFirestore, useMemoFirebase } from '@/firebase/provider';
import { useDoc } from '@/firebase/firestore/use-doc';
import { useRouter } from 'next/navigation';
import { useEffect, useState, createContext } from 'react';
import { doc } from 'firebase/firestore';
import { Loader2, ShieldAlert } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import { ShopProvider } from '@/hooks/use-shop-admin';
import type { User as AuthUser } from 'firebase/auth';

type UserProfile = {
  role: 'client' | 'shop_admin' | 'admin' | 'superadmin';
  shopId?: string;
};

export default function ShopAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();
  const [authStatus, setAuthStatus] = useState<'loading' | 'unauthorized' | 'authorized'>('loading');

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userDocRef);

  useEffect(() => {
    if (isUserLoading || isProfileLoading) {
      return; 
    }

    if (!user) {
        router.replace('/login');
        return;
    }

    if (userProfile?.role === 'shop_admin' && userProfile.shopId) {
        setAuthStatus('authorized');
    } else {
        setAuthStatus('unauthorized');
    }
  }, [user, isUserLoading, userProfile, isProfileLoading, router]);

  if (authStatus === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-3 text-muted-foreground">Vérification des autorisations de la boutique...</p>
      </div>
    );
  }
  
  if (authStatus === 'unauthorized') {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-background p-4">
           <Alert variant="destructive" className="max-w-md">
              <ShieldAlert className="h-4 w-4" />
              <AlertTitle>Accès non autorisé</AlertTitle>
              <AlertDescription>
                Vous n'êtes pas administrateur de boutique ou votre boutique n'est pas configurée.
                <div className="mt-4">
                    <Button variant="outline" onClick={() => router.replace('/')}>
                        Retour à l'accueil
                    </Button>
                </div>
              </AlertDescription>
            </Alert>
        </div>
    );
  }

  // User is authorized, provide the shop context
  return (
    <ShopProvider user={user} userProfile={userProfile}>
      {children}
    </ShopProvider>
  );
}
