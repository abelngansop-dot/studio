'use client';

import { Bar, BarChart, CartesianGrid, XAxis, Pie, PieChart, Cell } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { useMemo } from 'react';
import { TrendingUp, PartyPopper } from 'lucide-react';
import { useFirestore, useMemoFirebase } from '@/firebase/provider';
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection, query } from 'firebase/firestore';
import type { Booking } from '../bookings/columns';
import { format, getMonth } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';
import type { Service } from '../services/columns';

type EventType = { id: string; name: string; };

const chartColors = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

const LoadingState = () => (
    <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
        <Card className="lg:col-span-3">
            <CardHeader>
                <Skeleton className="h-7 w-1/2" />
                <Skeleton className="h-4 w-1/4" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-[300px] w-full" />
            </CardContent>
        </Card>
        <Card className="flex flex-col xl:col-span-2">
            <CardHeader className="items-center pb-0">
                <Skeleton className="h-7 w-3/4" />
            </CardHeader>
            <CardContent className="flex-1 pb-0 flex items-center justify-center">
                <Skeleton className="h-[200px] w-[200px] rounded-full" />
            </CardContent>
        </Card>
        <Card className="flex flex-col">
            <CardHeader className="items-center pb-0">
                <Skeleton className="h-7 w-3/4" />
            </CardHeader>
            <CardContent className="flex-1 pb-0 flex items-center justify-center">
                <Skeleton className="h-[200px] w-[200px] rounded-full" />
            </CardContent>
        </Card>
    </div>
);


export default function AnalyticsPage() {
  const firestore = useFirestore();

  const bookingsQuery = useMemoFirebase(() => firestore && query(collection(firestore, 'bookings')), [firestore]);
  const servicesQuery = useMemoFirebase(() => firestore && query(collection(firestore, 'services')), [firestore]);
  const eventTypesQuery = useMemoFirebase(() => firestore && query(collection(firestore, 'eventTypes')), [firestore]);

  const { data: bookings, isLoading: bookingsLoading } = useCollection<Booking>(bookingsQuery);
  const { data: services, isLoading: servicesLoading } = useCollection<Service>(servicesQuery);
  const { data: eventTypes, isLoading: eventTypesLoading } = useCollection<EventType>(eventTypesQuery);

  const { bookingsByMonth, servicesDistribution, eventTypesDistribution } = useMemo(() => {
    if (!bookings || !services || !eventTypes) return { bookingsByMonth: [], servicesDistribution: [], eventTypesDistribution: [] };

    const monthlyCounts: { [key: number]: number } = {};
    bookings.forEach(booking => {
      if (booking.date) {
        const month = getMonth(new Date(booking.date.seconds * 1000));
        monthlyCounts[month] = (monthlyCounts[month] || 0) + 1;
      }
    });

    const bookingsByMonth = Array.from({ length: 12 }, (_, i) => ({
      month: format(new Date(2024, i, 1), 'MMMM', { locale: fr }),
      total: monthlyCounts[i] || 0,
    }));

    const serviceCounts: { [key: string]: number } = {};
    bookings.forEach(booking => {
      booking.services?.forEach(service => {
        serviceCounts[service] = (serviceCounts[service] || 0) + 1;
      });
    });

    const servicesDistribution = Object.entries(serviceCounts).map(([id, count], index) => ({
      name: services.find(s => s.id === id)?.name || id,
      count,
      fill: chartColors[index % chartColors.length]
    })).sort((a, b) => b.count - a.count);

    const eventTypeCounts: { [key: string]: number } = {};
    bookings.forEach(booking => {
        eventTypeCounts[booking.eventType] = (eventTypeCounts[booking.eventType] || 0) + 1;
    });

    const eventTypesDistribution = Object.entries(eventTypeCounts).map(([id, count], index) => ({
      name: eventTypes.find(e => e.id === id)?.name || id,
      count,
      fill: chartColors[index % chartColors.length]
    })).sort((a, b) => b.count - a.count);


    return { bookingsByMonth, servicesDistribution, eventTypesDistribution };
  }, [bookings, services, eventTypes]);

  const chartConfig = useMemo(() => {
      const config: any = {
          total: { label: 'Réservations', color: 'hsl(var(--primary))' },
      };
      servicesDistribution.forEach(item => {
          config[item.name] = { label: item.name, color: item.fill };
      });
      eventTypesDistribution.forEach(item => {
          config[item.name] = { label: item.name, color: item.fill };
      });
      return config;
  }, [servicesDistribution, eventTypesDistribution]);
  
  const isLoading = bookingsLoading || servicesLoading || eventTypesLoading;

  if (isLoading) {
      return <LoadingState />;
  }

  return (
    <div className="space-y-8">
        <div>
            <h1 className="text-3xl font-bold tracking-tight font-headline">Statistiques</h1>
            <p className="text-muted-foreground">Analyse détaillée de l'activité de la plateforme.</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-3">
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Activité des réservations par mois</CardTitle>
              <CardDescription>Affichage des données de l'année en cours.</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <BarChart accessibilityLayer data={bookingsByMonth}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => value.slice(0, 3)}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dot" />}
                  />
                  <Bar dataKey="total" fill="var(--color-total)" radius={4} />
                </BarChart>
              </ChartContainer>
            </CardContent>
             <CardFooter className="flex-col items-start gap-2 text-sm">
              <div className="flex gap-2 font-medium leading-none">
                Hausse de l'activité observée sur les derniers mois <TrendingUp className="h-4 w-4" />
              </div>
            </CardFooter>
          </Card>
          
          <Card className="flex flex-col lg:col-span-2">
              <CardHeader className="items-center pb-0">
                <CardTitle>Répartition par Type d'événement</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 pb-0">
                <ChartContainer
                  config={chartConfig}
                  className="mx-auto aspect-square max-h-[300px]"
                >
                  <PieChart>
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent hideLabel />}
                    />
                    <Pie data={eventTypesDistribution} dataKey="count" nameKey="name" innerRadius={60} strokeWidth={5}>
                       {eventTypesDistribution.map((entry) => (
                        <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <ChartLegend
                      content={<ChartLegendContent nameKey="name" />}
                      className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
                    />
                  </PieChart>
                </ChartContainer>
              </CardContent>
              <CardFooter className="flex-col gap-2 text-sm pt-4">
                 <div className="flex items-center gap-2 font-medium leading-none">
                    <PartyPopper className="h-4 w-4" /> Total de {bookings?.length} réservations
                </div>
              </CardFooter>
            </Card>

            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle>Services les plus populaires</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                  {servicesDistribution.slice(0, 5).map(service => (
                      <div key={service.name} className="flex items-center">
                          <div className="capitalize text-sm font-medium">{service.name}</div>
                          <div className="ml-auto font-semibold">{service.count}</div>
                      </div>
                  ))}
              </CardContent>
            </Card>

        </div>
    </div>
  );
}
