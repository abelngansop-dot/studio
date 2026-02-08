'use client';

import { ColumnDef } from '@tanstack/react-table';
import Image from 'next/image';
import { MoreHorizontal, ArrowUpDown, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { GalleryImage } from './page';

export const columns = (
    onEdit: (image: GalleryImage) => void,
    onDelete: (image: GalleryImage) => void
    ): ColumnDef<GalleryImage>[] => [
    {
        accessorKey: 'imageUrl',
        header: 'Aperçu',
        cell: ({ row }) => {
            const imageUrl = row.getValue('imageUrl') as string;
            const description = row.original.description;
            return (
                <div className="w-24 h-16 relative rounded-md overflow-hidden border">
                    <Image 
                        src={imageUrl}
                        alt={description}
                        fill
                        className="object-cover"
                    />
                </div>
            )
        }
    },
    {
        accessorKey: 'description',
        header: ({ column }) => {
            return (
                <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                >
                Description
                <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => <div className="max-w-sm truncate">{row.getValue('description')}</div>
    },
    {
        accessorKey: 'createdAt',
        header: 'Ajouté',
        cell: ({ row }) => {
            const date = row.getValue('createdAt') as { seconds: number; nanoseconds: number };
            if (!date) return 'N/A';
            return formatDistanceToNow(new Date(date.seconds * 1000), { addSuffix: true, locale: fr });
        }
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            const image = row.original;
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
                        <DropdownMenuItem onClick={() => onEdit(image)}>
                            Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => onDelete(image)}
                        >
                            <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        }
    }
];
