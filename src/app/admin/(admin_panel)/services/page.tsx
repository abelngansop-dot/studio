'use client';

import { useCollection } from '@/firebase/firestore/use-collection';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import { useFirestore, useMemoFirebase, deleteDocumentNonBlocking } from '@/firebase';
import { DataTable } from '@/components/ui/data-table';
import { columns } from './columns';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { ServiceDialog } from './service-dialog';
import { useState } from 'react';
import type { Service } from './columns';
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

export default function ServicesPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);
  
  const servicesQuery = useMemoFirebase(() => {
      if(!firestore) return null;
      return query(collection(firestore, 'services'), orderBy('name', 'asc'))
    }, [firestore]);

  const { data: services, isLoading } = useCollection<Service>(servicesQuery);

  const handleEdit = (service: Service) => {
    setSelectedService(service);
    setIsDialogOpen(true);
  }
  
  const handleDeleteRequest = (service: Service) => {
      setServiceToDelete(service);
  }

  const handleDeleteConfirm = () => {
    if (!firestore || !serviceToDelete) return;
    const serviceRef = doc(firestore, 'services', serviceToDelete.id);
    deleteDocumentNonBlocking(serviceRef);
    toast({ title: "Service supprimé", description: `Le service "${serviceToDelete.name}" a été supprimé.`});
    setServiceToDelete(null);
  }

  const handleAddNew = () => {
    setSelectedService(null);
    setIsDialogOpen(true);
  }

  return (
    <AlertDialog open={!!serviceToDelete} onOpenChange={(open) => !open && setServiceToDelete(null)}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Services</h2>
            <p className="text-muted-foreground">
              Gérez les services proposés par Inoublevent.
            </p>
          </div>
          <Button onClick={handleAddNew}>
            <PlusCircle className="mr-2 h-4 w-4" /> Ajouter un service
          </Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <DataTable columns={columns(handleEdit, handleDeleteRequest)} data={services || []} />
          </CardContent>
        </Card>
        <ServiceDialog 
          isOpen={isDialogOpen} 
          setIsOpen={setIsDialogOpen}
          service={selectedService}
        />
      </div>
       <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer ce service ?</AlertDialogTitle>
                <AlertDialogDescription>
                    Cette action est irréversible. Le service <span className="font-semibold">{serviceToDelete?.name}</span> sera définitivement supprimé.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setServiceToDelete(null)}>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90">Supprimer</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
  );
}
