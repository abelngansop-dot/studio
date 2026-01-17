import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Card, CardContent } from '@/components/ui/card';

export default function Home() {
  const heroImage = PlaceHolderImages.find((p) => p.id === 'hero-background');

  return (
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
                <Button
                  asChild
                  size="lg"
                  className="bg-accent text-accent-foreground hover:bg-accent/90 text-lg px-8 py-6 rounded-full font-bold shadow-lg transition-transform transform hover:scale-105"
                >
                  <Link href="/booking">Réserver un service</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
