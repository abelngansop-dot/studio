'use client';

import { useCollection } from '@/firebase/firestore/use-collection';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import { useFirestore, useMemoFirebase } from '@/firebase/provider';
import { DataTable } from '@/components/ui/data-table';
import { columns, type Booking } from './columns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useState } from 'react';
import { BookingDetailsDialog } from '@/app/admin/(admin_panel)/bookings/details-dialog';
import { useShop } from '@/hooks/use-shop-admin';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';


export default function ShopBookingsPage() {
  const firestore = useFirestore();
  const { shop } = useShop();
  const [detailsBooking, setDetailsBooking] = useState<Booking | null>(null);

  const bookingsQuery = useMemoFirebase(() => {
    if (!firestore || !shop?.id) return null;
    return query(
        collection(firestore, 'shops', shop.id, 'bookings'), 
        orderBy('createdAt', 'desc')
    );
  }, [firestore, shop?.id]);

  const { data: bookings, isLoading } = useCollection<Booking>(bookingsQuery);

  const pageColumns = columns(
    (booking) => setDetailsBooking(booking)
  );

  if (isLoading) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Réservations</CardTitle>
                 <CardDescription>Consultez et gérez les demandes de réservation pour votre boutique.</CardDescription>
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
    <div className="space-y-6">
        <div>
            <h1 className="text-3xl font-bold tracking-tight font-headline">Gestion des Réservations</h1>
            <p className="text-muted-foreground">Consultez et gérez les demandes de réservation pour votre boutique.</p>
        </div>
      <Card>
        <CardHeader>
          <CardTitle>Toutes les réservations</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={pageColumns} data={bookings || []} />
          {(!bookings || bookings.length === 0) && (
              <Alert className="mt-4">
                  <Info className="h-4 w-4" />
                  <AlertTitle>Aucune réservation pour le moment</AlertTitle>
                  <AlertDescription>
                    Lorsqu'un client fera une demande de réservation pour vos services, elle apparaîtra ici.
                  </AlertDescription>
              </Alert>
          )}
        </CardContent>
      </Card>
       {detailsBooking && (
        <BookingDetailsDialog 
            booking={detailsBooking} 
            isOpen={!!detailsBooking} 
            onOpenChange={() => setDetailsBooking(null)}
        />
    )}
    </div>
  );
}
