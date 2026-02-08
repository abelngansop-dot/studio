'use client';

import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import { LeaveReviewTrigger } from '@/components/reviews/LeaveReviewTrigger';
import { PublishedReviews } from '@/components/reviews/PublishedReviews';
import { useTranslation } from '@/hooks/use-translation';

export function ReviewsSection() {
    const { t } = useTranslation();

    return (
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
    );
}
