'use client';

import Link from 'next/link';
import { Button } from './ui/button';
import { BookingTrigger } from './booking/BookingTrigger';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useTranslation } from '@/hooks/use-translation';
import { useUser } from '@/firebase/provider';
import { UserNav } from './UserNav';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import { Menu, X, LayoutGrid } from 'lucide-react';
import { Separator } from './ui/separator';
import { useState, useEffect } from 'react';
import { Skeleton } from './ui/skeleton';

export function Header() {
  const { t } = useTranslation();
  const { user, isUserLoading } = useUser();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

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
                  <Skeleton className="h-10 w-36 rounded-full" />
              </div>
            ) : user ? (
              <>
                <UserNav user={user} />
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
                  <div className="flex items-center justify-between mb-6">
                    <Link
                      href="/"
                      className="text-2xl font-bold text-primary font-headline"
                    >
                      Inoublevents
                    </Link>
                    <SheetClose asChild>
                      <Button variant="ghost" size="icon">
                        <X className="h-6 w-6" />
                        <span className="sr-only">Fermer</span>
                      </Button>
                    </SheetClose>
                  </div>

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
                          <Button asChild variant="outline">
                            <Link href="/profil">Mon Profil</Link>
                          </Button>
                        </SheetClose>
                        <SheetClose asChild>
                          <Button asChild>
                            <Link href="/mes-reservations">Mes Réservations</Link>
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
                            <Button className="w-full">{t('header.book')}</Button>
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
