'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function LegalPage() {
    return (
        <div className="container mx-auto py-8">
            <h1 className="text-4xl font-bold font-headline tracking-tight mb-8 text-center">Informations Légales</h1>
            <Tabs defaultValue="terms" className="max-w-4xl mx-auto">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="terms">Conditions d'Utilisation</TabsTrigger>
                    <TabsTrigger value="privacy">Politique de Confidentialité</TabsTrigger>
                </TabsList>
                <TabsContent value="terms">
                    <Card>
                        <CardHeader>
                            <CardTitle>Conditions Générales d'Utilisation</CardTitle>
                            <CardDescription>Dernière mise à jour : 24 Juillet 2024</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 prose max-w-none">
                            <p>Bienvenue sur Inoubliable Events. En utilisant nos services, vous acceptez les présentes conditions. Veuillez les lire attentivement.</p>
                            
                            <h2>1. Utilisation de nos Services</h2>
                            <p>Vous devez suivre toutes les règles mises à votre disposition dans les Services. N’utilisez pas nos Services de façon abusive. Par exemple, n’essayez pas de les perturber ou d'y accéder par une autre méthode que l'interface et les instructions que nous vous fournissons.</p>

                            <h2>2. Votre Compte Inoubliable Events</h2>
                            <p>Pour utiliser certains de nos Services, vous devrez peut-être créer un compte. Vous êtes responsable de l'activité de votre compte et de la protection du mot de passe que vous utilisez.</p>

                             <h2>3. Contenu et Propriété Intellectuelle</h2>
                            <p>Tout le contenu présent sur la plateforme (textes, images, logos) est la propriété exclusive d'Inoubliable Events et est protégé par les lois sur la propriété intellectuelle.</p>
                            
                            <h2>4. Modification et Résiliation de nos Services</h2>
                            <p>Nous pouvons modifier les présentes conditions ou toute condition supplémentaire s’appliquant à un Service pour, par exemple, refléter des changements de la loi ou de nos Services. Nous vous recommandons de consulter régulièrement les conditions.</p>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="privacy">
                     <Card>
                        <CardHeader>
                            <CardTitle>Politique de Confidentialité</CardTitle>
                             <CardDescription>Dernière mise à jour : 24 Juillet 2024</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 prose max-w-none">
                            <p>Votre vie privée est importante pour nous. Cette politique explique quelles données nous collectons et pourquoi.</p>
                            
                            <h2>1. Collecte des informations</h2>
                            <p>Nous collectons les informations que vous nous fournissez directement, telles que votre nom, votre adresse e-mail et votre numéro de téléphone lorsque vous créez un compte ou faites une demande de réservation.</p>
                            
                             <h2>2. Utilisation des informations</h2>
                            <p>Nous utilisons les informations que nous collectons pour fournir, maintenir et améliorer nos services, pour vous contacter au sujet de votre réservation et pour vous informer des mises à jour.</p>
                            
                             <h2>3. Partage des informations</h2>
                            <p>Nous ne partageons pas vos informations personnelles avec des entreprises, des organisations ou des personnes en dehors de Inoubliable Events, sauf si cela est nécessaire pour répondre à votre demande de service (par exemple, partager vos besoins avec un prestataire de service).</p>
                            
                             <h2>4. Sécurité des informations</h2>
                            <p>Nous travaillons dur pour protéger Inoubliable Events et nos utilisateurs contre tout accès non autorisé ou toute modification, divulgation ou destruction non autorisée des informations que nous détenons.</p>
                            
                             <h2>5. Suppression de votre compte</h2>
                            <p>Vous pouvez demander la suppression de votre compte et des données associées à tout moment depuis votre page de profil. La suppression est définitive et irréversible.</p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
