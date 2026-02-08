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
import { Textarea } from '@/components/ui/textarea';
import { useFirestore } from '@/firebase';
import { doc, setDoc, addDoc, collection } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Service } from './columns';
import { setDocumentNonBlocking, addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Loader2 } from 'lucide-react';
import { icons } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/Icon';


type ServiceDialogProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  service: Service | null;
};

const iconNames = Object.keys(icons) as (keyof typeof icons)[];

export function ServiceDialog({ isOpen, setIsOpen, service }: ServiceDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState<keyof typeof icons>('Package');
  const [rating, setRating] = useState(0);
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const firestore = useFirestore();
  const { toast } = useToast();

  useEffect(() => {
    if (service) {
      setName(service.name);
      setDescription(service.description);
      setIcon(service.icon);
      setRating(service.rating);
      setImageUrl(service.imageUrl || '');
      setVideoUrl(service.videoUrl || '');
    } else {
      // Reset form for new service
      setName('');
      setDescription('');
      setIcon('Package');
      setRating(0);
      setImageUrl('');
      setVideoUrl('');
    }
  }, [service, isOpen]);

  const handleSubmit = async () => {
    if (!firestore) return;
    setIsSaving(true);

    const serviceData = { name, description, icon, rating, imageUrl, videoUrl };

    try {
      if (service) {
        // Update existing service
        const serviceRef = doc(firestore, 'services', service.id);
        setDocumentNonBlocking(serviceRef, serviceData, { merge: true });
        toast({ title: 'Service mis à jour !' });
      } else {
        // Add new service
        const collectionRef = collection(firestore, 'services');
        await addDocumentNonBlocking(collectionRef, serviceData);
        toast({ title: 'Service ajouté !' });
      }
      setIsOpen(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de sauvegarder le service.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{service ? 'Modifier le service' : 'Ajouter un service'}</DialogTitle>
          <DialogDescription>
            Remplissez les détails du service ci-dessous.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
           <div className="space-y-2">
            <Label htmlFor="icon">Icône</Label>
            <Select onValueChange={(value) => setIcon(value as keyof typeof icons)} value={icon}>
                <SelectTrigger id="icon">
                    <SelectValue placeholder="Choisir une icône">
                        <div className="flex items-center gap-2">
                           <Icon name={icon} /> 
                           <span>{icon}</span>
                        </div>
                    </SelectValue>
                </SelectTrigger>
                <SelectContent>
                    {iconNames.map(iconName => (
                        <SelectItem key={iconName} value={iconName}>
                            <div className="flex items-center gap-2">
                                <Icon name={iconName} />
                                <span>{iconName}</span>
                            </div>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="rating">Note</Label>
            <Input id="rating" type="number" value={rating} onChange={(e) => setRating(Number(e.target.value))} />
          </div>
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
            <Label htmlFor="videoUrl">URL de la vidéo</Label>
            <Input id="videoUrl" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://exemple.com/video.mp4" />
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
