import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { services } from '@/lib/data';
import { testimonials, type Testimonial } from '@/lib/testimonials';
import { cn } from '@/lib/utils';
import { ArrowRight, Star } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Icon from '@/components/Icon';
import type { icons } from 'lucide-react';
import { BookingTrigger } from '@/components/booking/BookingTrigger';
import { CurrentYear } from '@/components/CurrentYear';


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

const galleryImages = [
  'gallery-1',
  'gallery-2',
  'gallery-3',
  'gallery-4',
  'gallery-5',
  'gallery-6',
];

export default function Home() {
  const heroImage = PlaceHolderImages.find((p) => p.id === 'hero-background');

  return (
    <div className="bg-background">
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
                  Inoubliable
                </h1>
                <p className="mt-4 max-w-xl mx-auto text-foreground/80 md:text-xl">
                  Organisez votre événement en toute tranquillité, choisissez, on
                  vous rappelle.
                </p>
                <div className="mt-8">
                  <BookingTrigger>
                    <Button
                      size="lg"
                      className="bg-accent text-accent-foreground hover:bg-accent/90 text-lg px-8 py-6 rounded-full font-bold shadow-lg transition-transform transform hover:scale-105"
                    >
                      Réserver un service
                    </Button>
                  </BookingTrigger>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section id="services" className="py-16 md:py-24 bg-background">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center text-center mb-12">
            <h2 className="text-3xl font-bold font-headline tracking-tighter sm:text-4xl">Nos Prestations</h2>
            <p className="mt-3 max-w-2xl text-muted-foreground md:text-xl">
              Découvrez nos services conçus pour rendre votre événement mémorable.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {services.map((service) => {
               const serviceImage = PlaceHolderImages.find((p) => p.id === service.imageId);
               return (
                <Card key={service.id} className="flex flex-col overflow-hidden group transition-all hover:shadow-xl hover:-translate-y-1">
                  {serviceImage && (
                    <div className="relative h-48 w-full">
                       <Image
                          src={serviceImage.imageUrl}
                          alt={service.name}
                          fill
                          className="object-cover"
                          data-ai-hint={serviceImage.imageHint}
                       />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-accent/10 rounded-full">
                        <Icon name={service.icon as keyof typeof icons} className="h-6 w-6 text-accent" />
                      </div>
                      <CardTitle className="text-xl font-headline">{service.name}</CardTitle>
                    </div>
                  </CardHeader>
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
            })}
          </div>
        </div>
      </section>

      <section id="gallery" className="py-16 md:py-24 bg-secondary/50">
        <div className="container px-4 md:px-6">
           <div className="flex flex-col items-center text-center mb-12">
            <h2 className="text-3xl font-bold font-headline tracking-tighter sm:text-4xl">Nos Réalisations</h2>
            <p className="mt-3 max-w-2xl text-muted-foreground md:text-xl">
              Quelques souvenirs des moments inoubliables que nous avons aidé à créer.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4">
            {galleryImages.map((id, index) => {
              const image = PlaceHolderImages.find((p) => p.id === id);
              if (!image) return null;
              return (
                <div key={id} className={cn(
                  'relative aspect-square rounded-lg overflow-hidden group',
                  index === 0 && 'md:col-span-2 md:row-span-2 md:aspect-auto'
                )}>
                  <Image
                    src={image.imageUrl}
                    alt={image.description}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 768px) 50vw, 33vw"
                    data-ai-hint={image.imageHint}
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section id="reviews" className="py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center text-center mb-12">
            <h2 className="text-3xl font-bold font-headline tracking-tighter sm:text-4xl">Ce que nos clients disent</h2>
            <p className="mt-3 max-w-2xl text-muted-foreground md:text-xl">
              Votre confiance est notre plus belle récompense.
            </p>
          </div>
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full max-w-sm sm:max-w-xl md:max-w-3xl lg:max-w-5xl mx-auto"
          >
            <CarouselContent>
              {testimonials.map((testimonial) => {
                const avatar = PlaceHolderImages.find(p => p.id === testimonial.avatarImageId);
                return (
                  <CarouselItem key={testimonial.id} className="md:basis-1/2 lg:basis-1/3">
                    <div className="p-1 h-full">
                      <Card className="flex flex-col h-full justify-between shadow-md hover:shadow-primary/10 transition-shadow">
                        <CardContent className="p-6 flex-grow">
                          <StarRating rating={testimonial.rating} className="mb-4" />
                          <p className="text-foreground/80 italic">"{testimonial.comment}"</p>
                        </CardContent>
                        <CardFooter className="bg-secondary/30 p-4 flex items-center gap-4">
                          {avatar && (
                            <Avatar>
                              <AvatarImage src={avatar.imageUrl} alt={testimonial.name} data-ai-hint={avatar.imageHint} />
                              <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                          )}
                          <div>
                            <p className="font-semibold">{testimonial.name}</p>
                            <p className="text-sm text-muted-foreground">{testimonial.eventType}</p>
                          </div>
                        </CardFooter>
                      </Card>
                    </div>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            <CarouselPrevious className="hidden sm:flex" />
            <CarouselNext className="hidden sm:flex" />
          </Carousel>
        </div>
      </section>
      
      <footer id="contact" className="bg-primary text-primary-foreground mt-16">
        <div className="container py-8 text-center">
            <p>&copy; <CurrentYear /> Inoubliable Events. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}
