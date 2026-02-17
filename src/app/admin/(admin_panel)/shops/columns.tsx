'use client';

import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, ArrowUpDown, Trash2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export type Shop = {
  id: string;
  name: string;
  ownerId: string;
  subscriptionPlan: 'basic' | 'premium' | 'pro' | 'none';
  status: 'active' | 'suspended' | 'pending_setup';
  createdAt: { seconds: number; nanoseconds: number };
  imageUrl?: string;
  phone?: string;
  averageRating?: number;
  reviewCount?: number;
};

export const columns = (
    onEdit: (shop: Shop) => void,
    onDelete: (shop: Shop) => void
    ): ColumnDef<Shop>[] => [
  {
    accessorKey: 'name',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Nom de la boutique
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div className="font-medium">{row.getValue('name')}</div>
  },
  {
    accessorKey: 'status',
    header: 'Statut',
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      const variant: 'default' | 'secondary' | 'destructive' = 
        status === 'active' ? 'default' : 
        status === 'suspended' ? 'destructive' : 'secondary';
      return <Badge variant={variant} className="capitalize">{status.replace('_', ' ')}</Badge>;
    },
  },
  {
    accessorKey: 'subscriptionPlan',
    header: 'Abonnement',
    cell: ({ row }) => <div className="capitalize">{row.getValue('subscriptionPlan')}</div>,
  },
  {
    accessorKey: 'createdAt',
    header: 'Date de création',
    cell: ({ row }) => {
      const date = row.getValue('createdAt') as { seconds: number, nanoseconds: number };
      const formattedDate = date ? format(new Date(date.seconds * 1000), 'd MMM yyyy', { locale: fr }) : 'N/A';
      return <div>{formattedDate}</div>;
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const shop = row.original;
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
            <DropdownMenuItem onClick={() => onEdit(shop)}>
              <Edit className="mr-2 h-4 w-4" /> Modifier
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => onDelete(shop)}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
