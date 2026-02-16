import { Header } from '@/components/Header';
import { ContactFooter } from '@/components/ContactFooter';
import { HeroSection } from '@/components/home/HeroSection';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ShopListSection } from '@/components/home/ShopListSection';
import { PublishedReviews } from '@/components/reviews/PublishedReviews';
import { LeaveReviewTrigger } from '@/components/reviews/LeaveReviewTrigger';
import { Button } from '@/components/ui/button';

export default function Home() {
  const heroImage = PlaceHolderImages.find((p) => p.id === 'hero-background');

  return (
    <div className="bg-background">
      <Header />
      <main>
        <HeroSection heroImage={heroImage} />
        <ShopListSection />
        <section id="reviews" className="py-16 md:py-24 bg-secondary/30">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center text-center mb-12">
              <h2 className="text-3xl font-bold font-headline tracking-tighter sm:text-4xl">Ce que nos clients disent</h2>
              <p className="mt-3 max-w-2xl text-muted-foreground md:text-xl">
                Votre confiance est notre plus belle récompense.
              </p>
            </div>
            <PublishedReviews />
            <div className="mt-12 text-center">
              <LeaveReviewTrigger>
                <Button size="lg" variant="outline" className="rounded-full shadow-lg border-2 bg-background/50 hover:bg-background/80 text-base">Laisser un avis</Button>
              </LeaveReviewTrigger>
            </div>
          </div>
        </section>
        <ContactFooter />
      </main>
    </div>
  );
}
