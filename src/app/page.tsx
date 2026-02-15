import { Header } from '@/components/Header';
import { ContactFooter } from '@/components/ContactFooter';
import { HeroSection } from '@/components/home/HeroSection';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ShopListSection } from '@/components/home/ShopListSection';

export default function Home() {
  const heroImage = PlaceHolderImages.find((p) => p.id === 'hero-background');

  return (
    <div className="bg-background">
      <Header />
      <main>
        <HeroSection heroImage={heroImage} />
        <ShopListSection />
        <ContactFooter />
      </main>
    </div>
  );
}
