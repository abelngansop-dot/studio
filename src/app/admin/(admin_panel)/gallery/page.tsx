'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useCollection, useFirestore, useMemoFirebase, deleteDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy, doc, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2, Loader2 } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
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
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export type GalleryImage = {
  id: string;
  imageUrl: string;
  description: string;
  imageHint: string;
  createdAt: { seconds: number, nanoseconds: number };
};

const GallerySkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
    {Array.from({ length: 8 }).map((_, i) => (
      <Card key={i}>
        <Skeleton className="aspect-video w-full" />
        <CardContent className="p-4">
          <Skeleton className="h-4 w-4/5" />
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <Skeleton className="h-8 w-20" />
        </CardFooter>
      </Card>
    ))}
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

  const handleDeleteConfirm = () => {
    if (!firestore || !imageToDelete) return;
    const imageRef = doc(firestore, 'gallery', imageToDelete.id);
    deleteDocumentNonBlocking(imageRef);
    toast({ title: "Image supprimée", description: "L'image a été retirée de la galerie." });
    setImageToDelete(null);
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Galerie</h2>
            <p className="text-muted-foreground">
              Gérez les images et vidéos affichées publiquement sur le site.
            </p>
          </div>
          <Button onClick={() => { setSelectedImage(null); setIsDialogOpen(true); }}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Ajouter un média
          </Button>
        </div>
        
        {isLoading ? <GallerySkeleton /> : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {images?.map(image => (
              <Card key={image.id} className="overflow-hidden group">
                <div className="relative aspect-video">
                  <Image src={image.imageUrl} alt={image.description} fill className="object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button variant="outline" size="sm" onClick={() => handleEditImage(image)}>Modifier</Button>
                  </div>
                </div>
                <CardContent className="p-4">
                  <p className="font-medium truncate">{image.description}</p>
                  <p className="text-xs text-muted-foreground">
                    Ajouté {formatDistanceToNow(new Date(image.createdAt.seconds * 1000), { addSuffix: true, locale: fr })}
                  </p>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Button variant="destructive" size="sm" onClick={() => handleDeleteRequest(image)}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Supprimer
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      <GalleryDialog
        isOpen={isDialogOpen}
        setIsOpen={setIsDialogOpen}
        image={selectedImage}
      />

      <AlertDialog open={!!imageToDelete} onOpenChange={(open) => !open && setImageToDelete(null)}>
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
