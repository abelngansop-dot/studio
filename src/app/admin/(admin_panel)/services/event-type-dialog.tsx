'use client';

import { useState, useEffect, useRef } from 'react';
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
import { useFirebase } from '@/firebase/provider';
import { doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { EventType } from './event-types-columns';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Loader2, Upload, ImageIcon } from 'lucide-react';
import { icons } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/Icon';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

type EventTypeDialogProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  eventType: EventType | null;
};

const iconNames = Object.keys(icons) as (keyof typeof icons)[];

export function EventTypeDialog({ isOpen, setIsOpen, eventType }: EventTypeDialogProps) {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState<keyof typeof icons>('Sparkles');
  const [isSaving, setIsSaving] = useState(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { firestore, firebaseApp } = useFirebase();
  const { toast } = useToast();

  useEffect(() => {
     if (isOpen) {
        if (eventType) {
          setName(eventType.name);
          setIcon(eventType.icon);
          setPreviewUrl(eventType.imageUrl || null);
          setSelectedFile(null);
        } else {
          // Reset form
          setName('');
          setIcon('Sparkles');
          setPreviewUrl(null);
          setSelectedFile(null);
        }
    }
  }, [eventType, isOpen]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!firestore || !firebaseApp) return;
    if (!eventType) {
        toast({ variant: 'destructive', title: 'Erreur', description: 'Aucun type d\'événement sélectionné.' });
        return;
    }
    if (!name) {
        toast({ variant: 'destructive', title: 'Champs requis', description: "Le nom est obligatoire." });
        return;
    }

    setIsSaving(true);

    try {
      let finalImageUrl = eventType.imageUrl || '';
      if (selectedFile) {
        const storage = getStorage(firebaseApp);
        const imagePath = `shops/${eventType.shopId}/eventTypes/${Date.now()}_${selectedFile.name}`;
        const imageReference = storageRef(storage, imagePath);
        await uploadBytes(imageReference, selectedFile);
        finalImageUrl = await getDownloadURL(imageReference);
      }

      const eventTypeData = { name, icon, imageUrl: finalImageUrl };

      // Update existing
      const eventTypeRef = doc(firestore, 'shops', eventType.shopId, 'eventTypes', eventType.id);
      setDocumentNonBlocking(eventTypeRef, eventTypeData, { merge: true });
      toast({ title: 'Type d\'événement mis à jour !' });

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
            <Label>Image (optionnel)</Label>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
            />
             <div className="relative aspect-video w-full rounded-md border-2 border-dashed flex items-center justify-center bg-muted">
                {previewUrl ? (
                    <Image 
                        src={previewUrl} 
                        alt="Aperçu" 
                        fill
                        className="object-contain rounded"
                    />
                ) : (
                   <div className="text-center text-muted-foreground p-4">
                        <ImageIcon className="h-8 w-8 mx-auto" />
                        <p className="text-xs mt-2">Aucune image</p>
                    </div>
                )}
            </div>
             <Button type="button" variant="outline" className="w-full mt-2" onClick={() => fileInputRef.current?.click()} disabled={isSaving}>
                <Upload className="mr-2 h-4 w-4" />
                {previewUrl ? 'Changer l\'image' : 'Choisir une image'}
            </Button>
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
