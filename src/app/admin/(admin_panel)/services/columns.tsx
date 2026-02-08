'use client';

import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, ArrowUpDown, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Icon from '@/components/Icon';
import { icons } from 'lucide-react';

export type Service = {
  id: string;
  name: string;
  description: string;
  icon: keyof typeof icons;
  rating: number;
  imageUrl?: string;
  videoUrl?: string;
};

export const columns = (
    onEdit: (service: Service) => void,
    onDelete: (service: Service) => void
    ): ColumnDef<Service>[] => [
  {
    accessorKey: 'name',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Nom
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
     cell: ({ row }) => {
      const service = row.original;
      return (
        <div className="flex items-center gap-2">
            <Icon name={service.icon} className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium">{service.name}</span>
        </div>
      )
    }
  },
  {
    accessorKey: 'description',
    header: 'Description',
    cell: ({ row }) => <div className="truncate max-w-sm">{row.getValue('description')}</div>,
  },
  {
    accessorKey: 'rating',
    header: 'Note',
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const service = row.original;

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
            <DropdownMenuItem onClick={() => onEdit(service)}>
              Modifier
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => onDelete(service)}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
