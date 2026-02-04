'use client';

import { Bar, BarChart, CartesianGrid, XAxis, Pie, PieChart, Sector } from 'recharts';
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
import { TrendingUp } from 'lucide-react';

const revenueData = [
  { month: 'Janvier', revenue: 186000 },
  { month: 'Février', revenue: 305000 },
  { month: 'Mars', revenue: 237000 },
  { month: 'Avril', revenue: 73000 },
  { month: 'Mai', revenue: 209000 },
  { month: 'Juin', revenue: 214000 },
];

const serviceDistributionData = [
  { service: 'Photographe', bookings: 275, fill: 'var(--color-photographe)' },
  { service: 'Vidéo', bookings: 200, fill: 'var(--color-video)' },
  { service: 'Traiteur', bookings: 187, fill: 'var(--color-traiteur)' },
  { service: 'Logistique', bookings: 173, fill: 'var(--color-logistique)' },
  { service: 'Drone', bookings: 90, fill: 'var(--color-drone)' },
];

const chartConfig = {
  revenue: {
    label: 'Revenu',
    color: 'hsl(var(--chart-1))',
  },
  photographe: {
    label: 'Photographe',
    color: 'hsl(var(--chart-1))',
  },
  video: {
    label: 'Vidéo',
    color: 'hsl(var(--chart-2))',
  },
  traiteur: {
    label: 'Traiteur',
    color: 'hsl(var(--chart-3))',
  },
  logistique: {
    label: 'Logistique',
    color: 'hsl(var(--chart-4))',
  },
  drone: {
    label: 'Drone',
    color: 'hsl(var(--chart-5))',
  },
};

export default function AnalyticsPage() {
  const totalRevenue = useMemo(() => {
    return revenueData.reduce((acc, curr) => acc + curr.revenue, 0);
  }, []);
  
  const totalBookings = useMemo(() => {
    return serviceDistributionData.reduce((acc, curr) => acc + curr.bookings, 0);
  }, []);


  return (
    <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Revenu Mensuel</CardTitle>
          <CardDescription>Janvier - Juin 2024</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <BarChart
              accessibilityLayer
              data={revenueData}
              margin={{
                left: 12,
                right: 12,
              }}
            >
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
              <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
            </BarChart>
          </ChartContainer>
        </CardContent>
        <CardFooter className="flex-col items-start gap-2 text-sm">
          <div className="flex gap-2 font-medium leading-none">
            Revenu en hausse de 5.2% ce mois-ci <TrendingUp className="h-4 w-4" />
          </div>
          <div className="leading-none text-muted-foreground">
            Affichage des 6 derniers mois
          </div>
        </CardFooter>
      </Card>
      
      <Card className="flex flex-col">
          <CardHeader className="items-center pb-0">
            <CardTitle>Répartition des Services</CardTitle>
            <CardDescription>Janvier - Juin 2024</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <ChartContainer
              config={chartConfig}
              className="mx-auto aspect-square max-h-[250px]"
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                  data={serviceDistributionData}
                  dataKey="bookings"
                  nameKey="service"
                  innerRadius={60}
                  strokeWidth={5}
                >
                </Pie>
                <ChartLegend
                  content={<ChartLegendContent nameKey="service" />}
                  className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
                />
              </PieChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex-col gap-2 text-sm">
             <div className="flex items-center gap-2 font-medium leading-none">
              Total de {totalBookings} réservations ce semestre
            </div>
            <div className="leading-none text-muted-foreground">
              Le service de photographie est le plus populaire.
            </div>
          </CardFooter>
        </Card>
    </div>
  );
}
