'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore } from '@/firebase/provider';
import { doc, collection, writeBatch, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Store } from 'lucide-react';

export default function CreateShopPage() {
    const [shopName, setShopName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { user } = useUser();
    const firestore = useFirestore();
    const router = useRouter();
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !firestore || !shopName.trim()) {
            toast({
                variant: 'destructive',
                title: 'Erreur',
                description: 'Le nom de la boutique est obligatoire.'
            });
            return;
        }

        setIsSubmitting(true);

        try {
            const batch = writeBatch(firestore);

            // 1. Create the new shop document
            const newShopRef = doc(collection(firestore, 'shops'));
            const newShopData = {
                id: newShopRef.id,
                name: shopName.trim(),
                ownerId: user.uid,
                status: 'pending_setup',
                subscriptionPlan: 'none',
                createdAt: serverTimestamp()
            };
            batch.set(newShopRef, newShopData);

            // 2. Update the user's profile
            const userRef = doc(firestore, 'users', user.uid);
            batch.update(userRef, {
                role: 'shop_admin',
                shopId: newShopRef.id
            });

            // 3. Commit the batch
            await batch.commit();
            
            toast({
                title: 'Boutique créée !',
                description: 'Vous allez être redirigé vers votre nouveau tableau de bord.'
            });

            router.push('/dashboard');

        } catch (error) {
            console.error("Error creating shop: ", error);
            toast({
                variant: 'destructive',
                title: 'Erreur inattendue',
                description: 'Une erreur est survenue lors de la création de votre boutique. Veuillez réessayer.'
            });
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto py-12">
            <div className="max-w-2xl mx-auto">
                <Card>
                    <CardHeader className="text-center">
                        <Store className="mx-auto h-12 w-12 text-primary mb-4" />
                        <CardTitle className="text-3xl font-bold font-headline">Proposez vos services</CardTitle>
                        <CardDescription className="text-lg text-muted-foreground pt-2">
                            Créez votre propre boutique sur Inoublevents pour commencer à proposer vos services.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="shop-name" className="text-base">Nom de votre boutique</Label>
                                <Input
                                    id="shop-name"
                                    placeholder="Ex: Les Merveilles de Sophie"
                                    value={shopName}
                                    onChange={(e) => setShopName(e.target.value)}
                                    disabled={isSubmitting}
                                    required
                                    className="h-12 text-base"
                                />
                            </div>
                            <Button type="submit" className="w-full h-12 text-base sm:text-lg" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                ) : (
                                    "Créer ma boutique"
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
