'use client';

import { useState } from 'react';
import { useFirestore, useMemoFirebase } from '@/firebase/provider';
import { useCollection } from '@/firebase/firestore/use-collection';
import { deleteDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { collection, query, orderBy, doc, serverTimestamp } from 'firebase/firestore';
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
import { columns, type Shop } from './columns';
import { ShopDialog } from './shop-dialog';

const ShopsSkeleton = () => (
    <div className="space-y-4">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
    </div>
);

export default function ShopsPage() {
  const firestore = useFirestore();
  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [shopToDelete, setShopToDelete] = useState<Shop | null>(null);

  const shopsQuery = useMemoFirebase(
    () => firestore && query(collection(firestore, 'shops'), orderBy('createdAt', 'desc')),
    [firestore]
  );
  const { data: shops, isLoading } = useCollection<Shop>(shopsQuery);

  const handleOpenDialog = (shop: Shop | null) => {
    setSelectedShop(shop);
    setIsDialogOpen(true);
  };

  const handleDialogChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
        setSelectedShop(null);
    }
  }

  const handleDeleteRequest = (shop: Shop) => {
    setShopToDelete(shop);
  };

  const handleDeleteConfirm = () => {
    if (!firestore || !shopToDelete) return;
    const shopRef = doc(firestore, 'shops', shopToDelete.id);
    deleteDocumentNonBlocking(shopRef);
    toast({ title: "Boutique supprimée", description: "La boutique a été supprimée de la plateforme." });
    setShopToDelete(null);
  };

  const handleSave = (shopData: Partial<Shop>) => {
    if (!firestore) return;

    if (selectedShop) { // Editing existing shop
        const shopRef = doc(firestore, 'shops', selectedShop.id);
        setDocumentNonBlocking(shopRef, shopData, { merge: true });
        toast({ title: "Boutique mise à jour !" });
    } else { // Creating new shop
        const newShopRef = doc(collection(firestore, 'shops'));
        const newShop = {
            ...shopData,
            id: newShopRef.id,
            status: 'pending_setup',
            subscriptionPlan: 'none',
            createdAt: serverTimestamp()
        };
        setDocumentNonBlocking(newShopRef, newShop, { merge: false });
        toast({ title: "Boutique créée !", description: "Vous pouvez maintenant assigner un propriétaire." });
    }
    setIsDialogOpen(false);
  }

  const tableColumns = columns(handleOpenDialog, handleDeleteRequest);

  return (
    <>
        <AlertDialog open={!!shopToDelete} onOpenChange={(open) => !open && setShopToDelete(null)}>
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Gestion des Boutiques</h2>
                        <p className="text-muted-foreground">
                        Supervisez toutes les boutiques de la marketplace.
                        </p>
                    </div>
                    <Button onClick={() => handleOpenDialog(null)}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Créer une boutique
                    </Button>
                </div>
                
                <Card>
                    <CardContent className="pt-6">
                         {isLoading ? (
                            <ShopsSkeleton />
                        ) : (
                            <DataTable columns={tableColumns} data={shops || []} />
                        )}
                    </CardContent>
                </Card>
            </div>

            <ShopDialog
                isOpen={isDialogOpen}
                setIsOpen={handleDialogChange}
                shop={selectedShop}
                onSave={handleSave}
            />

            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer cette boutique ?</AlertDialogTitle>
                    <AlertDialogDescription>
                    Cette action est irréversible et supprimera la boutique et toutes ses données associées (services, réservations, etc.).
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
