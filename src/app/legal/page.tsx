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

                            <h2>5. Photos de profil</h2>
                            <h3>a. Responsabilité de l’utilisateur</h3>
                            <p>L’utilisateur est responsable de la photo qu’il met en ligne. L’utilisateur doit s’assurer que sa photo ne viole aucun droit d’auteur, droit à l’image d’autrui, ou loi locale/internationale.</p>
                            <h3>b. Modification et suppression</h3>
                            <p>L’utilisateur peut modifier ou supprimer sa photo de profil à tout moment depuis son profil. La suppression de la photo entraîne la suppression de toutes les copies visibles sur l’application, sauf sauvegarde légale temporaire nécessaire au fonctionnement du système.</p>
                            <h3>c. Limitation de responsabilité de la plateforme</h3>
                            <p>La plateforme n’est pas responsable si un utilisateur télécharge une photo non conforme aux règles ci-dessus. La plateforme peut supprimer une photo de profil qui enfreint les conditions d’utilisation ou les règles de sécurité.</p>
                            <h3>d. Traitement légal</h3>
                            <p>Les photos de profil sont traitées conformément aux lois locales et internationales de protection des données, y compris la RGPD, si applicable pour des utilisateurs hors Afrique.</p>

                            <h2>6. Propriété Intellectuelle</h2>
                            <p>Tout le contenu, images, vidéos, textes, et logos présents sur l’application sont la propriété de Inoubleven et sont protégés par les lois internationales et locales sur la propriété intellectuelle. Toute reproduction non autorisée est interdite.</p>

                            <h2>7. Limitation de Responsabilité</h2>
                            <p>Inoubleven ne pourra être tenue responsable des pertes ou dommages résultant de l’utilisation de la plateforme, y compris les erreurs de réservation, interruptions de service ou pertes de données.</p>

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

                            <h2>3. Photos de profil</h2>
                            <h3>a. Collecte et utilisation des photos de profil</h3>
                            <p>Nous collectons et stockons les photos de profil fournies par les utilisateurs afin de personnaliser leur expérience sur la plateforme. Les photos de profil ne sont utilisées qu’à des fins d’identification au sein de l’application et ne seront pas vendues ni partagées avec des tiers sans consentement explicite.</p>
                            <h3>b. Stockage et sécurité</h3>
                            <p>Les photos de profil sont stockées de manière sécurisée dans nos serveurs ou services cloud (ex : Firebase Storage). Nous utilisons des protocoles de sécurité standard (chiffrement en transit et au repos) pour protéger vos images contre tout accès non autorisé.</p>
                            <h3>c. Partage et visibilité</h3>
                            <p>Les photos de profil peuvent être visibles par d’autres utilisateurs uniquement dans le cadre des interactions permises par la plateforme (ex: réservation, messagerie interne, avis). L’utilisateur peut à tout moment changer ou supprimer sa photo de profil.</p>
                            <h3>d. Consentement explicite</h3>
                            <p>En téléchargeant une photo de profil, l’utilisateur consent expressément à l’utilisation de cette photo conformément à cette politique. L’utilisateur est responsable du contenu de sa photo et s’engage à ne pas publier de contenus offensants, discriminatoires ou illégaux.</p>
                            
                             <h2>4. Partage et Transmission</h2>
                            <p>Nous ne partageons pas vos données personnelles avec des tiers sauf :</p>
                            <ul>
                                <li>Pour traiter une réservation ou paiement.</li>
                                <li>Pour se conformer à la loi applicable au Cameroun ou internationalement.</li>
                            </ul>
                            
                             <h2>5. Conservation des Données</h2>
                            <p>Les données sont conservées uniquement le temps nécessaire à l’utilisation du service et conformément aux obligations légales. Les utilisateurs peuvent demander la suppression de leurs informations.</p>
                             
                             <h2>6. Sécurité des Données</h2>
                            <p>Nous mettons en place des mesures techniques et organisationnelles pour protéger vos données contre la perte, l’accès non autorisé ou toute modification.</p>

                            <h2>7. Droits de l’Utilisateur</h2>
                            <p>Conformément à la législation camerounaise et internationale, l’utilisateur peut :</p>
                            <ul>
                                <li>Accéder à ses données personnelles.</li>
                                <li>Demander la correction ou suppression de ses données.</li>
                                <li>Retirer son consentement à tout moment pour le traitement de ses données.</li>
                            </ul>

                             <h2>8. Contact</h2>
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
