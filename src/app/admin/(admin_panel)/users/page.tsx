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
  const { user } = useUser();
  
  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userDocRef);
  
  // Defensively create a boolean to ensure role check is explicit.
  const isAdmin = userProfile && ['admin', 'superadmin'].includes(userProfile.role);

  const usersQuery = useMemoFirebase(() => {
      // Stricter guard: only build query if profile is loaded AND user is admin.
      if(isProfileLoading || !firestore || !isAdmin) return null;
      return query(collection(firestore, 'users'), orderBy('createdAt', 'desc'))
    }, [firestore, isAdmin, isProfileLoading]);

  const { data: users, isLoading: isUsersLoading } = useCollection<User>(usersQuery);

  // Show loading state only if the user is an admin and the data is actually loading.
  const isLoading = isProfileLoading || (isAdmin && isUsersLoading);
  
  if (isLoading) {
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
            <DataTable columns={columns} data={users || []} />
        </CardContent>
      </Card>
  );
}
