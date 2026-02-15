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
                            <p>Bienvenue sur Inoublevents. En accédant ou en utilisant notre plateforme, vous acceptez de vous conformer aux présentes Conditions Générales d’Utilisation (CGU). Si vous n’acceptez pas ces conditions, veuillez ne pas utiliser l’application.</p>

                            <h2>2. Description du Service</h2>
                            <p>Inoublevents est une plateforme de mise en relation (marketplace) qui permet à des utilisateurs (ci-après "Clients") de consulter et réserver des services événementiels proposés par des prestataires indépendants (ci-après "Prestataires" ou "Boutiques"). Inoublevents agit en tant qu'intermédiaire et ne fait pas partie du contrat de service entre le Client et le Prestataire.</p>

                            <h2>3. Accès et Compte Utilisateur</h2>
                            <p>L'inscription est requise pour accéder à certaines fonctionnalités. Chaque utilisateur est responsable de la confidentialité de ses identifiants.</p>
                            <p>En créant une boutique, un utilisateur accepte de changer son rôle de "Client" à "Shop Admin" (Administrateur de Boutique) et se voit confier la gestion de sa boutique sur la plateforme.</p>
                            <p>Les comptes administrateurs de la plateforme (`admin`, `superadmin`) sont strictement réservés aux utilisateurs autorisés par Inoublevents.</p>

                            <h2>4. Obligations des Utilisateurs (Clients)</h2>
                            <p>Le Client s'engage à fournir des informations exactes lors de la réservation et à respecter les conditions établies par le Prestataire. Toute annulation ou modification doit suivre les procédures indiquées.</p>
                            
                            <h2>5. Obligations des Prestataires (Propriétaires de Boutiques)</h2>
                            <p>En créant une boutique, le Prestataire s'engage à :</p>
                            <ul>
                                <li>Fournir des informations exactes et complètes sur sa boutique et ses services.</li>
                                <li>Honorer les réservations confirmées par les Clients.</li>
                                <li>Gérer sa boutique de manière professionnelle et réactive.</li>
                                <li>Être seul responsable du contenu publié sur sa page (textes, images, tarifs).</li>
                            </ul>

                            <h2>6. Propriété Intellectuelle</h2>
                            <p>Tout le contenu de la plateforme Inoublevents (logo, design, textes) est notre propriété exclusive. Le contenu fourni par les Prestataires (photos de services, descriptions) reste leur propriété, mais ils nous accordent une licence d'utilisation non-exclusive pour l'afficher sur la plateforme.</p>

                            <h2>7. Limitation de Responsabilité</h2>
                            <p>Inoublevents, en tant qu'intermédiaire, ne pourra être tenue responsable des litiges entre un Client et un Prestataire, de la qualité des services fournis, ou de tout dommage résultant de la prestation. Notre responsabilité se limite à la fourniture et à la maintenance de la plateforme.</p>

                            <h2>8. Modifications des Conditions</h2>
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
                            <p>Nous collectons les informations suivantes :</p>
                            <ul>
                                <li>**Informations des Clients :** nom, email, numéro de téléphone, et détails des réservations (type d'événement, services, date, lieu).</li>
                                <li>**Informations des Prestataires :** nom du propriétaire, nom de la boutique, services proposés, localisation, et numéro de téléphone de la boutique.</li>
                                <li>**Informations techniques :** appareil utilisé, adresse IP, et comportement de navigation sur la plateforme.</li>
                            </ul>
                            
                             <h2>2. Utilisation des Données</h2>
                             <p>Les informations collectées sont utilisées pour :</p>
                            <ul>
                                <li>Permettre la création et la gestion des comptes Client et Prestataire.</li>
                                <li>Traiter les demandes de réservation et mettre en relation Clients et Prestataires.</li>
                                <li>Communiquer avec vous via email ou WhatsApp pour les confirmations et le suivi.</li>
                                <li>Améliorer l’expérience utilisateur et la sécurité de l’application.</li>
                                <li>Produire des analyses internes anonymisées pour améliorer nos services.</li>
                            </ul>
                            
                             <h2>3. Partage et Transmission des Données</h2>
                            <p>Nous partageons certaines de vos données dans les cas suivants :</p>
                            <ul>
                                <li>**Lors d'une réservation :** Les informations de contact et les détails de la demande du Client (nom, email, téléphone, détails de l'événement) sont transmis au Prestataire concerné pour qu'il puisse exécuter le service.</li>
                                <li>**Informations Publiques :** Les informations de la boutique d'un Prestataire (nom, services, localisation, téléphone de la boutique) sont publiques et visibles par tous les visiteurs de la plateforme.</li>
                                <li>**Obligations légales :** Nous pouvons être amenés à transmettre vos données pour nous conformer à la loi applicable (au Cameroun ou internationalement).</li>
                            </ul>
                            
                             <h2>4. Conservation des Données</h2>
                            <p>Les données sont conservées uniquement le temps nécessaire à l’utilisation du service et conformément aux obligations légales. Les utilisateurs peuvent demander la suppression de leurs informations, sous réserve des contraintes légales.</p>
                             
                             <h2>5. Sécurité des Données</h2>
                            <p>Nous mettons en place des mesures techniques et organisationnelles (comme les règles de sécurité Firestore) pour protéger vos données contre la perte, l'accès non autorisé ou toute modification.</p>

                            <h2>6. Droits de l’Utilisateur</h2>
                            <p>Conformément à la législation en vigueur, vous pouvez :</p>
                            <ul>
                                <li>Accéder à vos données personnelles via votre page de profil.</li>
                                <li>Demander la correction ou la suppression de vos données.</li>
                                <li>Retirer votre consentement à tout moment pour le traitement de vos données (ce qui peut limiter l'accès à certains services).</li>
                            </ul>

                             <h2>7. Contact</h2>
                            <p>Pour toute question concernant la confidentialité ou les CGU :</p>
                            <p>Email : inoublevents@gmail.com</p>
                            <p>Téléphone/WhatsApp : +237699264201</p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
