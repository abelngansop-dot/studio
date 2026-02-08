import Image from 'next/image';
import { Header } from '@/components/Header';
import { ContactFooter } from '@/components/ContactFooter';
import { HeroSection } from '@/components/home/HeroSection';
import { ServicesSection } from '@/components/home/ServicesSection';
import { GallerySection } from '@/components/home/GallerySection';
import { ReviewsSection } from '@/components/home/ReviewsSection';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function Home() {
  const heroImage = PlaceHolderImages.find((p) => p.id === 'hero-background');

  return (
    <div className="bg-background">
      <Header />
      <main>
        <HeroSection heroImage={heroImage} />
        <ServicesSection />
        <GallerySection />
        <ReviewsSection />
        <ContactFooter />
      </main>
    </div>
  );
}
