'use client';

import { useUser, useUserProfile } from '@/firebase/provider';
import { useRouter } from 'next/navigation';
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
  const { user } = useUser();
  const { userProfile, isProfileLoading } = useUserProfile();
  const router = useRouter();

  if (isProfileLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-3 text-muted-foreground">Vérification des autorisations de la boutique...</p>
      </div>
    );
  }
  
  if (!user || userProfile?.role !== 'shop_admin' || !userProfile.shopId) {
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
