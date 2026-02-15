'use client';

import { useShop } from '@/hooks/use-shop-admin';
import { useFirestore, useMemoFirebase } from '@/firebase/provider';
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection, query, where, Timestamp } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BookOpen, Users, Package, TrendingUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { useMemo } from 'react';
import { format, startOfMonth, endOfMonth, getDay } from 'date-fns';
import { fr } from 'date-fns/locale';

type Booking = { createdAt: Timestamp; };
type Service = { id: string; };

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

export default function ShopDashboardPage() {
  const firestore = useFirestore();
  const { shop } = useShop();

  const bookingsThisMonthQuery = useMemoFirebase(() => {
    if (!firestore || !shop?.id) return null;
    const now = new Date();
    const firstDayOfMonth = startOfMonth(now);
    const lastDayOfMonth = endOfMonth(now);
    return query(
      collection(firestore, 'shops', shop.id, 'bookings'),
      where('createdAt', '>=', firstDayOfMonth),
      where('createdAt', '<=', lastDayOfMonth)
    );
  }, [firestore, shop?.id]);

  const servicesQuery = useMemoFirebase(() => {
    if (!firestore || !shop?.id) return null;
    return query(collection(firestore, 'shops', shop.id, 'services'));
  }, [firestore, shop?.id]);

  const { data: bookings, isLoading: bookingsLoading } = useCollection<Booking>(bookingsThisMonthQuery);
  const { data: services, isLoading: servicesLoading } = useCollection<Service>(servicesQuery);

  const bookingsByDay = useMemo(() => {
    if (!bookings) return [];
    
    const dayCounts: { [key: string]: number } = {};
    bookings.forEach(booking => {
        if(booking.createdAt) {
            const day = format(booking.createdAt.toDate(), 'd MMM', { locale: fr });
            dayCounts[day] = (dayCounts[day] || 0) + 1;
        }
    });

    return Object.entries(dayCounts).map(([day, total]) => ({ day, total })).sort((a,b) => a.day.localeCompare(b.day));
  }, [bookings]);

  const chartConfig = {
    total: { label: 'Réservations', color: 'hsl(var(--primary))' },
  };

  const isLoading = bookingsLoading || servicesLoading;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Tableau de bord</h1>
        <p className="text-muted-foreground">Vue d'ensemble de l'activité de votre boutique.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Réservations (ce mois-ci)"
          value={bookings?.length ?? 0}
          icon={<BookOpen className="h-4 w-4" />}
          description="Nouvelles demandes reçues"
          isLoading={isLoading}
        />
        <StatCard
          title="Revenus Estimés"
          value="N/A"
          icon={<TrendingUp className="h-4 w-4" />}
          description="Bientôt disponible"
          isLoading={isLoading}
        />
        <StatCard
          title="Services Actifs"
          value={services?.length ?? 0}
          icon={<Package className="h-4 w-4" />}
          description="Services proposés dans votre boutique"
          isLoading={isLoading}
        />
        <StatCard
          title="Taux de Croissance"
          value="+0%"
          icon={<Users className="h-4 w-4" />}
          description="Par rapport au mois dernier"
          isLoading={isLoading}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activité des réservations ce mois-ci</CardTitle>
          <CardDescription>Affichage des nouvelles demandes par jour.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <BarChart accessibilityLayer data={bookingsByDay}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
              <Bar dataKey="total" fill="var(--color-total)" radius={4} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
