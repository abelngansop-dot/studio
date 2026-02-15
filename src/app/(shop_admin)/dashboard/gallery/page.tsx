'use client';

import { useState } from 'react';
import { useFirestore, useMemoFirebase } from '@/firebase/provider';
import { useCollection } from '@/firebase/firestore/use-collection';
import { deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { PlusCircle, Image as ImageIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { columns } from './columns';
import { GalleryDialog } from './gallery-dialog';
import { useShop } from '@/hooks/use-shop-admin';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export type GalleryImage = {
  id: string;
  shopId: string;
  imageUrl: string;
  description: string;
  imageHint: string;
  createdAt: { seconds: number, nanoseconds: number };
};

const GallerySkeleton = () => (
    <div className="space-y-4">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
    </div>
);

export default function ShopGalleryPage() {
  const firestore = useFirestore();
  const { shop } = useShop();
  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [imageToDelete, setImageToDelete] = useState<GalleryImage | null>(null);

  const galleryQuery = useMemoFirebase(
    () => shop?.id && firestore ? query(collection(firestore, 'shops', shop.id, 'gallery'), orderBy('createdAt', 'desc')) : null,
    [firestore, shop?.id]
  );
  const { data: images, isLoading } = useCollection<GalleryImage>(galleryQuery);

  const handleOpenDialog = (image: GalleryImage | null) => {
    setSelectedImage(image);
    setIsDialogOpen(true);
  };

  const handleDialogChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
        setSelectedImage(null);
    }
  }

  const handleDeleteRequest = (image: GalleryImage) => {
    setImageToDelete(image);
  };

  const handleDeleteConfirm = () => {
    if (!firestore || !imageToDelete || !shop?.id) return;
    const imageRef = doc(firestore, 'shops', imageToDelete.shopId, 'gallery', imageToDelete.id);
    deleteDocumentNonBlocking(imageRef);
    toast({ title: "Image supprimée", description: "L'image a été retirée de votre galerie." });
    setImageToDelete(null);
  };

  const tableColumns = columns(handleOpenDialog, handleDeleteRequest);

  if (isLoading) {
    return <GallerySkeleton />;
  }

  return (
    <>
        <AlertDialog open={!!imageToDelete} onOpenChange={(open) => !open && setImageToDelete(null)}>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight font-headline">Ma Galerie</h1>
                        <p className="text-muted-foreground">
                        Ajoutez et gérez les images de votre portfolio public.
                        </p>
                    </div>
                    <Button onClick={() => handleOpenDialog(null)}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Ajouter une image
                    </Button>
                </div>
                
                <Card>
                    <CardHeader>
                        <CardTitle>Portfolio de la boutique</CardTitle>
                    </CardHeader>
                    <CardContent>
                         <DataTable columns={tableColumns} data={images || []} />
                         {(!images || images.length === 0) && (
                            <Alert className="mt-4">
                                <ImageIcon className="h-4 w-4" />
                                <AlertTitle>Votre galerie est vide</AlertTitle>
                                <AlertDescription>
                                    Cliquez sur "Ajouter une image" pour commencer à construire votre portfolio et attirer des clients.
                                </AlertDescription>
                            </Alert>
                         )}
                    </CardContent>
                </Card>
            </div>

            <GalleryDialog
                isOpen={isDialogOpen}
                setIsOpen={handleDialogChange}
                image={selectedImage}
            />

            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer cette image ?</AlertDialogTitle>
                    <AlertDialogDescription>
                    Cette action est irréversible. L'image sera définitivement supprimée de votre galerie.
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
