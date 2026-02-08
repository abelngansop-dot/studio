'use client'

import { useFirestore, useMemoFirebase } from '@/firebase/provider';
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection, query, orderBy, limit, where } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Activity, BookOpen, Users, Star, Package, Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowUpRight } from 'lucide-react';

// Simplified types for the dashboard
type Booking = { id: string; eventType: string; status: string; date?: { seconds: number }; contactInfo?: { email: string }, createdAt: any };
type User = { uid: string };
type Service = { id: string };
type Review = { id: string };

function StatCard({ title, value, icon, description, isLoading }: { title: string, value: string | number, icon: React.ReactNode, description: string, isLoading: boolean }) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <div className="text-muted-foreground">{icon}</div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-4 w-40 mt-2" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

const getStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (status) {
    case 'confirmed': return 'default';
    case 'cancelled': return 'destructive';
    case 'pending': return 'secondary';
    default: return 'outline';
  }
}

export default function Dashboard() {
  const firestore = useFirestore();

  // Queries for stats
  const bookingsQuery = useMemoFirebase(() => firestore && query(collection(firestore, 'bookings')), [firestore]);
  const usersQuery = useMemoFirebase(() => firestore && query(collection(firestore, 'users')), [firestore]);
  const servicesQuery = useMemoFirebase(() => firestore && query(collection(firestore, 'services')), [firestore]);
  const pendingReviewsQuery = useMemoFirebase(() => firestore && query(collection(firestore, 'reviews'), where('status', '==', 'pending')), [firestore]);
  const recentBookingsQuery = useMemoFirebase(() => firestore && query(collection(firestore, 'bookings'), orderBy('createdAt', 'desc'), limit(5)), [firestore]);

  const { data: bookings, isLoading: bookingsLoading } = useCollection<Booking>(bookingsQuery);
  const { data: users, isLoading: usersLoading } = useCollection<User>(usersQuery);
  const { data: services, isLoading: servicesLoading } = useCollection<Service>(servicesQuery);
  const { data: pendingReviews, isLoading: reviewsLoading } = useCollection<Review>(pendingReviewsQuery);
  const { data: recentBookings, isLoading: recentBookingsLoading } = useCollection<Booking>(recentBookingsQuery);

  const isLoading = bookingsLoading || usersLoading || servicesLoading || reviewsLoading;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Tableau de bord</h1>
        <p className="text-muted-foreground">Une vue d'ensemble de l'activité de votre plateforme.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total des Réservations"
          value={bookings?.length ?? 0}
          icon={<BookOpen className="h-4 w-4" />}
          description="Toutes les réservations confondues"
          isLoading={isLoading}
        />
        <StatCard
          title="Total des Utilisateurs"
          value={users?.length ?? 0}
          icon={<Users className="h-4 w-4" />}
          description="Nombre de comptes créés"
          isLoading={isLoading}
        />
        <StatCard
          title="Avis en attente"
          value={pendingReviews?.length ?? 0}
          icon={<Clock className="h-4 w-4" />}
          description="Avis à modérer"
          isLoading={isLoading}
        />
        <StatCard
          title="Services Proposés"
          value={services?.length ?? 0}
          icon={<Package className="h-4 w-4" />}
          description="Nombre de services actifs"
          isLoading={isLoading}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader className="flex flex-row items-center">
            <div className="grid gap-2">
              <CardTitle>Réservations Récentes</CardTitle>
              <CardDescription>
                Les 5 dernières demandes reçues.
              </CardDescription>
            </div>
            <Button asChild size="sm" className="ml-auto gap-1">
              <Link href="/admin/bookings">
                Voir tout
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentBookingsLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead className="hidden sm:table-cell">Événement</TableHead>
                    <TableHead className="hidden md:table-cell">Date</TableHead>
                    <TableHead className="text-right">Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentBookings?.map(booking => (
                    <TableRow key={booking.id}>
                      <TableCell>
                        <div className="font-medium">{booking.contactInfo?.email || 'N/A'}</div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell capitalize">{booking.eventType}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {booking.date ? format(new Date(booking.date.seconds * 1000), 'd MMM yyyy', { locale: fr }) : 'N/A'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant={getStatusVariant(booking.status)} className="capitalize">{booking.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
            <CardHeader>
                <CardTitle>Activité</CardTitle>
                <CardDescription>Un aperçu rapide de vos données.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
               <div className="flex items-center gap-4 rounded-md border p-4">
                    <Activity className="h-8 w-8 text-primary" />
                    <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">Prochaine Échéance</p>
                        <p className="text-sm text-muted-foreground">Aucune réservation confirmée à venir.</p>
                    </div>
               </div>
                <div className="flex items-center gap-4 rounded-md border p-4">
                    <Star className="h-8 w-8 text-primary" />
                    <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">Note Moyenne</p>
                        <p className="text-sm text-muted-foreground">Calcul en cours...</p>
                    </div>
               </div>
            </CardContent>
        </Card>
      </div>
    </div>
  )
}
