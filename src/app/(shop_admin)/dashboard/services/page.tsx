'use client';

import { useState } from 'react';
import { useFirestore, useMemoFirebase } from '@/firebase/provider';
import { useCollection } from '@/firebase/firestore/use-collection';
import { deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { DataTable } from '@/components/ui/data-table';
import { columns, type Service } from './columns';
import { ServiceDialog } from './service-dialog';
import { useShop } from '@/hooks/use-shop-admin';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';

const ServicesSkeleton = () => (
    <div className="space-y-4">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
    </div>
);

export default function ShopServicesPage() {
  const firestore = useFirestore();
  const { shop } = useShop();
  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);

  const servicesQuery = useMemoFirebase(
    () => shop?.id && firestore ? query(collection(firestore, 'shops', shop.id, 'services'), orderBy('name', 'asc')) : null,
    [firestore, shop?.id]
  );
  const { data: services, isLoading } = useCollection<Service>(servicesQuery);

  const handleOpenDialog = (service: Service | null) => {
    setSelectedService(service);
    setIsDialogOpen(true);
  };

  const handleDialogChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
        setSelectedService(null);
    }
  }

  const handleDeleteRequest = (service: Service) => {
    setServiceToDelete(service);
  };

  const handleDeleteConfirm = () => {
    if (!firestore || !serviceToDelete || !shop?.id) return;
    const serviceRef = doc(firestore, 'shops', shop.id, 'services', serviceToDelete.id);
    deleteDocumentNonBlocking(serviceRef);
    toast({ title: "Service supprimé", description: `Le service "${serviceToDelete.name}" a été retiré de votre boutique.` });
    setServiceToDelete(null);
  };

  const tableColumns = columns(handleOpenDialog, handleDeleteRequest);

  if (isLoading) {
    return <ServicesSkeleton />;
  }

  return (
    <>
        <AlertDialog open={!!serviceToDelete} onOpenChange={(open) => !open && setServiceToDelete(null)}>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight font-headline">Mes Services</h1>
                        <p className="text-muted-foreground">
                        Ajoutez, modifiez et gérez les services que vous proposez.
                        </p>
                    </div>
                    <Button onClick={() => handleOpenDialog(null)}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Ajouter un service
                    </Button>
                </div>
                
                <Card>
                    <CardHeader>
                        <CardTitle>Liste des services</CardTitle>
                    </CardHeader>
                    <CardContent>
                         <DataTable columns={tableColumns} data={services || []} />
                         {(!services || services.length === 0) && (
                            <Alert className="mt-4">
                                <Info className="h-4 w-4" />
                                <AlertTitle>Aucun service pour le moment</AlertTitle>
                                <AlertDescription>
                                    Cliquez sur "Ajouter un service" pour commencer à proposer vos prestations.
                                </AlertDescription>
                            </Alert>
                         )}
                    </CardContent>
                </Card>
            </div>

            <ServiceDialog
                isOpen={isDialogOpen}
                setIsOpen={handleDialogChange}
                service={selectedService}
            />

            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer ce service ?</AlertDialogTitle>
                    <AlertDialogDescription>
                    Cette action est irréversible. Le service <span className="font-semibold">{serviceToDelete?.name}</span> sera définitivement supprimé de votre boutique.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90">
                    Supprimer
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
       </AlertDialog>
    </>
  );
}
