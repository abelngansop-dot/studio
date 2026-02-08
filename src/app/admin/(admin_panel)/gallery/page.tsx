'use client';

import { useState } from 'react';
import { useFirestore, useMemoFirebase } from '@/firebase/provider';
import { useCollection } from '@/firebase/firestore/use-collection';
import { deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { GalleryDialog } from './gallery-dialog';
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

export type GalleryImage = {
  id: string;
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

export default function GalleryPage() {
  const firestore = useFirestore();
  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [imageToDelete, setImageToDelete] = useState<GalleryImage | null>(null);

  const galleryQuery = useMemoFirebase(
    () => firestore && query(collection(firestore, 'gallery'), orderBy('createdAt', 'desc')),
    [firestore]
  );
  const { data: images, isLoading } = useCollection<GalleryImage>(galleryQuery);

  const handleEditImage = (image: GalleryImage) => {
    setSelectedImage(image);
    setIsDialogOpen(true);
  };

  const handleDeleteRequest = (image: GalleryImage) => {
    setImageToDelete(image);
  };

  const handleDialogChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
        setSelectedImage(null);
    }
  }

  const handleDeleteConfirm = () => {
    if (!firestore || !imageToDelete) return;
    const imageRef = doc(firestore, 'gallery', imageToDelete.id);
    deleteDocumentNonBlocking(imageRef);
    toast({ title: "Image supprimée", description: "L'image a été retirée de la galerie." });
    setImageToDelete(null);
  };

  const tableColumns = columns(handleEditImage, handleDeleteRequest);

  return (
    <>
        <AlertDialog open={!!imageToDelete} onOpenChange={(open) => !open && setImageToDelete(null)}>
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Galerie</h2>
                    <p className="text-muted-foreground">
                      Gérez les images de votre portfolio public.
                    </p>
                </div>
                <Button onClick={() => { setSelectedImage(null); setIsDialogOpen(true); }}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Ajouter une image
                </Button>
                </div>
                
                <Card>
                    <CardContent className="pt-6">
                         {isLoading ? (
                            <GallerySkeleton />
                        ) : (
                            <DataTable columns={tableColumns} data={images || []} />
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
                    Cette action est irréversible. L'image sera définitivement retirée de votre galerie publique.
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
