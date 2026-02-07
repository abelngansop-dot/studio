'use client';

import Link from 'next/link';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { companyContacts } from '@/lib/company-contacts';
import Icon from './Icon';
import type { icons } from 'lucide-react';
import { CurrentYear } from './CurrentYear';
import { Button } from './ui/button';
import { Separator } from './ui/separator';

export function ContactFooter() {
    const ceo = companyContacts.find(c => c.role === 'CEO');
    const hr = companyContacts.find(c => c.role === 'Directeur des Ressources Humaines');
    const emergency = companyContacts.find(c => c.role === 'Urgence');
    const complaints = companyContacts.find(c => c.role === 'Réclamations');
    const serviceContacts = companyContacts.filter(c => c.type === 'service');

    return (
        <footer id="contact" className="bg-secondary/50 text-secondary-foreground mt-16 border-t">
            <div className="container py-12 md:py-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                    {/* Column 1: About & Management */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold font-headline text-primary">Inoublevent</h3>
                        <p className="text-sm text-muted-foreground">Organisez votre événement en toute tranquillité. Notre équipe d'experts est à votre écoute pour donner vie à vos projets.</p>
                        <div className="space-y-4 pt-2">
                           {ceo && <ContactPerson contact={ceo} />}
                           {hr && <ContactPerson contact={hr} />}
                        </div>
                    </div>

                    {/* Column 2: Service Contacts */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold font-headline">Nos Services</h3>
                        <ul className="space-y-3 text-sm">
                           {serviceContacts.map(contact => (
                               <li key={contact.id} className="flex items-center gap-3">
                                   <Icon name={contact.icon as keyof typeof icons} className="h-5 w-5 text-primary" />
                                   <div className="flex-1">
                                       <p className="font-semibold">{contact.name}</p>
                                       <a href={`mailto:${contact.email}`} className="text-muted-foreground hover:text-primary transition-colors">{contact.email}</a>
                                   </div>
                               </li>
                           ))}
                        </ul>
                    </div>

                     {/* Column 3: Legal & Emergency */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold font-headline">Support & Légal</h3>
                         <ul className="space-y-3 text-sm">
                            {emergency && (
                                <li className="flex flex-col items-start">
                                    <p className="font-semibold text-destructive">Contact d'Urgence</p>
                                    <a href={`mailto:${emergency.email}`} className="text-muted-foreground hover:text-destructive transition-colors">{emergency.email}</a>
                                </li>
                            )}
                            {complaints && (
                                <li className="flex flex-col items-start">
                                    <p className="font-semibold">Réclamations</p>
                                    <p className="text-muted-foreground">{complaints.phone}</p>
                                </li>
                            )}
                            <li className="pt-2">
                                <Button variant="link" asChild className="p-0 h-auto">
                                    <Link href="/legal">Conditions & Confidentialité</Link>
                                </Button>
                            </li>
                         </ul>
                    </div>

                    {/* Column 4: Newsletter/Social */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold font-headline">Restons Connectés</h3>
                        <p className="text-sm text-muted-foreground">Suivez-nous sur les réseaux sociaux pour ne rien manquer de nos actualités.</p>
                        <div className="flex gap-2">
                            <Button variant="outline" size="icon"><Icon name="Facebook" /></Button>
                            <Button variant="outline" size="icon"><Icon name="Instagram" /></Button>
                            <Button variant="outline" size="icon"><Icon name="Linkedin" /></Button>
                        </div>
                    </div>
                </div>

                <Separator className="my-8" />

                <div className="text-center text-sm text-muted-foreground">
                    <p>&copy; <CurrentYear /> Inoublevent. Tous droits réservés.</p>
                </div>
            </div>
        </footer>
    );
}

const ContactPerson = ({ contact }: { contact: any }) => {
    const image = PlaceHolderImages.find(p => p.id === contact.avatarId);
    return (
        <div className="flex items-center gap-3">
            {image && (
                <Image 
                    src={image.imageUrl}
                    alt={contact.name}
                    width={48}
                    height={48}
                    className="rounded-full object-cover"
                    data-ai-hint={image.imageHint}
                />
            )}
            <div>
                <p className="font-semibold text-sm">{contact.name}</p>
                <p className="text-xs text-muted-foreground">{contact.role}</p>
            </div>
        </div>
    );
};
