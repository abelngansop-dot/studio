'use client';

import { useUser, useDoc, useMemoFirebase, useFirestore } from '@/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { doc } from 'firebase/firestore';
import { SidebarProvider, Sidebar, SidebarTrigger, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter, SidebarInset } from '@/components/ui/sidebar';
import { Home, Package, ShoppingCart, Users, LineChart, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { signOut } from 'firebase/auth';
import { useAuth } from '@/firebase';

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

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userDocRef);

  useEffect(() => {
    // If auth state is resolved and there's no user, redirect to login.
    if (!isUserLoading && !user) {
      router.replace('/admin');
      return;
    }
    
    // If we have a user but their profile is still loading, we wait.
    if (user && !isProfileLoading && userProfile) {
      const allowedRoles = ['admin', 'superadmin'];
      // If the profile is loaded and the role is not sufficient, redirect to home.
      if (!allowedRoles.includes(userProfile.role)) {
        router.replace('/');
      }
    } else if (user && !isProfileLoading && !userProfile) {
      // If the user exists but has no profile document, they are not an admin.
      router.replace('/');
    }

  }, [user, isUserLoading, userProfile, isProfileLoading, router]);

  const handleLogout = async () => {
    if (auth) {
        await signOut(auth);
    }
    // After logout, always redirect to the admin login page.
    router.push('/admin');
  };

  const isActive = (path: string) => pathname === path;

  // Show a full-screen loader while checking auth state or profile.
  if (isUserLoading || isProfileLoading || !user || !userProfile) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-3 text-muted-foreground">Vérification des autorisations...</p>
      </div>
    );
  }
  
  // Final check before rendering children, if role is insufficient, render nothing to avoid flicker.
  const allowedRoles = ['admin', 'superadmin'];
  if (!allowedRoles.includes(userProfile.role)) {
    return null; 
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
