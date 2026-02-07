'use client';

import { useCollection } from '@/firebase/firestore/use-collection';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import { useFirestore, useMemoFirebase, useUser, useDoc } from '@/firebase';
import { DataTable } from '@/components/ui/data-table';
import { columns, type Booking } from './columns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
  
  const bookingsQuery = useMemoFirebase(() => {
    if (!firestore || !userProfile || !['admin', 'superadmin'].includes(userProfile.role)) {
      return null;
    }
    return query(collection(firestore, 'bookings'), orderBy('createdAt', 'desc'));
  }, [firestore, userProfile]);

  const { data: bookings, isLoading: isBookingsLoading } = useCollection<Booking>(bookingsQuery);

  const isLoading = isProfileLoading || isBookingsLoading;

  if (isLoading) {
    return <div>Chargement des réservations...</div>;
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
