'use client';

import { useUser, useUserProfile, useAuth } from '@/firebase/provider';
import { useRouter, usePathname } from 'next/navigation';
import { SidebarProvider, Sidebar, SidebarTrigger, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter, SidebarInset } from '@/components/ui/sidebar';
import { Home, Package, ShoppingCart, Users, LineChart, Loader2, ShieldAlert, MessageSquare, Image as ImageIcon, Store } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { signOut } from 'firebase/auth';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Logo } from '@/components/Logo';


export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useUser();
  const { userProfile, isProfileLoading } = useUserProfile();
  const router = useRouter();
  const auth = useAuth();
  const pathname = usePathname();

  const handleLogout = async () => {
    if (auth) {
        await signOut(auth);
    }
    router.push('/admin');
  };

  const isActive = (path: string) => pathname.startsWith(path);

  if (isProfileLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-3 text-muted-foreground">Vérification des autorisations...</p>
      </div>
    );
  }
  
  const isAuthorized = user && userProfile && ['admin', 'superadmin'].includes(userProfile.role);

  if (!isAuthorized) {
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
            <SidebarHeader className="flex items-center justify-between p-4">
              <Link href="/admin/dashboard" className="flex items-center gap-3 text-xl font-bold text-primary font-headline">
                <Logo className="h-8 w-8" />
                <span>Super Admin</span>
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
                <SidebarMenuButton asChild isActive={isActive('/admin/shops')}>
                   <Link href="/admin/shops">
                    <Store />
                    Boutiques
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
                    Catalogue Global
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive('/admin/gallery')}>
                   <Link href="/admin/gallery">
                    <ImageIcon />
                    Galerie Globale
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
              <LogOut className="mr-2 h-4 w-4" />
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
