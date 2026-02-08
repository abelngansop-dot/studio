'use client';

import { useCollection } from '@/firebase/firestore/use-collection';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import { useFirestore, useMemoFirebase, useUser, useDoc } from '@/firebase';
import { DataTable } from '@/components/ui/data-table';
import { columns } from './columns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Review } from '@/components/reviews/PublishedReviews';
import { Skeleton } from '@/components/ui/skeleton';

type UserProfile = {
  role: 'client' | 'admin' | 'superadmin';
};

export default function ReviewsPage() {
  const firestore = useFirestore();
  const { user, isUserLoading: isAuthLoading } = useUser();
  
  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userDocRef);
  
  const isAuthorizedAdmin = !isProfileLoading && userProfile && ['admin', 'superadmin'].includes(userProfile.role);

  const reviewsQuery = useMemoFirebase(() => {
      if(!isAuthorizedAdmin || !firestore) return null;
      return query(collection(firestore, 'reviews'), orderBy('createdAt', 'desc'))
    }, [firestore, isAuthorizedAdmin]);

  const { data: reviews, isLoading: isReviewsLoading } = useCollection<Review>(reviewsQuery);

  const isLoading = isAuthLoading || isProfileLoading || (isAuthorizedAdmin && isReviewsLoading);
  
  if (isLoading && !reviews) {
      return (
          <Card>
            <CardHeader>
                <CardTitle>Avis des clients</CardTitle>
                <CardDescription>Modérer les avis soumis par les utilisateurs.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Skeleton className="h-10 w-1/3" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
            </CardContent>
         </Card>
      );
  }

  return (
      <Card>
        <CardHeader>
            <CardTitle>Avis des clients</CardTitle>
            <CardDescription>Modérer les avis soumis par les utilisateurs.</CardDescription>
        </CardHeader>
        <CardContent>
            <DataTable columns={columns} data={reviews || []} />
        </CardContent>
      </Card>
  );
}
