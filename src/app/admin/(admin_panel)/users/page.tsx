'use client';

import { useCollection } from '@/firebase/firestore/use-collection';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import { useFirestore, useMemoFirebase, useUser } from '@/firebase/provider';
import { useDoc } from '@/firebase/firestore/use-doc';
import { deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { DataTable } from '@/components/ui/data-table';
import { columns } from './columns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { User } from './columns';
import { Skeleton } from '@/components/ui/skeleton';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

type UserProfile = {
  role: 'client' | 'admin' | 'superadmin';
};

export default function UsersPage() {
  const firestore = useFirestore();
  const { user: authUser, isUserLoading: isAuthLoading } = useUser();
  const { toast } = useToast();
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  
  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !authUser) return null;
    return doc(firestore, 'users', authUser.uid);
  }, [firestore, authUser]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userDocRef);
  
  const isAuthorizedAdmin = !isProfileLoading && userProfile && ['admin', 'superadmin'].includes(userProfile.role);

  const usersQuery = useMemoFirebase(() => {
      if(!isAuthorizedAdmin || !firestore) return null;
      return query(collection(firestore, 'users'), orderBy('createdAt', 'desc'))
    }, [firestore, isAuthorizedAdmin]);

  const { data: users, isLoading: isUsersLoading } = useCollection<User>(usersQuery);

  const handleDeleteRequest = (user: User) => {
    setUserToDelete(user);
  }

  const handleDeleteConfirm = () => {
    if (!firestore || !userToDelete) return;
    const userRef = doc(firestore, 'users', userToDelete.uid);
    deleteDocumentNonBlocking(userRef);
    toast({ title: "Profil utilisateur supprimé", description: `Le profil de ${userToDelete.email} a été supprimé.`});
    setUserToDelete(null);
  }

  const isLoading = isAuthLoading || isProfileLoading || (isAuthorizedAdmin && isUsersLoading);
  
  if (isLoading && !users) {
      return (
          <Card>
            <CardHeader>
                <CardTitle>Utilisateurs</CardTitle>
                <CardDescription>Gérez les utilisateurs de l'application et leurs rôles.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Skeleton className="h-10 w-1/3" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
            </CardContent>
         </Card>
      );
  }

  return (
    <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
      <Card>
        <CardHeader>
            <CardTitle>Utilisateurs</CardTitle>
            <CardDescription>Gérez les utilisateurs de l'application et leurs rôles.</CardDescription>
        </CardHeader>
        <CardContent>
            <DataTable columns={columns(handleDeleteRequest)} data={users || []} />
        </CardContent>
      </Card>
      <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer cet utilisateur ?</AlertDialogTitle>
                <AlertDialogDescription>
                    Cette action est irréversible et supprimera le profil de <span className="font-semibold">{userToDelete?.email}</span>. L'authentification de l'utilisateur ne sera pas supprimée.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setUserToDelete(null)}>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90">Supprimer</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
  );
}
