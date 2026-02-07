'use client';

import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, where } from 'firebase/firestore';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export type Review = {
    id: string;
    userId: string;
    displayName: string;
    photoURL: string | null;
    rating: number;
    comment: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: { seconds: number; nanoseconds: number };
};


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

const ReviewSkeleton = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({length: 3}).map((_, i) => (
                <Card key={i}>
                    <CardContent className="p-6">
                        <Skeleton className="h-5 w-24 mb-4" />
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-4/5" />
                    </CardContent>
                    <CardFooter className="bg-secondary/30 p-4 flex items-center gap-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2">
                             <Skeleton className="h-4 w-24" />
                             <Skeleton className="h-3 w-16" />
                        </div>
                    </CardFooter>
                </Card>
            ))}
        </div>
    )
}

export function PublishedReviews() {
  const firestore = useFirestore();

  const reviewsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, 'reviews'),
      where('status', '==', 'approved'),
      orderBy('createdAt', 'desc')
    );
  }, [firestore]);

  const { data: reviews, isLoading } = useCollection<Review>(reviewsQuery);
  
  if (isLoading) {
      return <ReviewSkeleton />;
  }
  
  if (!reviews || reviews.length === 0) {
      return <p className="text-center text-muted-foreground">Aucun avis pour le moment. Soyez le premier !</p>
  }

  return (
    <Carousel
      opts={{
        align: 'start',
        loop: true,
      }}
      className="w-full max-w-sm sm:max-w-xl md:max-w-3xl lg:max-w-5xl mx-auto"
    >
      <CarouselContent>
        {reviews.map((review) => (
          <CarouselItem key={review.id} className="md:basis-1/2 lg:basis-1/3">
            <div className="p-1 h-full">
              <Card className="flex flex-col h-full justify-between shadow-md hover:shadow-primary/10 transition-shadow">
                <CardContent className="p-6 flex-grow">
                  <StarRating rating={review.rating} className="mb-4" />
                  <p className="text-foreground/80 italic">"{review.comment}"</p>
                </CardContent>
                <CardFooter className="bg-secondary/30 p-4 flex items-center gap-4">
                    <Avatar>
                      {review.photoURL && <AvatarImage src={review.photoURL} alt={review.displayName} />}
                      <AvatarFallback>{review.displayName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                  <div>
                    <p className="font-semibold">{review.displayName}</p>
                  </div>
                </CardFooter>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="hidden sm:flex" />
      <CarouselNext className="hidden sm:flex" />
    </Carousel>
  );
}
