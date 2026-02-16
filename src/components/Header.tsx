'use client';

import Link from 'next/link';
import { Button } from './ui/button';
import { BookingTrigger } from './booking/BookingTrigger';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useTranslation } from '@/hooks/use-translation';
import { useUser, useFirestore, useMemoFirebase, useAuth } from '@/firebase/provider';
import { useDoc } from '@/firebase/firestore/use-doc';
import { doc, signOut } from 'firebase/firestore';
import { UserNav } from './UserNav';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetHeader,
  SheetTitle,
  SheetFooter
} from '@/components/ui/sheet';
import { Menu, Home, FileText, LogOut, LayoutGrid, Settings, Shield, User as UserIcon, LogIn } from 'lucide-react';
import { Separator } from './ui/separator';
import { useState, useEffect } from 'react';
import { Skeleton } from './ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Store } from 'lucide-react';

type UserProfile = {
  role: 'client' | 'shop_admin' | 'admin' | 'superadmin';
  shopId?: string;
};

export function Header() {
  const { t } = useTranslation();
  const { user, isUserLoading: isAuthLoading } = useUser();
  const firestore = useFirestore();
  const auth = useAuth();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile, isLoading: isProfileLoading } =
    useDoc<UserProfile>(userDocRef);

  const isUserLoading = isAuthLoading || isProfileLoading;
  
  const handleLogout = async () => {
    if (auth) {
      await (signOut as any)(auth);
    }
  };

  const userInitial = user?.displayName?.charAt(0) || user?.email?.charAt(0) || '?';

  return (
    <header className="bg-background/80 backdrop-blur-sm sticky top-0 z-50 border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-primary transition-transform transform hover:scale-105"
        >
          <Home className="h-7 w-7" />
          <span className="text-xl sm:text-2xl font-bold font-headline">Inoublevents</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1">
          <Button variant="ghost" asChild>
            <Link href="/#services">{t('header.services')}</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/#reviews">{t('header.reviews')}</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/#contact">{t('header.contact')}</Link>
          </Button>
        </nav>

        <div className="flex items-center gap-2">
          {/* Auth/Booking Buttons for larger screens */}
          <div className="hidden sm:flex items-center gap-2">
            {isUserLoading ? (
              <div className="flex items-center gap-2 h-10">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-10 w-24 rounded-md" />
              </div>
            ) : user ? (
              <UserNav user={user} />
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/login">Se connecter</Link>
                </Button>
                <BookingTrigger>
                  <Button className="rounded-full shadow-lg">
                    {t('header.book')}
                  </Button>
                </BookingTrigger>
              </>
            )}
          </div>

          <LanguageSwitcher />

          {/* Mobile Menu */}
          <div className="lg:hidden">
            {hasMounted ? (
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Ouvrir le menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="flex w-full max-w-sm flex-col p-0">
                   <SheetHeader className="p-4 border-b">
                     <SheetTitle className="sr-only">Menu principal</SheetTitle>
                     <SheetClose asChild>
                        <Link href="/" className="flex items-center gap-2 text-primary">
                            <Home className="h-6 w-6" />
                            <span className="font-bold font-headline text-lg">Inoublevents</span>
                        </Link>
                     </SheetClose>
                  </SheetHeader>

                  <div className="flex-1 overflow-y-auto">
                    {isUserLoading ? (
                        <div className="p-4 space-y-4">
                            <div className="flex items-center gap-3">
                                <Skeleton className="h-12 w-12 rounded-full" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-3 w-32" />
                                </div>
                            </div>
                            <Separator/>
                            <Skeleton className="h-8 w-full"/>
                            <Skeleton className="h-8 w-full"/>
                        </div>
                    ) : user && userProfile ? (
                        <div className="p-4">
                            <div className="flex items-center gap-3 mb-4">
                                <Avatar className="h-12 w-12">
                                    <AvatarImage src={user.photoURL ?? undefined} alt={user.displayName ?? ''} />
                                    <AvatarFallback>{userInitial}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold">{user.displayName}</p>
                                    <p className="text-sm text-muted-foreground">{user.email}</p>
                                </div>
                            </div>
                            <Separator />
                            <nav className="mt-4 flex flex-col gap-1">
                               {userProfile.role === 'shop_admin' && (
                                <SheetClose asChild>
                                    <Button variant="ghost" asChild className="justify-start text-base">
                                        <Link href="/dashboard"><Store className="mr-2 h-5 w-5"/>Tableau de bord</Link>
                                    </Button>
                                </SheetClose>
                               )}
                                {(userProfile.role === 'admin' || userProfile.role === 'superadmin') && (
                                    <SheetClose asChild>
                                        <Button variant="ghost" asChild className="justify-start text-base">
                                            <Link href="/admin/dashboard"><Shield className="mr-2 h-5 w-5"/>Super Admin</Link>
                                        </Button>
                                    </SheetClose>
                                )}
                                 <SheetClose asChild>
                                    <Button variant="ghost" asChild className="justify-start text-base">
                                        <Link href="/mes-reservations"><LayoutGrid className="mr-2 h-5 w-5"/>Mes réservations</Link>
                                    </Button>
                                </SheetClose>
                                <SheetClose asChild>
                                    <Button variant="ghost" asChild className="justify-start text-base">
                                        <Link href="/profil"><Settings className="mr-2 h-5 w-5"/>Paramètres</Link>
                                    </Button>
                                </SheetClose>
                                <SheetClose asChild>
                                    <Button variant="ghost" asChild className="justify-start text-base">
                                        <Link href="/legal"><FileText className="mr-2 h-5 w-5"/>Légal</Link>
                                    </Button>
                                </SheetClose>
                            </nav>
                        </div>
                    ) : (
                         <nav className="flex flex-col gap-1 p-4">
                            <SheetClose asChild>
                            <Button variant="ghost" asChild className="justify-start text-base">
                                <Link href="/#services">
                                <Home className="mr-2" />
                                Services
                                </Link>
                            </Button>
                            </SheetClose>
                            <SheetClose asChild>
                            <Button variant="ghost" asChild className="justify-start text-base">
                                <Link href="/legal">
                                <FileText className="mr-2" />
                                Légal
                                </Link>
                            </Button>
                            </SheetClose>
                        </nav>
                    )}
                  </div>
                  
                  <SheetFooter className="p-4 border-t mt-auto">
                    {isUserLoading ? (
                        <Skeleton className="h-10 w-full" />
                    ) : user ? (
                        <SheetClose asChild>
                             <Button variant="outline" onClick={handleLogout} className="w-full">
                                <LogOut className="mr-2 h-5 w-5" />
                                Déconnexion
                            </Button>
                        </SheetClose>
                    ) : (
                        <SheetClose asChild>
                            <Button asChild className="w-full">
                                <Link href="/login"><LogIn className="mr-2 h-5 w-5"/>Se connecter / S'inscrire</Link>
                            </Button>
                        </SheetClose>
                    )}
                  </SheetFooter>
                </SheetContent>
              </Sheet>
            ) : (
              <Button variant="ghost" size="icon" disabled>
                <Menu className="h-6 w-6" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
