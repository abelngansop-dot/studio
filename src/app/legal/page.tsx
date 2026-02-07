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
                            <CardTitle>Conditions Générales d’Utilisation (CGU)</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 prose max-w-none">
                            <h2>1. Introduction</h2>
                            <p>Bienvenue sur Inoubleven. En accédant ou en utilisant notre plateforme, vous acceptez de vous conformer aux présentes Conditions Générales d’Utilisation. Si vous n’acceptez pas ces conditions, veuillez ne pas utiliser l’application.</p>

                            <h2>2. Description du Service</h2>
                            <p>Inoubleven fournit une plateforme permettant aux utilisateurs de consulter des services, faire des réservations, et entrer en contact avec les prestataires. L’application peut collecter certaines informations personnelles pour faciliter ces services.</p>

                            <h2>3. Accès et Compte Utilisateur</h2>
                            <p>Chaque utilisateur est responsable de la confidentialité de ses identifiants (email, mot de passe).</p>
                            <p>Vous devez fournir des informations exactes et à jour pour l’inscription.</p>
                            <p>Les utilisateurs peuvent accéder à leur historique, modifier leurs réservations et gérer leurs préférences personnelles.</p>
                            <p>Les comptes administrateurs sont strictement réservés aux utilisateurs autorisés. Tout accès non autorisé est interdit et peut faire l’objet de poursuites.</p>

                            <h2>4. Obligations de l’Utilisateur</h2>
                            <p>Ne pas utiliser l’application à des fins illégales.</p>
                            <p>Ne pas tenter de contourner les mesures de sécurité.</p>
                            <p>Respecter les autres utilisateurs et le contenu publié.</p>

                            <h2>5. Propriété Intellectuelle</h2>
                            <p>Tout le contenu, images, vidéos, textes, et logos présents sur l’application sont la propriété de Inoubleven et sont protégés par les lois internationales et locales sur la propriété intellectuelle. Toute reproduction non autorisée est interdite.</p>

                            <h2>6. Limitation de Responsabilité</h2>
                            <p>Inoubleven ne pourra être tenue responsable des pertes ou dommages résultant de l’utilisation de la plateforme, y compris les erreurs de réservation, interruptions de service ou pertes de données.</p>

                            <h2>7. Modifications des Conditions</h2>
                            <p>Nous nous réservons le droit de modifier ces CGU à tout moment. Les utilisateurs seront informés des changements et l’utilisation continue de l’application constitue l’acceptation des nouvelles conditions.</p>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="privacy">
                     <Card>
                        <CardHeader>
                            <CardTitle>Politique de Confidentialité</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 prose max-w-none">
                            <h2>1. Collecte des Informations</h2>
                            <p>Nous collectons :</p>
                            <ul>
                                <li>Informations personnelles : nom, email, numéro de téléphone, adresse.</li>
                                <li>Informations liées aux réservations : services choisis, date et heure.</li>
                                <li>Informations techniques : appareil utilisé, IP, comportement dans l’application.</li>
                            </ul>
                            
                             <h2>2. Utilisation des Données</h2>
                             <p>Les informations collectées sont utilisées pour :</p>
                            <ul>
                                <li>Traiter vos réservations et demandes.</li>
                                <li>Communiquer avec vous via email ou WhatsApp pour confirmations.</li>
                                <li>Améliorer l’expérience utilisateur et la sécurité de l’application.</li>
                                <li>Produire des analyses internes anonymisées pour améliorer nos services.</li>
                            </ul>
                            
                             <h2>3. Partage et Transmission</h2>
                            <p>Nous ne partageons pas vos données personnelles avec des tiers sauf :</p>
                            <ul>
                                <li>Pour traiter une réservation ou paiement.</li>
                                <li>Pour se conformer à la loi applicable au Cameroun ou internationalement.</li>
                            </ul>
                            
                             <h2>4. Conservation des Données</h2>
                            <p>Les données sont conservées uniquement le temps nécessaire à l’utilisation du service et conformément aux obligations légales. Les utilisateurs peuvent demander la suppression de leurs informations.</p>
                             
                             <h2>5. Sécurité des Données</h2>
                            <p>Nous mettons en place des mesures techniques et organisationnelles pour protéger vos données contre la perte, l’accès non autorisé ou toute modification.</p>

                            <h2>6. Droits de l’Utilisateur</h2>
                            <p>Conformément à la législation camerounaise et internationale, l’utilisateur peut :</p>
                            <ul>
                                <li>Accéder à ses données personnelles.</li>
                                <li>Demander la correction ou suppression de ses données.</li>
                                <li>Retirer son consentement à tout moment pour le traitement de ses données.</li>
                            </ul>

                             <h2>7. Contact</h2>
                            <p>Pour toute question concernant la confidentialité ou les CGU :</p>
                            <p>Email : inoubleven@gmail.com</p>
                            <p>Téléphone/WhatsApp : +237699264201</p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
