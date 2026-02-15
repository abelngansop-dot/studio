'use client';

import { useShop } from '@/hooks/use-shop-admin';
import { usePathname } from 'next/navigation';
import { SidebarProvider, Sidebar, SidebarTrigger, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter, SidebarInset, SidebarSeparator } from '@/components/ui/sidebar';
import { Home, Package, ShoppingCart, Image as ImageIcon, Settings, LogOut, Loader2, Undo2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/firebase/provider';
import { signOut } from 'firebase/auth';
import { Badge } from '@/components/ui/badge';

export default function ShopAdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { shop, isLoading } = useShop();
  const auth = useAuth();
  const pathname = usePathname();

  const handleLogout = async () => {
    if (auth) {
        await signOut(auth);
        // Redirect is handled by the root shop layout
    }
  };

  const isActive = (path: string) => pathname === path;

  if (isLoading || !shop) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-3 text-muted-foreground">Chargement de votre boutique...</p>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar>
          <SidebarContent>
            <SidebarHeader className="flex flex-col items-start p-4">
                <div className='w-full flex justify-between items-center'>
                    <Link href="/dashboard" className="text-xl font-bold text-primary font-headline">
                        {shop.name}
                    </Link>
                    <SidebarTrigger className="md:hidden" />
                </div>
                <div className='flex items-center gap-2 mt-2'>
                    <Badge variant={shop.status === 'active' ? 'default' : 'destructive'} className='capitalize'>{shop.status}</Badge>
                    <Badge variant="secondary" className='capitalize'>{shop.subscriptionPlan}</Badge>
                </div>
            </SidebarHeader>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/">
                    <Undo2 />
                    Retour au site
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarSeparator />
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive('/dashboard')}>
                  <Link href="/dashboard">
                    <Home />
                    Tableau de bord
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.startsWith('/dashboard/bookings')}>
                   <Link href="/dashboard/bookings">
                    <ShoppingCart />
                    Réservations
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.startsWith('/dashboard/services')}>
                   <Link href="/dashboard/services">
                    <Package />
                    Services
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.startsWith('/dashboard/gallery')}>
                   <Link href="/dashboard/gallery">
                    <ImageIcon />
                    Galerie
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
               <SidebarMenuItem>
                 <SidebarMenuButton asChild isActive={isActive('/dashboard/settings')}>
                   <Link href="/dashboard/settings">
                    <Settings />
                    Paramètres
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <Button variant="ghost" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4"/>
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
