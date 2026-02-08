'use client';

import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, ArrowUpDown, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { doc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import type { Review } from '@/components/reviews/PublishedReviews';

const StatusBadge = ({ status }: { status: Review['status'] }) => {
  let variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'secondary';
  if (status === 'approved') variant = 'default';
  if (status === 'rejected') variant = 'destructive';
  
  return <Badge variant={variant} className="capitalize">{status}</Badge>;
}

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex items-center gap-0.5">
    {Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < Math.round(rating) ? 'text-primary fill-primary' : 'text-muted-foreground/30'}`}
      />
    ))}
  </div>
);

const ActionsCell = ({ row }: { row: any }) => {
    const review = row.original as Review;
    const firestore = useFirestore();

    const handleStatusChange = (newStatus: 'approved' | 'rejected') => {
        if (!firestore) return;
        const reviewRef = doc(firestore, 'reviews', review.id);
        updateDocumentNonBlocking(reviewRef, { status: newStatus });
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Ouvrir le menu</span>
                <MoreHorizontal className="h-4 w-4" />
            </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
            <DropdownMenuLabel>Modération</DropdownMenuLabel>
            {review.status !== 'approved' && (
                <DropdownMenuItem onClick={() => handleStatusChange('approved')}>
                    Approuver
                </DropdownMenuItem>
            )}
            {review.status !== 'rejected' && (
                 <DropdownMenuItem onClick={() => handleStatusChange('rejected')} className="text-destructive">
                    Rejeter
                </DropdownMenuItem>
            )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export const columns: ColumnDef<Review>[] = [
  {
    accessorKey: 'status',
    header: 'Statut',
    cell: ({ row }) => <StatusBadge status={row.getValue('status')} />,
  },
  {
    accessorKey: 'displayName',
    header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Auteur
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
  },
  {
    accessorKey: 'comment',
    header: 'Commentaire',
    cell: ({ row }) => <div className="truncate max-w-sm">{row.getValue('comment')}</div>,
  },
  {
    accessorKey: 'rating',
    header: 'Note',
    cell: ({ row }) => <StarRating rating={row.getValue('rating')} />,
  },
  {
    id: 'actions',
    cell: ActionsCell
  },
];
