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
import { Textarea } from '@/components/ui/textarea';
import { useFirebase } from '@/firebase/provider';
import { doc, collection } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Service } from './columns';
import { setDocumentNonBlocking, addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Loader2, Upload, ImageIcon } from 'lucide-react';
import { icons } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/Icon';
import { useShop } from '@/hooks/use-shop-admin';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

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
  const [isSaving, setIsSaving] = useState(false);
  
  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { firestore, firebaseApp } = useFirebase();
  const { shop } = useShop();
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
        if (service) {
            setName(service.name);
            setDescription(service.description);
            setIcon(service.icon);
            setPreviewUrl(service.imageUrl || null);
            setSelectedFile(null);
        } else {
            // Reset form for new service
            setName('');
            setDescription('');
            setIcon('Package');
            setPreviewUrl(null);
            setSelectedFile(null);
        }
    }
  }, [service, isOpen]);
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!firestore || !shop || !firebaseApp) return;
    if (!name || !description) {
        toast({ variant: 'destructive', title: 'Champs requis', description: "Le nom et la description sont obligatoires." });
        return;
    }
    setIsSaving(true);

    try {
      let finalImageUrl = service?.imageUrl || '';

      if (selectedFile) {
        const storage = getStorage(firebaseApp);
        const imagePath = `shops/${shop.id}/services/${Date.now()}_${selectedFile.name}`;
        const imageReference = storageRef(storage, imagePath);
        await uploadBytes(imageReference, selectedFile);
        finalImageUrl = await getDownloadURL(imageReference);
      }

      const serviceData = { 
          shopId: shop.id,
          name, 
          description, 
          icon, 
          rating: service?.rating || 0,
          imageUrl: finalImageUrl, 
          videoUrl: '' // Video not supported in this version
      };

      if (service) {
        // Update existing service
        const serviceRef = doc(firestore, 'shops', shop.id, 'services', service.id);
        setDocumentNonBlocking(serviceRef, serviceData, { merge: true });
        toast({ title: 'Service mis à jour !' });
      } else {
        // Create new service
        const collectionRef = collection(firestore, 'shops', shop.id, 'services');
        await addDocumentNonBlocking(collectionRef, serviceData);
        toast({ title: 'Service ajouté !', description: `${name} est maintenant disponible dans votre boutique.` });
      }
      setIsOpen(false);
    } catch (error) {
      console.error("Error saving service:", error);
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
            <Label>Image du service (optionnel)</Label>
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
