'use client';

import { useCollection } from '@/firebase/firestore/use-collection';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import { useFirestore, useMemoFirebase, useUser, useDoc } from '@/firebase';
import { DataTable } from '@/components/ui/data-table';
import { columns, type Booking } from './columns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

type UserProfile = {
  role: 'client' | 'admin' | 'superadmin';
};

export default function BookingsPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  
  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userDocRef);
  
  // Defensively create a boolean to ensure role check is explicit.
  const isAdmin = userProfile && ['admin', 'superadmin'].includes(userProfile.role);

  const bookingsQuery = useMemoFirebase(() => {
    // Stricter guard: only build query if profile is loaded AND user is admin.
    if (isProfileLoading || !firestore || !isAdmin) {
      return null;
    }
    return query(collection(firestore, 'bookings'), orderBy('createdAt', 'desc'));
  }, [firestore, isAdmin, isProfileLoading]);

  const { data: bookings, isLoading: isBookingsLoading } = useCollection<Booking>(bookingsQuery);

  const isLoading = isProfileLoading || (isAdmin && isBookingsLoading);

  // For non-admins, bookingsQuery will be null, and useCollection will return isLoading: false.
  // We show a loading state only if the user is an admin and the bookings are actually loading.
  if (isLoading) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Réservations</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <Skeleton className="h-10 w-1/3" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                </div>
            </CardContent>
        </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Réservations</CardTitle>
      </CardHeader>
      <CardContent>
        <DataTable columns={columns} data={bookings || []} />
      </CardContent>
    </Card>
  );
}
