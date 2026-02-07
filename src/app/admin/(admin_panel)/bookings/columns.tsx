'use client';

import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Booking = {
  id: string;
  userId: string;
  eventType: string;
  services?: string[];
  requestDetails?: string;
  date?: { seconds: number; nanoseconds: number };
  status: 'pending' | 'confirmed' | 'cancelled';
  contactInfo?: {
    email: string;
    phone: string;
  };
};

export const columns: ColumnDef<Booking>[] = [
  {
    accessorKey: 'status',
    header: 'Statut',
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      let variant: 'default' | 'secondary' | 'destructive' = 'secondary';
      if (status === 'confirmed') variant = 'default';
      if (status === 'cancelled') variant = 'destructive';

      return <Badge variant={variant} className="capitalize">{status || 'N/A'}</Badge>;
    },
  },
  {
    accessorKey: 'contactInfo.email',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Client
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const email = row.getValue('contactInfo.email') as string | undefined;
      return <div className="lowercase">{email || 'Non renseigné'}</div>
    }
  },
  {
    accessorKey: 'eventType',
    header: 'Événement',
    cell: ({ row }) => {
        return <div className="capitalize">{row.getValue("eventType")}</div>
    }
  },
  {
    accessorKey: 'services',
    header: 'Services',
    cell: ({ row }) => {
      const services = row.getValue('services') as string[] | undefined;
      return <div className="capitalize truncate max-w-xs">{Array.isArray(services) && services.length > 0 ? services.join(', ') : 'N/A'}</div>;
    },
  },
  {
    accessorKey: 'date',
    header: 'Date',
    cell: ({ row }) => {
      const date = row.getValue('date') as { seconds: number, nanoseconds: number } | undefined;
      const formattedDate = date ? format(new Date(date.seconds * 1000), 'd MMMM yyyy', { locale: fr }) : 'N/A';
      return <div>{formattedDate}</div>;
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const booking = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Ouvrir le menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(booking.id)}
            >
              Copier l'ID de la réservation
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Voir les détails</DropdownMenuItem>
            <DropdownMenuItem>Contacter le client</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
