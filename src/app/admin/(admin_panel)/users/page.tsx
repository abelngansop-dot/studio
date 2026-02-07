'use client';

import { useCollection } from '@/firebase/firestore/use-collection';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import { useFirestore, useMemoFirebase, useUser, useDoc } from '@/firebase';
import { DataTable } from '@/components/ui/data-table';
import { columns } from './columns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { User } from './columns';
import { Skeleton } from '@/components/ui/skeleton';

type UserProfile = {
  role: 'client' | 'admin' | 'superadmin';
};

export default function UsersPage() {
  const firestore = useFirestore();
  const { user, isUserLoading: isAuthLoading } = useUser();
  
  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userDocRef);
  
  // Defensively create a boolean to ensure role check is explicit and only true when profile is loaded.
  const isAuthorizedAdmin = !isProfileLoading && userProfile && ['admin', 'superadmin'].includes(userProfile.role);

  const usersQuery = useMemoFirebase(() => {
      // Stricter guard: only build query if profile is loaded AND user is confirmed admin.
      if(!isAuthorizedAdmin || !firestore) return null;
      return query(collection(firestore, 'users'), orderBy('createdAt', 'desc'))
    }, [firestore, isAuthorizedAdmin]);

  const { data: users, isLoading: isUsersLoading } = useCollection<User>(usersQuery);

  // The overall loading state depends on auth, profile, and then users if authorized.
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
      <Card>
        <CardHeader>
            <CardTitle>Utilisateurs</CardTitle>
            <CardDescription>Gérez les utilisateurs de l'application et leurs rôles.</CardDescription>
        </CardHeader>
        <CardContent>
            {/* If the user is not an admin, users will be null, and the table will show "Aucun résultat." */}
            <DataTable columns={columns} data={users || []} />
        </CardContent>
      </Card>
  );
}
