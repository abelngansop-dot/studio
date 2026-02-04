'use client';

import { useCollection } from '@/firebase/firestore/use-collection';
import { collection, query, orderBy } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { DataTable } from '@/components/ui/data-table';
import { columns } from './columns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useMemo } from 'react';
import type { User } from './columns';


export default function UsersPage() {
  const firestore = useFirestore();
  
  const usersQuery = useMemo(() => {
      if(!firestore) return null;
      return query(collection(firestore, 'users'), orderBy('createdAt', 'desc'))
    }, [firestore]);

  const { data: users, isLoading } = useCollection<User>(usersQuery);

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
