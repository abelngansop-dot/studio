'use client';

import { useCollection } from '@/firebase/firestore/use-collection';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import { useFirestore, useMemoFirebase, useUser } from '@/firebase/provider';
import { useDoc } from '@/firebase/firestore/use-doc';
import { DataTable } from '@/components/ui/data-table';
import { columns, type Booking } from './columns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useState } from 'react';
import { BookingDetailsDialog } from './details-dialog';

type UserProfile = {
  role: 'client' | 'admin' | 'superadmin';
};

export default function BookingsPage() {
  const firestore = useFirestore();
  const { user, isUserLoading: isAuthLoading } = useUser();
  const [detailsBooking, setDetailsBooking] = useState<Booking | null>(null);
  
  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userDocRef);
  
  // Defensively create a boolean to ensure role check is explicit and only true when profile is loaded.
  const isAuthorizedAdmin = !isProfileLoading && userProfile && ['admin', 'superadmin'].includes(userProfile.role);

  const bookingsQuery = useMemoFirebase(() => {
    // Stricter guard: only build query if profile is loaded AND user is confirmed admin.
    if (!isAuthorizedAdmin || !firestore) {
      return null;
    }
    return query(collection(firestore, 'bookings'), orderBy('createdAt', 'desc'));
  }, [firestore, isAuthorizedAdmin]);

  // Pass the authorized query to useCollection. It will be null for non-admins.
  const { data: bookings, isLoading: isBookingsLoading } = useCollection<Booking>(bookingsQuery);

  const pageColumns = columns(
    (booking) => setDetailsBooking(booking)
  );

  // The overall loading state depends on auth, profile, and then bookings if authorized.
  const isLoading = isAuthLoading || isProfileLoading || (isAuthorizedAdmin && isBookingsLoading);

  // Render a loading state while we verify everything.
  if (isLoading && !bookings) {
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
    <>
      <Card>
        <CardHeader>
          <CardTitle>Réservations</CardTitle>
        </CardHeader>
        <CardContent>
          {/* If the user is not an admin, bookings will be null, and the table will show "Aucun résultat." */}
          <DataTable columns={pageColumns} data={bookings || []} />
        </CardContent>
      </Card>
       {detailsBooking && (
        <BookingDetailsDialog 
            booking={detailsBooking} 
            isOpen={!!detailsBooking} 
            onOpenChange={() => setDetailsBooking(null)}
        />
    )}
    </>
  );
}
