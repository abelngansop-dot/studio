'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BookingTrigger } from '@/components/booking/BookingTrigger';
import { useTranslation } from '@/hooks/use-translation';
import type { ImagePlaceholder } from '@/lib/placeholder-images';
import { useUser } from '@/firebase/provider';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';

type HeroSectionProps = {
    heroImage: ImagePlaceholder | undefined;
}

export function HeroSection({ heroImage }: HeroSectionProps) {
    const { t } = useTranslation();
    const { user, isUserLoading } = useUser();
    const ctaButtonClass = "bg-accent text-accent-foreground hover:bg-accent/90 text-lg px-8 py-6 rounded-full font-bold shadow-lg transition-transform transform hover:scale-105";

    const CtaButton = () => {
        if (isUserLoading) {
            return <Skeleton className="h-[68px] w-64 rounded-full" />;
        }
        if (user) {
            return (
                <Button asChild size="lg" className={ctaButtonClass}>
                    <Link href="/mes-reservations">{t('hero.manage_bookings')}</Link>
                </Button>
            )
        }
        return (
            <BookingTrigger>
                <Button
                    size="lg"
                    className={ctaButtonClass}
                >
                    {t('hero.cta')}
                </Button>
            </BookingTrigger>
        )
    }

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
                                {t('hero.title')}
                            </h1>
                            <p className="mt-4 max-w-xl mx-auto text-foreground/80 md:text-xl">
                                {t('hero.subtitle')}
                            </p>
                            <div className="mt-8">
                                <CtaButton />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>
    );
}
