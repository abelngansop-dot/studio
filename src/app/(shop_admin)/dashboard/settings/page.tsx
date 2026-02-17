'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useShop } from "@/hooks/use-shop-admin";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Trash2, Image as ImageIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { useFirestore } from "@/firebase/provider";
import { doc } from 'firebase/firestore';
import { updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import Image from "next/image";

export default function ShopSettingsPage() {
    const { shop } = useShop();
    const { toast } = useToast();
    const firestore = useFirestore();

    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [shopName, setShopName] = useState(shop?.name || '');
    const [imageUrl, setImageUrl] = useState(shop?.imageUrl || '');

    useEffect(() => {
        if(shop) {
            setShopName(shop.name);
            setImageUrl(shop.imageUrl || '');
        }
    }, [shop])

    const handleSaveChanges = () => {
        if (!firestore || !shop) return;

        setIsSubmitting(true);
        const shopRef = doc(firestore, 'shops', shop.id);

        updateDocumentNonBlocking(shopRef, { 
            name: shopName,
            imageUrl: imageUrl 
        });
        
        // No need for a timeout, the `useShop` hook will provide the updated data
        toast({
            title: "Paramètres sauvegardés !",
            description: "Les informations de votre boutique ont été mises à jour.",
        });
        setIsSubmitting(false);
    }

    if (!shop) {
        return null; // Or a loading skeleton
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline">Paramètres de la Boutique</h1>
                <p className="text-muted-foreground">Gérez les informations et les configurations de votre boutique.</p>
            </div>
            <Tabs defaultValue="general">
                <TabsList className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 w-full sm:w-auto max-w-full">
                    <TabsTrigger value="general">Général</TabsTrigger>
                    <TabsTrigger value="visuals">Apparence</TabsTrigger>
                    <TabsTrigger value="subscription" disabled>Abonnement</TabsTrigger>
                    <TabsTrigger value="danger_zone">Zone de Danger</TabsTrigger>
                </TabsList>

                <TabsContent value="general">
                    <Card>
                        <CardHeader>
                            <CardTitle>Informations générales</CardTitle>
                            <CardDescription>Mettez à jour le nom public de votre boutique et vos coordonnées.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="shop-name">Nom de la boutique</Label>
                                <Input id="shop-name" value={shopName} onChange={(e) => setShopName(e.target.value)} />
                            </div>
                            {/* Add other fields like phone, address etc. here */}
                        </CardContent>
                    </Card>
                </TabsContent>
                
                <TabsContent value="visuals">
                    <Card>
                        <CardHeader>
                            <CardTitle>Logo / Image de la boutique</CardTitle>
                            <CardDescription>Cette image sera affichée sur la page de votre boutique et dans l'en-tête de votre tableau de bord.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="shop-image-url">URL de l'image</Label>
                                <Input id="shop-image-url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://exemple.com/logo.png" />
                            </div>
                            <Label>Aperçu</Label>
                            <div className="w-32 h-32 relative rounded-md overflow-hidden border-2 border-dashed flex items-center justify-center bg-muted">
                                {imageUrl ? (
                                    <Image src={imageUrl} alt="Aperçu du logo" fill className="object-cover" />
                                ) : (
                                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                
                <TabsContent value="danger_zone">
                     <Card className="border-destructive">
                        <CardHeader>
                            <CardTitle className="text-destructive">Zone de Danger</CardTitle>
                            <CardDescription>Actions irréversibles concernant votre boutique.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                           <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-lg border border-destructive p-4">
                                <div>
                                    <h3 className="font-semibold">Supprimer cette boutique</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Cette action est définitive et supprimera toutes les données associées.
                                    </p>
                                </div>
                                <Button variant="destructive" className="mt-2 sm:mt-0" onClick={() => toast({variant: 'destructive', title: "Action non disponible", description: "La suppression de boutique sera bientôt disponible."})}>
                                    <Trash2 className="mr-2 h-4 w-4"/>
                                    Supprimer la boutique
                                </Button>
                           </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
             <div className="mt-6">
                 <Button onClick={handleSaveChanges} disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Enregistrer les modifications
                </Button>
            </div>
        </div>
    )
}
