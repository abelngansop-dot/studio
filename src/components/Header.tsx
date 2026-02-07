'use client';

import Link from 'next/link';
import { Button } from './ui/button';
import { BookingTrigger } from './booking/BookingTrigger';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useTranslation } from '@/hooks/use-translation';

export function Header() {
  const { t } = useTranslation();

  return (
    <header className="bg-background/80 backdrop-blur-sm sticky top-0 z-50 border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link
          href="/"
          className="text-2xl font-bold text-primary font-headline transition-transform transform hover:scale-105"
        >
          Inoubliable
        </Link>
        <div className="flex items-center gap-1">
          <nav className="hidden md:flex gap-1">
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
          <BookingTrigger>
            <Button className="rounded-full shadow-lg">{t('header.book')}</Button>
          </BookingTrigger>
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
