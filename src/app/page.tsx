'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ArrowRight, Star, Loader2, Edit, Heart } from 'lucide-react';
import Icon from '@/components/Icon';
import type { icons } from 'lucide-react';
import { BookingTrigger } from '@/components/booking/BookingTrigger';
import { Header } from '@/components/Header';
import { useTranslation } from '@/hooks/use-translation';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { ContactFooter } from '@/components/ContactFooter';
import { LeaveReviewTrigger } from '@/components/reviews/LeaveReviewTrigger';
import { PublishedReviews } from '@/components/reviews/PublishedReviews';
import { SelectableCard } from '@/components/booking/SelectableCard';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { collection, query, orderBy } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import type { Service } from './admin/(admin_panel)/services/columns';

const StarRating = ({ rating, className }: { rating: number, className?: string }) => {
  const roundedRating = Math.round(rating);
  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={cn(
            "h-5 w-5",
            i < roundedRating
              ? "text-primary fill-primary"
              : "text-muted-foreground/30"
          )}
        />
      ))}
    </div>
  );
};

const ServiceSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {Array.from({length: 8}).map((_, i) => (
      <Card key={i}>
        <Skeleton className="h-48 w-full" />
        <CardHeader>
          <div className="flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <Skeleton className="h-6 w-32" />
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6 mt-2" />
        </CardContent>
        <CardFooter className="bg-secondary/30 py-3 px-4">
          <Skeleton className="h-6 w-24" />
        </CardFooter>
      </Card>
    ))}
  </div>
);

const galleryImages = [
  'gallery-1',
  'gallery-2',
  'gallery-3',
  'gallery-4',
  'gallery-5',
  'gallery-6',
];

