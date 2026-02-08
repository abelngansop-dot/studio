'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFirestore, useMemoFirebase } from '@/firebase/provider';
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection, query, orderBy } from 'firebase/firestore';
import type { GalleryImage } from '@/app/admin/(admin_panel)/gallery/page';
import { SelectableCard } from '@/components/booking/SelectableCard';
import { useTranslation } from '@/hooks/use-translation';

const GallerySkeleton = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4">
        <Skeleton className="md:col-span-2 md:row-span-2 aspect-square md:aspect-auto" />
        <Skeleton className="aspect-square" />
        <Skeleton className="aspect-square" />
        <Skeleton className="aspect-square" />
        <Skeleton className="aspect-square" />
        <Skeleton className="aspect-square" />
    </div>
);

export function GallerySection() {
    const { t } = useTranslation();
    const firestore = useFirestore();
    const galleryQuery = useMemoFirebase(() => firestore && query(collection(firestore, 'gallery'), orderBy('createdAt', 'desc')), [firestore]);
    const { data: galleryImages, isLoading: galleryLoading } = useCollection<GalleryImage>(galleryQuery);
    const [selectedImages, setSelectedImages] = useState<string[]>([]);

    const handleImageSelect = (imageId: string) => {
        setSelectedImages((prev) =>
        prev.includes(imageId)
            ? prev.filter((id) => id !== imageId)
            : [...prev, imageId]
        );
    };

    return (
        <section id="gallery" className="py-16 md:py-24 bg-secondary/50">
            <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center text-center mb-12">
                    <h2 className="text-3xl font-bold font-headline tracking-tighter sm:text-4xl">{t('gallery.title')}</h2>
                    <p className="mt-3 max-w-2xl text-muted-foreground md:text-xl">
                    {t('gallery.subtitle')}
                    </p>
                </div>
                {galleryLoading ? <GallerySkeleton /> : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4">
                        {galleryImages?.map((image, index) => {
                        if (!image) return null;
                        return (
                            <SelectableCard
                            key={image.id}
                            isSelected={selectedImages.includes(image.id)}
                            onSelect={() => handleImageSelect(image.id)}
                            className={cn(
                                'aspect-square',
                                index === 0 && 'md:col-span-2 md:row-span-2 md:aspect-auto'
                            )}
                            >
                            <Image
                                src={image.imageUrl}
                                alt={image.description}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 50vw, 33vw"
                                data-ai-hint={image.imageHint}
                            />
                            </SelectableCard>
                        );
                        })}
                    </div>
                )}
                <div className="text-center mt-12">
                    <Button size="lg" disabled={selectedImages.length === 0}>
                        <Heart className="mr-2 h-5 w-5" />
                        Ajouter {selectedImages.length > 0 ? `(${selectedImages.length})` : ''} aux favoris
                    </Button>
                    {selectedImages.length === 0 && (
                        <p className="text-sm text-muted-foreground mt-2">
                        Cliquez sur les images pour les sélectionner.
                        </p>
                    )}
                </div>
            </div>
        </section>
    );
}
