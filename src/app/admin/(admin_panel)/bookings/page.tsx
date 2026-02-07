'use client';

import { useCollection } from '@/firebase/firestore/use-collection';
import { collection, query, orderBy } from 'firebase/firestore';
import { useFirestore, useMemoFirebase } from '@/firebase';
import { DataTable } from '@/components/ui/data-table';
import { columns } from './columns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function BookingsPage() {
  const firestore = useFirestore();
  
  const bookingsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'bookings'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  // The hook will return this type, but we must cast it for use in the data-table
  const { data: bookings, isLoading } = useCollection<any>(bookingsQuery);

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
