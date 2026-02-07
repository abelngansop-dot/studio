'use client';

import { useCollection } from '@/firebase/firestore/use-collection';
import { collection, query, orderBy } from 'firebase/firestore';
import { useFirestore, useMemoFirebase } from '@/firebase';
import { DataTable } from '@/components/ui/data-table';
import { columns } from './columns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { ServiceDialog } from './service-dialog';
import { useState } from 'react';
import type { Service } from './columns';


export default function ServicesPage() {
  const firestore = useFirestore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  
  const servicesQuery = useMemoFirebase(() => {
      if(!firestore) return null;
      return query(collection(firestore, 'services'), orderBy('name', 'asc'))
    }, [firestore]);

  const { data: services, isLoading } = useCollection<Service>(servicesQuery);

  const handleEdit = (service: Service) => {
    setSelectedService(service);
    setIsDialogOpen(true);
  }

  const handleAddNew = () => {
    setSelectedService(null);
    setIsDialogOpen(true);
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Services</h2>
          <p className="text-muted-foreground">
            Gérez les services proposés par Inoubliable.
          </p>
        </div>
        <Button onClick={handleAddNew}>
          <PlusCircle className="mr-2 h-4 w-4" /> Ajouter un service
        </Button>
      </div>
      <Card>
        <CardContent className="pt-6">
          <DataTable columns={columns(handleEdit)} data={services || []} />
        </CardContent>
      </Card>
      <ServiceDialog 
        isOpen={isDialogOpen} 
        setIsOpen={setIsDialogOpen}
        service={selectedService}
      />
    </>
  );
}