export default function Home() {
  const { t } = useTranslation();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const servicesQuery = useMemoFirebase(() => firestore && query(collection(firestore, 'services'), orderBy('name', 'asc')), [firestore]);
  const { data: services, isLoading: servicesLoading } = useCollection<Service>(servicesQuery);

  const heroImage = PlaceHolderImages.find((p) => p.id === 'hero-background');
  const ctaButtonClass = "bg-accent text-accent-foreground hover:bg-accent/90 text-lg px-8 py-6 rounded-full font-bold shadow-lg transition-transform transform hover:scale-105";
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  const handleImageSelect = (imageId: string) => {
    setSelectedImages((prev) =>
      prev.includes(imageId)
        ? prev.filter((id) => id !== imageId)
        : [...prev, imageId]
    );
  };


  return (
    <div className="bg-background">
      <Header />
      <main>
      <section className="relative w-full h-[calc(100vh-4rem)] flex items-center justify-center">
        {heroImage && (
          <Image
            src={heroImage.imageUrl}
            alt={heroImage.description}
            fill
            className="object-cover"
            priority
            data-ai-hint={heroImage.imageHint}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />

        <div className="relative container px-4 md:px-6 z-10">
          <div className="flex flex-col items-center text-center">
            <Card className="bg-background/80 backdrop-blur-sm max-w-3xl">
              <CardContent className="p-8 md:p-12">
                <h1 className="text-4xl font-headline font-bold tracking-tighter text-primary sm:text-5xl lg:text-6xl/none">
                  {t('hero.title')}
                </h1>
                <p className="mt-4 max-w-xl mx-auto text-foreground/80 md:text-xl">
                  {t('hero.subtitle')}
                </p>
                <div className="mt-8">
                  {isUserLoading ? (
                     <Button size="lg" className={ctaButtonClass} disabled>
                        <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                        Chargement...
                      </Button>
                  ) : (
                    <BookingTrigger>
                      <Button
                        size="lg"
                        className={ctaButtonClass}
                      >
                        {t('hero.cta')}
                      </Button>
                    </BookingTrigger>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section id="services" className="py-16 md:py-24 bg-background">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center text-center mb-12">
            <h2 className="text-3xl font-bold font-headline tracking-tighter sm:text-4xl">{t('services.title')}</h2>
            <p className="mt-3 max-w-2xl text-muted-foreground md:text-xl">
              {t('services.subtitle')}
            </p>
          </div>
          {servicesLoading ? (
            <ServiceSkeleton />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {services?.map((service) => (
                  <Card key={service.id} className="flex flex-col overflow-hidden group transition-all hover:shadow-xl hover:-translate-y-1">
                    {service.imageUrl && (
                      <div className="relative h-48 w-full">
                        <Image
                            src={service.imageUrl}
                            alt={service.name}
                            fill
                            className="object-cover"
                        />
                      </div>
                    )}
                    <BookingTrigger initialServiceId={service.id}>
                      <CardHeader className="cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className="p-3 bg-accent/10 rounded-full">
                            <Icon name={service.icon as keyof typeof icons} className="h-6 w-6 text-accent" />
                          </div>
                          <CardTitle className="text-xl font-headline">{service.name}</CardTitle>
                        </div>
                      </CardHeader>
                    </BookingTrigger>
                    <CardContent className="flex-grow">
                      <p className="text-muted-foreground text-sm">{service.description}</p>
                    </CardContent>
                    <CardFooter className="flex justify-between items-center bg-secondary/30 py-3 px-4">
                      <StarRating rating={service.rating} />
                      <BookingTrigger initialServiceId={service.id}>
                          <Button variant="ghost" size="sm">{t('header.choose')} <ArrowRight className="ml-2 h-4 w-4" /></Button>
                      </BookingTrigger>
                    </CardFooter>
                  </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      <section id="gallery" className="py-16 md:py-24 bg-secondary/50">
        <div className="container px-4 md:px-6">
           <div className="flex flex-col items-center text-center mb-12">
            <h2 className="text-3xl font-bold font-headline tracking-tighter sm:text-4xl">{t('gallery.title')}</h2>
            <p className="mt-3 max-w-2xl text-muted-foreground md:text-xl">
              {t('gallery.subtitle')}
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4">
            {galleryImages.map((id, index) => {
              const image = PlaceHolderImages.find((p) => p.id === id);
              if (!image) return null;
              return (
                <SelectableCard
                  key={id}
                  isSelected={selectedImages.includes(id)}
                  onSelect={() => handleImageSelect(id)}
                  className={cn(
                    'aspect-square',
                    index === 0 && 'md:col-span-2 md:row-span-2 md:aspect-auto'
                  )}
                >
                  <Image
                    src={image.imageUrl}
                    alt={image.description}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 33vw"
                    data-ai-hint={image.imageHint}
                  />
                </SelectableCard>
              );
            })}
          </div>
          <div className="text-center mt-12">
              <Button size="lg" disabled={selectedImages.length === 0}>
                  <Heart className="mr-2 h-5 w-5" />
                  Ajouter {selectedImages.length > 0 ? `(${selectedImages.length})` : ''} aux favoris
              </Button>
              {selectedImages.length === 0 && (
                <p className="text-sm text-muted-foreground mt-2">
                  Cliquez sur les images pour les sélectionner.
                </p>
              )}
          </div>
        </div>
      </section>

      <section id="reviews" className="py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center text-center mb-12">
            <h2 className="text-3xl font-bold font-headline tracking-tighter sm:text-4xl">{t('reviews_section.title')}</h2>
            <p className="mt-3 max-w-2xl text-muted-foreground md:text-xl">
              {t('reviews_section.subtitle')}
            </p>
          </div>
          <PublishedReviews />
           <div className="text-center mt-12">
                <LeaveReviewTrigger>
                    <Button variant="outline" size="lg">
                        <Edit className="mr-2 h-4 w-4" />
                        Laisser un avis
                    </Button>
                </LeaveReviewTrigger>
            </div>
        </div>
      </section>
      
      <ContactFooter />
      </main>
    </div>
  );
}
