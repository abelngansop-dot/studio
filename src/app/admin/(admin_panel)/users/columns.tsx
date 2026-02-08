'use client';

import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, ArrowUpDown, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { doc } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase/provider';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';


export type User = {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  role: 'client' | 'admin' | 'superadmin';
  gender?: 'homme' | 'femme';
  createdAt: { seconds: number; nanoseconds: number };
};

const RoleBadge = ({ role }: { role: User['role'] }) => {
  let variant: 'default' | 'secondary' | 'outline' = 'secondary';
  if (role === 'admin') variant = 'default';
  if (role === 'superadmin') variant = 'outline';
  
  return <Badge variant={variant} className="capitalize">{role}</Badge>;
}

const UserCell = ({ row }: { row: any }) => {
    const user = row.original as User;
    const name = user.displayName || user.email;
    const fallback = name.substring(0, 2).toUpperCase();
    return (
        <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
                <AvatarImage src={user.photoURL || ''} alt={name} />
                <AvatarFallback>{fallback}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
                <span className="font-medium">{name}</span>
                <span className="text-xs text-muted-foreground">{user.email}</span>
            </div>
        </div>
    )
}

const RoleSelector = ({ user, isSelf }: { user: User; isSelf: boolean }) => {
    const firestore = useFirestore();
    const roles: User['role'][] = ['client', 'admin', 'superadmin'];

    const handleRoleChange = (role: string) => {
        if (!firestore) return;
        const userRef = doc(firestore, 'users', user.uid);
        updateDocumentNonBlocking(userRef, { role });
    }

    return (
        <DropdownMenuSub>
            <DropdownMenuSubTrigger disabled={isSelf}>Changer le rôle</DropdownMenuSubTrigger>
            <DropdownMenuPortal>
                <DropdownMenuSubContent>
                    <DropdownMenuRadioGroup value={user.role} onValueChange={handleRoleChange}>
                        {roles.map(role => (
                            <DropdownMenuRadioItem key={role} value={role} className="capitalize">
                                {role}
                            </DropdownMenuRadioItem>
                        ))}
                    </DropdownMenuRadioGroup>
                </DropdownMenuSubContent>
            </DropdownMenuPortal>
        </DropdownMenuSub>
    )
}

export const columns = (onDelete: (user: User) => void): ColumnDef<User>[] => [
  {
    accessorKey: 'displayName',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Utilisateur
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: UserCell
  },
  {
    accessorKey: 'role',
    header: 'Rôle',
    cell: ({ row }) => <RoleBadge role={row.getValue('role')} />,
  },
  {
    accessorKey: 'gender',
    header: 'Genre',
    cell: ({ row }) => <div className="capitalize">{row.getValue('gender') || 'N/A'}</div>,
  },
  {
    accessorKey: 'createdAt',
    header: 'Date de création',
    cell: ({ row }) => {
      const date = row.getValue('createdAt') as { seconds: number, nanoseconds: number };
      const formattedDate = date ? format(new Date(date.seconds * 1000), 'd MMMM yyyy', { locale: fr }) : 'N/A';
      return <div>{formattedDate}</div>;
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const user = row.original;
      const { user: currentUser } = useUser();
      const isSelf = currentUser?.uid === user.uid;

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
              onClick={() => navigator.clipboard.writeText(user.uid)}
            >
              Copier l'ID utilisateur
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <RoleSelector user={user} isSelf={isSelf} />
            <DropdownMenuItem onClick={() => onDelete(user)} className="text-destructive" disabled={isSelf}>
                <Trash2 className="mr-2 h-4 w-4" /> Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
