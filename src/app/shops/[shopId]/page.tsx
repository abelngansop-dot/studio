'use client';

import { useDoc } from '@/firebase/firestore/use-doc';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useFirestore, useMemoFirebase } from '@/firebase/provider';
import { doc, collection, query, orderBy } from 'firebase/firestore';
import { useParams } from 'next/navigation';
import { Header } from '@/components/Header';
import { ContactFooter } from '@/components/ContactFooter';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { ArrowRight, Star, AlertCircle, Store, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';
import Icon from '@/components/Icon';
import { BookingTrigger } from '@/components/booking/BookingTrigger';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

import type { Shop } from '@/app/admin/(admin_panel)/shops/columns';
import type { Service } from '@/app/admin/(admin_panel)/services/columns';
import type { icons } from 'lucide-react';

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

const ServiceCard = ({ service }: { service: Service }) => (
    <Card className="flex flex-col overflow-hidden group transition-all hover:shadow-lg">
        <div className="relative h-40 w-full bg-muted">
            {service.videoUrl ? (
                 <video
                    src={service.videoUrl}
                    muted
                    autoPlay
                    loop
                    playsInline
                    className="object-cover w-full h-full"
                />
            ) : service.imageUrl ? (
                <Image
                    src={service.imageUrl}
                    alt={service.name}
                    fill
                    className="object-cover"
                />
            ) : (
                <div className="flex items-center justify-center h-full">
                    <Icon name={service.icon as keyof typeof icons} className="h-16 w-16 text-muted-foreground/30" />
                </div>
            )}
        </div>
        <CardHeader>
            <div className="flex items-center gap-3">
                <div className="p-3 bg-accent/10 rounded-full">
                    <Icon name={service.icon as keyof typeof icons} className="h-6 w-6 text-accent" />
                </div>
                <CardTitle className="text-xl font-headline">{service.name}</CardTitle>
            </div>
        </CardHeader>
        <CardContent className="flex-grow">
            <p className="text-muted-foreground text-sm line-clamp-3">{service.description}</p>
        </CardContent>
        <CardFooter className="flex justify-between items-center bg-secondary/30 py-3 px-4">
            <StarRating rating={service.rating} />
            <BookingTrigger initialServiceId={service.id}>
                <Button variant="ghost" size="sm">Choisir <ArrowRight className="ml-2 h-4 w-4" /></Button>
            </BookingTrigger>
        </CardFooter>
    </Card>
);


function ShopPageSkeleton() {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow">
                <section className="relative w-full h-80 bg-muted">
                    <Skeleton className="h-full w-full" />
                </section>
                <div className="container -mt-20 pb-16">
                     <Card className="p-6 md:p-8 backdrop-blur-sm bg-background/80">
                        <Skeleton className="h-10 w-1/2 mb-2" />
                        <Skeleton className="h-6 w-1/4" />
                     </Card>
                     <div className="mt-12">
                        <Skeleton className="h-8 w-1/3 mb-8" />
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <Card key={i}>
                                    <Skeleton className="h-40 w-full" />
                                    <CardHeader><Skeleton className="h-7 w-3/4" /></CardHeader>
                                    <CardContent>
                                        <Skeleton className="h-4 w-full mb-2" />
                                        <Skeleton className="h-4 w-5/6" />
                                    </CardContent>
                                    <CardFooter className="bg-secondary/30 py-3 px-4">
                                        <Skeleton className="h-6 w-24" />
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                     </div>
                </div>
            </main>
            <ContactFooter />
        </div>
    )
}

function NotFound() {
     return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow flex items-center justify-center">
                 <Alert variant="destructive" className="max-w-lg">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Boutique introuvable</AlertTitle>
                    <AlertDescription>
                        La boutique que vous cherchez n'existe pas ou n'est plus disponible.
                    </AlertDescription>
                </Alert>
            </main>
            <ContactFooter />
        </div>
    );
}

export default function ShopPage() {
    const params = useParams();
    const shopId = params.shopId as string;
    const firestore = useFirestore();

    const shopDocRef = useMemoFirebase(() => {
        return firestore && shopId ? doc(firestore, 'shops', shopId) : null;
    }, [firestore, shopId]);

    const servicesQuery = useMemoFirebase(() => {
        return firestore && shopId ? query(collection(firestore, 'shops', shopId, 'services'), orderBy('name', 'asc')) : null;
    }, [firestore, shopId]);

    const { data: shop, isLoading: shopLoading } = useDoc<Shop>(shopDocRef);
    const { data: services, isLoading: servicesLoading } = useCollection<Service>(servicesQuery);

    if (shopLoading) {
        return <ShopPageSkeleton />;
    }

    if (!shop) {
        return <NotFound />;
    }
    
    return (
        <div className="flex flex-col min-h-screen bg-secondary/30">
            <Header />
            <main className="flex-grow">
                <section className="relative w-full h-80 bg-muted">
                    <Image
                        src={`https://picsum.photos/seed/${shop.id}/1200/400`}
                        alt={shop.name}
                        fill
                        className="object-cover"
                        priority
                        data-ai-hint="store background"
                    />
                    <div className="absolute inset-0 bg-black/40" />
                </section>
                <div className="container -mt-24 md:-mt-20 z-10 relative pb-16">
                     <Card className="p-6 md:p-8 backdrop-blur-sm bg-background/80 shadow-2xl">
                        <div className="flex flex-col md:flex-row gap-6 items-center">
                            {shop.imageUrl && (
                                <div className="relative w-24 h-24 lg:w-32 lg:h-32 rounded-lg overflow-hidden border-4 border-background shadow-lg shrink-0">
                                    <Image src={shop.imageUrl} alt={shop.name} fill className="object-cover" />
                                </div>
                            )}
                            <div className="flex-grow text-center md:text-left">
                                <h1 className="text-4xl lg:text-5xl font-bold font-headline text-primary">{shop.name}</h1>
                                <p className="text-muted-foreground mt-2">Votre partenaire pour un événement réussi.</p>
                                {shop.phone && (
                                    <div className="mt-4 flex items-center justify-center md:justify-start gap-4">
                                        <Button asChild>
                                            <a href={`tel:${shop.phone.replace(/\s/g, '')}`}>
                                                <Phone className="mr-2 h-4 w-4" />
                                                Appeler
                                            </a>
                                        </Button>
                                        <span className="text-muted-foreground font-semibold">{shop.phone}</span>
                                    </div>
                                )}
                            </div>
                            <div className="flex items-start gap-2 self-center md:self-start">
                                <Badge variant="default" className="capitalize text-base">{shop.status}</Badge>
                                <Badge variant="secondary" className="capitalize text-base">{shop.subscriptionPlan}</Badge>
                            </div>
                        </div>
                     </Card>
                     <div className="mt-12">
                        <h2 className="text-3xl font-bold font-headline mb-8">Nos Services</h2>
                        {servicesLoading ? (
                             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-80 w-full"/>)}
                             </div>
                        ) : services && services.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {services.map(service => (
                                    <ServiceCard key={service.id} service={service} />
                                ))}
                            </div>
                        ) : (
                             <Card className="text-center p-8">
                                <Store className="mx-auto h-12 w-12 text-muted-foreground" />
                                <CardTitle className="mt-4">Aucun service pour le moment</CardTitle>
                                <CardDescription className="mt-2">Cette boutique n'a pas encore ajouté de services.</CardDescription>
                            </Card>
                        )}
                     </div>
                </div>
            </main>
            <ContactFooter />
        </div>
    )
}
