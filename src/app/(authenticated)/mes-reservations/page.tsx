'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Booking } from '@/app/admin/(admin_panel)/bookings/columns';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Rocket, CalendarPlus } from 'lucide-react';
import { BookingTrigger } from '@/components/booking/BookingTrigger';

function BookingSkeleton() {
    return (
        <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
        </div>
    )
}

function EmptyState() {
    return (
        <div className="text-center py-16 px-4">
            <Alert className="max-w-md mx-auto">
                <Rocket className="h-4 w-4" />
                <AlertTitle className="font-bold">Vous n'avez aucune réservation.</AlertTitle>
                <AlertDescription>
                    Commencez par créer une demande pour la voir apparaître ici.
                </AlertDescription>
            </Alert>
            <BookingTrigger>
                <Button className="mt-8">
                    <CalendarPlus className="mr-2 h-4 w-4" />
                    Faire une nouvelle réservation
                </Button>
            </BookingTrigger>
        </div>
    )
}

export default function MyBookingsPage() {
    const { user } = useUser();
    const firestore = useFirestore();

    const bookingsQuery = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return query(
            collection(firestore, 'bookings'),
            where('userId', '==', user.uid),
            orderBy('createdAt', 'desc')
        );
    }, [firestore, user]);

    const { data: bookings, isLoading } = useCollection<Booking>(bookingsQuery);

    const getStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
        switch (status) {
            case 'confirmed': return 'default';
            case 'cancelled': return 'destructive';
            case 'pending': return 'secondary';
            default: return 'outline';
        }
    }

    return (
        <div className="container mx-auto">
            <div className="mb-8">
                <h1 className="text-4xl font-bold font-headline tracking-tight">Mes Réservations</h1>
                <p className="text-muted-foreground mt-2">Suivez l'état de vos demandes et préparez votre événement.</p>
            </div>

            {isLoading && <BookingSkeleton />}
            
            {!isLoading && (!bookings || bookings.length === 0) && <EmptyState />}
            
            {!isLoading && bookings && bookings.length > 0 && (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {bookings.map(booking => (
                        <Card key={booking.id} className="flex flex-col">
                            <CardHeader className="flex-row justify-between items-start">
                                <div>
                                    <CardTitle className="capitalize">{booking.eventType}</CardTitle>
                                    <CardDescription>
                                        {booking.date ? format(new Date(booking.date.seconds * 1000), 'd MMMM yyyy', { locale: fr }) : 'Date à confirmer'}
                                    </CardDescription>
                                </div>
                                <Badge variant={getStatusVariant(booking.status)} className="capitalize">{booking.status}</Badge>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <p className="text-sm font-medium text-muted-foreground">Services demandés :</p>
                                <p className="capitalize text-sm">{booking.services?.join(', ') || 'Non spécifiés'}</p>
                            </CardContent>
                            <CardFooter>
                                <Button variant="outline" className="w-full">Voir les détails</Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
