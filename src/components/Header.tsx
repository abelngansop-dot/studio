'use client';

import Link from 'next/link';
import { Button } from './ui/button';
import { BookingTrigger } from './booking/BookingTrigger';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useTranslation } from '@/hooks/use-translation';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase/provider';
import { useDoc } from '@/firebase/firestore/use-doc';
import { doc } from 'firebase/firestore';
import { UserNav } from './UserNav';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Menu, X, LayoutGrid, Store, UserCheck } from 'lucide-react';
import { Separator } from './ui/separator';
import { useState, useEffect } from 'react';
import { Skeleton } from './ui/skeleton';

type UserProfile = {
  role: 'client' | 'shop_admin' | 'admin' | 'superadmin';
  shopId?: string;
};

export function Header() {
  const { t } = useTranslation();
  const { user, isUserLoading: isAuthLoading } = useUser();
  const firestore = useFirestore();
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

  const VendorButton = () => {
    if (!user || !userProfile) return null;

    if (userProfile.role === 'client') {
      return (
        <Button variant="outline" asChild>
          <Link href="/creer-boutique">
            <Store className="mr-2 h-4 w-4" />
            Proposer un service
          </Link>
        </Button>
      );
    }
    if (userProfile.role === 'shop_admin') {
      return (
        <Button variant="outline" asChild>
          <Link href="/dashboard">Mon tableau de bord</Link>
        </Button>
      );
    }
    return null;
  };

  const VendorButtonMobile = () => {
    if (!user || !userProfile) return null;

    if (userProfile.role === 'client') {
      return (
        <SheetClose asChild>
          <Button
            asChild
            variant="secondary"
            className="w-full justify-start"
          >
            <Link href="/creer-boutique">
              <Store className="mr-2 h-4 w-4" />
              Proposer un service
            </Link>
          </Button>
        </SheetClose>
      );
    }
    if (userProfile.role === 'shop_admin') {
      return (
        <SheetClose asChild>
          <Button
            asChild
            variant="secondary"
            className="w-full justify-start"
          >
            <Link href="/dashboard">
              <Store className="mr-2 h-4 w-4" />
              Tableau de bord
            </Link>
          </Button>
        </SheetClose>
      );
    }
    return null;
  };

  return (
    <header className="bg-background/80 backdrop-blur-sm sticky top-0 z-50 border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link
          href="/"
          className="text-2xl font-bold text-primary font-headline transition-transform transform hover:scale-105"
        >
          Inoublevents
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
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
              // Placeholder to avoid layout shift and hydration errors
              <div className="flex items-center gap-2 h-10">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-10 w-40 rounded-md" />
                <Skeleton className="h-10 w-44 rounded-full" />
              </div>
            ) : user ? (
              <>
                <UserNav user={user} />
                <VendorButton />
                <Button asChild className="rounded-full shadow-lg">
                  <Link href="/mes-reservations">
                    <LayoutGrid className="mr-2 h-4 w-4" />
                    Mes réservations
                  </Link>
                </Button>
              </>
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
          <div className="md:hidden">
            {hasMounted ? (
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Ouvrir le menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-full max-w-xs p-6">
                  <SheetHeader className="flex flex-row items-center justify-between mb-6 text-left space-y-0">
                    <Link
                      href="/"
                      className="text-2xl font-bold text-primary font-headline"
                    >
                      Inoublevents
                    </Link>
                    <SheetTitle className="sr-only">Menu principal</SheetTitle>
                    <SheetClose asChild>
                      <Button variant="ghost" size="icon">
                        <X className="h-6 w-6" />
                        <span className="sr-only">Fermer</span>
                      </Button>
                    </SheetClose>
                  </SheetHeader>

                  <nav className="flex flex-col gap-5">
                    <SheetClose asChild>
                      <Link
                        href="/#services"
                        className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                      >
                        {t('header.services')}
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link
                        href="/#reviews"
                        className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                      >
                        {t('header.reviews')}
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link
                        href="/#contact"
                        className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                      >
                        {t('header.contact')}
                      </Link>
                    </SheetClose>
                  </nav>

                  <Separator className="my-6" />

                  <div className="flex flex-col gap-4 sm:hidden">
                    {isUserLoading ? (
                      <div className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    ) : user ? (
                      <>
                        <SheetClose asChild>
                          <Button
                            asChild
                            variant="secondary"
                            className="w-full justify-start"
                          >
                            <Link href="/profil">
                              <UserCheck className="mr-2 h-4 w-4" />
                              Mon Profil
                            </Link>
                          </Button>
                        </SheetClose>
                        <VendorButtonMobile />
                        <SheetClose asChild>
                          <Button asChild className="w-full justify-start">
                            <Link href="/mes-reservations">
                              <LayoutGrid className="mr-2 h-4 w-4" />
                              Mes Réservations
                            </Link>
                          </Button>
                        </SheetClose>
                      </>
                    ) : (
                      <>
                        <SheetClose asChild>
                          <Button variant="outline" asChild>
                            <Link href="/login">Se connecter</Link>
                          </Button>
                        </SheetClose>
                        <BookingTrigger>
                          <SheetClose asChild>
                            <Button className="w-full">
                              {t('header.book')}
                            </Button>
                          </SheetClose>
                        </BookingTrigger>
                      </>
                    )}
                  </div>
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
