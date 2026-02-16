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
import { Menu, X, Home, FileText } from 'lucide-react';
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
              <div className="flex items-center gap-2 h-10">
                <Skeleton className="h-10 w-10 rounded-full" />
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
          <div className="md:hidden">
            {hasMounted ? (
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Ouvrir le menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-full max-w-xs p-0">
                   <SheetHeader className="flex flex-row items-center justify-between p-4 border-b">
                     <Link href="/" className="flex items-center gap-2 text-primary">
                        <Home className="h-6 w-6" />
                        <span className="font-bold font-headline text-lg">Inoublevents</span>
                    </Link>
                    <SheetTitle className="sr-only">Menu principal</SheetTitle>
                    <SheetClose asChild>
                      <Button variant="ghost" size="icon">
                        <X className="h-6 w-6" />
                        <span className="sr-only">Fermer</span>
                      </Button>
                    </SheetClose>
                  </SheetHeader>

                  <nav className="flex flex-col gap-1 p-4">
                    <SheetClose asChild>
                      <Button variant="ghost" asChild className="justify-start text-base">
                        <Link href="/">
                          <Home className="mr-2" />
                          Accueil
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

                  <Separator />

                  <div className="p-4">
                    {isUserLoading ? (
                        <Skeleton className="h-10 w-full" />
                    ) : !user && (
                      <SheetClose asChild>
                        <Button asChild className="w-full">
                          <Link href="/login">Se connecter / S'inscrire</Link>
                        </Button>
                      </SheetClose>
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
