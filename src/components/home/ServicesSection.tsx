'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight, Star } from 'lucide-react';
import Icon from '@/components/Icon';
import type { icons } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import type { Service } from '@/app/admin/(admin_panel)/services/columns';
import { BookingTrigger } from '@/components/booking/BookingTrigger';
import { useTranslation } from '@/hooks/use-translation';


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

const ServiceCard = ({ service }: { service: Service }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseEnter = () => {
        setIsHovered(true);
        if (videoRef.current) {
            videoRef.current.play().catch(error => console.error("Video play failed:", error));
        }
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
        }
    };

    const hasVideo = !!service.videoUrl;

    return (
        <Card 
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="flex flex-col overflow-hidden group transition-all hover:shadow-xl hover:-translate-y-1"
        >
            <div className="relative h-48 w-full">
                {service.imageUrl && (
                    <Image
                        src={service.imageUrl}
                        alt={service.name}
                        fill
                        className={cn(
                            "object-cover transition-opacity duration-300",
                            hasVideo && isHovered && "opacity-0"
                        )}
                    />
                )}
                {hasVideo && (
                    <video
                        ref={videoRef}
                        src={service.videoUrl}
                        loop
                        muted
                        playsInline
                        className={cn(
                            "absolute inset-0 h-full w-full object-cover transition-opacity duration-300",
                            isHovered ? "opacity-100" : "opacity-0"
                        )}
                    />
                )}
            </div>
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
                    <Button variant="ghost" size="sm">Choisir <ArrowRight className="ml-2 h-4 w-4" /></Button>
                </BookingTrigger>
            </CardFooter>
        </Card>
    );
};

export function ServicesSection() {
    const { t } = useTranslation();
    const firestore = useFirestore();
    const servicesQuery = useMemoFirebase(() => firestore && query(collection(firestore, 'services'), orderBy('name', 'asc')), [firestore]);
    const { data: services, isLoading: servicesLoading } = useCollection<Service>(servicesQuery);

    return (
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
                        <ServiceCard key={service.id} service={service} />
                    ))}
                    </div>
                )}
            </div>
        </section>
    );
}
