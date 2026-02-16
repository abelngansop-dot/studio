'use client';

import { useCollection } from '@/firebase/firestore/use-collection';
import { collectionGroup, query, orderBy, doc } from 'firebase/firestore';
import { useFirestore, useMemoFirebase, useUserProfile } from '@/firebase/provider';
import { DataTable } from '@/components/ui/data-table';
import { columns, type Booking } from './columns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useState } from 'react';
import { BookingDetailsDialog } from './details-dialog';

export default function BookingsPage() {
  const firestore = useFirestore();
  const { userProfile, isProfileLoading } = useUserProfile();
  const [detailsBooking, setDetailsBooking] = useState<Booking | null>(null);
  
  const isAuthorizedAdmin = !isProfileLoading && userProfile && ['admin', 'superadmin'].includes(userProfile.role);

  const bookingsQuery = useMemoFirebase(() => {
    if (!isAuthorizedAdmin || !firestore) {
      return null;
    }
    return query(collectionGroup(firestore, 'bookings'), orderBy('createdAt', 'desc'));
  }, [firestore, isAuthorizedAdmin]);

  const { data: bookings, isLoading: isBookingsLoading } = useCollection<Booking>(bookingsQuery);

  const pageColumns = columns(
    (booking) => setDetailsBooking(booking)
  );

  const isLoading = isProfileLoading || (isAuthorizedAdmin && isBookingsLoading);

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
