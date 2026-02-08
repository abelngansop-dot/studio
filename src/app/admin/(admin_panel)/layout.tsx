'use client';

import { useUser, useDoc, useMemoFirebase, useFirestore } from '@/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { doc } from 'firebase/firestore';
import { SidebarProvider, Sidebar, SidebarTrigger, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter, SidebarInset } from '@/components/ui/sidebar';
import { Home, Package, ShoppingCart, Users, LineChart, Loader2, ShieldAlert, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { signOut } from 'firebase/auth';
import { useAuth } from '@/firebase';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


type UserProfile = {
  role: 'client' | 'admin' | 'superadmin';
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userDocRef);

  useEffect(() => {
    if (isUserLoading || isProfileLoading) {
      return; // Wait for all data to load
    }

    if (!user) {
        router.replace('/admin'); // Not logged in, go to login page
        return;
    }

    if (user && userProfile) {
        const allowedRoles = ['admin', 'superadmin'];
        if (allowedRoles.includes(userProfile.role)) {
            setIsAuthorized(true);
        } else {
            setIsAuthorized(false);
        }
    } else if (user && !userProfile) {
        // User exists but has no profile document, definitely not an admin.
        setIsAuthorized(false);
    }
  }, [user, isUserLoading, userProfile, isProfileLoading, router]);

  const handleLogout = async () => {
    if (auth) {
        await signOut(auth);
    }
    // After logout, always redirect to the admin login page.
    router.push('/admin');
  };

  const isActive = (path: string) => pathname.startsWith(path);

  // Show a full-screen loader while checking auth state or profile.
  if (isUserLoading || isProfileLoading || isAuthorized === null) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-3 text-muted-foreground">Vérification des autorisations...</p>
      </div>
    );
  }
  
  if (isAuthorized === false) {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-background p-4">
           <Alert variant="destructive" className="max-w-md">
              <ShieldAlert className="h-4 w-4" />
              <AlertTitle>Accès non autorisé</AlertTitle>
              <AlertDescription>
                Vous n'avez pas les permissions requises pour voir cette page. Si vous pensez qu'il s'agit d'une erreur, veuillez contacter l'administrateur du site.
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

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar>
          <SidebarContent>
            <SidebarHeader className="flex items-center justify-between">
              <Link href="/admin/dashboard" className="text-xl font-bold text-primary font-headline">
                Admin
              </Link>
              <SidebarTrigger className="md:hidden" />
            </SidebarHeader>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive('/admin/dashboard')}>
                  <Link href="/admin/dashboard">
                    <Home />
                    Tableau de bord
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive('/admin/bookings')}>
                   <Link href="/admin/bookings">
                    <ShoppingCart />
                    Réservations
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
               <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive('/admin/reviews')}>
                   <Link href="/admin/reviews">
                    <MessageSquare />
                    Avis
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive('/admin/services')}>
                   <Link href="/admin/services">
                    <Package />
                    Services
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                 <SidebarMenuButton asChild isActive={isActive('/admin/users')}>
                   <Link href="/admin/users">
                    <Users />
                    Utilisateurs
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                 <SidebarMenuButton asChild isActive={isActive('/admin/analytics')}>
                   <Link href="/admin/analytics">
                    <LineChart />
                    Statistiques
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <Button variant="ghost" onClick={handleLogout}>
              Déconnexion
            </Button>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
            <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                <SidebarTrigger className="hidden md:flex" />
            </header>
            <main className="flex-1 p-4 sm:px-6 sm:py-0">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
