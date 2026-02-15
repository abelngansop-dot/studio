'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useShop } from "@/hooks/use-shop-admin";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Trash2 } from "lucide-react";
import { useState } from "react";

export default function ShopSettingsPage() {
    const { shop } = useShop();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // In a real implementation, you would use react-hook-form here
    // For now, we'll use simple state
    const [shopName, setShopName] = useState(shop?.name || '');

    const handleSaveChanges = () => {
        setIsSubmitting(true);
        // Here you would call a function to update the shop in Firestore
        // For example: updateDocumentNonBlocking(shopRef, { name: shopName });
        
        setTimeout(() => {
            toast({
                title: "Paramètres sauvegardés !",
                description: "Les informations de votre boutique ont été mises à jour.",
            });
            setIsSubmitting(false);
        }, 1500);
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
                <TabsList>
                    <TabsTrigger value="general">Général</TabsTrigger>
                    <TabsTrigger value="subscription" disabled>Abonnement</TabsTrigger>
                    <TabsTrigger value="users" disabled>Utilisateurs</TabsTrigger>
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
                        <CardContent>
                             <Button onClick={handleSaveChanges} disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Enregistrer les modifications
                            </Button>
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
        </div>
    )
}
