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
import { doc, addDoc, collection } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { EventType } from './event-types-columns';
import { setDocumentNonBlocking, addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Loader2 } from 'lucide-react';
import { icons } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/Icon';

type EventTypeDialogProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  eventType: EventType | null;
};

const iconNames = Object.keys(icons) as (keyof typeof icons)[];

export function EventTypeDialog({ isOpen, setIsOpen, eventType }: EventTypeDialogProps) {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState<keyof typeof icons>('Sparkles');
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const firestore = useFirestore();
  const { toast } = useToast();

  useEffect(() => {
    if (eventType) {
      setName(eventType.name);
      setIcon(eventType.icon);
      setImageUrl(eventType.imageUrl || '');
      setVideoUrl(eventType.videoUrl || '');
    } else {
      // Reset form
      setName('');
      setIcon('Sparkles');
      setImageUrl('');
      setVideoUrl('');
    }
  }, [eventType, isOpen]);

  const handleSubmit = async () => {
    if (!firestore) return;
    setIsSaving(true);

    const eventTypeData = { name, icon, imageUrl, videoUrl };

    try {
      if (eventType) {
        // Update existing
        const eventTypeRef = doc(firestore, 'eventTypes', eventType.id);
        setDocumentNonBlocking(eventTypeRef, eventTypeData, { merge: true });
        toast({ title: 'Type d\'événement mis à jour !' });
      } else {
        // Add new
        const collectionRef = collection(firestore, 'eventTypes');
        await addDocumentNonBlocking(collectionRef, eventTypeData);
        toast({ title: 'Type d\'événement ajouté !' });
      }
      setIsOpen(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de sauvegarder le type d\'événement.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{eventType ? 'Modifier le type' : 'Ajouter un type d\'événement'}</DialogTitle>
          <DialogDescription>
            Remplissez les détails ci-dessous.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
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
