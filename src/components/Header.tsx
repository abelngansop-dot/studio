import Link from 'next/link';
import { Button } from './ui/button';
import { BookingTrigger } from './booking/BookingTrigger';

export function Header() {
  return (
    <header className="bg-background/80 backdrop-blur-sm sticky top-0 z-50 border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link
          href="/"
          className="text-2xl font-bold text-primary font-headline transition-transform transform hover:scale-105"
        >
          Inoubliable
        </Link>
        <nav className="hidden md:flex gap-4">
          <Button variant="ghost" asChild>
            <Link href="/#services">Services</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/#reviews">Avis</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/#contact">Contact</Link>
          </Button>
        </nav>
        <BookingTrigger>
          <Button className="rounded-full shadow-lg">Réserver</Button>
        </BookingTrigger>
      </div>
    </header>
  );
}
