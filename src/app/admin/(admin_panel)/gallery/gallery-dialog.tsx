'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFirestore } from '@/firebase/provider';
import { doc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { setDocumentNonBlocking, addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Loader2 } from 'lucide-react';
import { GalleryImage } from './page';
import { collection } from 'firebase/firestore';

type GalleryDialogProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  image: GalleryImage | null;
};

export function GalleryDialog({ isOpen, setIsOpen, image }: GalleryDialogProps) {
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [imageHint, setImageHint] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const firestore = useFirestore();
  const { toast } = useToast();

  useEffect(() => {
    if (image) {
      setImageUrl(image.imageUrl);
      setDescription(image.description);
      setImageHint(image.imageHint || '');
    } else {
      // Reset form
      setImageUrl('');
      setDescription('');
      setImageHint('');
    }
  }, [image, isOpen]);

  const handleSubmit = async () => {
    if (!firestore) return;
    if (!imageUrl || !description) {
        toast({
            variant: 'destructive',
            title: 'Champs requis',
            description: "L'URL de l'image et la description sont obligatoires."
        });
        return;
    }
    setIsSaving(true);

    const imageData = { 
      imageUrl, 
      description, 
      imageHint, 
      createdAt: image?.createdAt ? image.createdAt : serverTimestamp()
    };

    try {
      if (image) {
        // Update existing
        const imageRef = doc(firestore, 'gallery', image.id);
        await setDocumentNonBlocking(imageRef, imageData, { merge: true });
        toast({ title: 'Image mise à jour !' });
      } else {
        // Add new
        const collectionRef = collection(firestore, 'gallery');
        await addDocumentNonBlocking(collectionRef, imageData);
        toast({ title: 'Image ajoutée à la galerie !' });
      }
      setIsOpen(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: "Impossible de sauvegarder l'image.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{image ? 'Modifier l\'image' : 'Ajouter une image'}</DialogTitle>
          <DialogDescription>
            Remplissez les détails de l'image ci-dessous.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="imageUrl">URL de l'image</Label>
            <Input id="imageUrl" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://exemple.com/image.png" />
            {imageUrl && (
                <div className="mt-2 rounded-md border p-2 bg-muted/50">
                    <div className="relative aspect-video">
                         <Image 
                            src={imageUrl} 
                            alt="Aperçu" 
                            fill
                            className="object-contain rounded"
                        />
                    </div>
                </div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ex: Mariage à Douala" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="imageHint">Indice IA</Label>
            <Input id="imageHint" value={imageHint} onChange={(e) => setImageHint(e.target.value)} placeholder="Ex: wedding couple" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isSaving}>Annuler</Button>
          <Button onClick={handleSubmit} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sauvegarder
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
