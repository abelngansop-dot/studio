export type CompanyContact = {
    id: string;
    name: string;
    role: string;
    email?: string;
    phone?: string;
    avatarId: string;
    type: 'management' | 'service' | 'support';
    icon?: string;
}

export const companyContacts: CompanyContact[] = [
    {
        id: 'ceo',
        name: 'Abel Ngansop',
        role: 'CEO',
        avatarId: 'contact-ceo',
        type: 'management'
    },
    {
        id: 'hr',
        name: 'Ivan nono',
        role: 'Directeur',
        avatarId: 'contact-hr',
        type: 'management'
    },
    {
        id: 'service-photo',
        name: 'Service Photographie',
        role: 'Responsable',
        email: 'photo@kabapo.com',
        avatarId: 'avatar-1',
        type: 'service',
        icon: 'Camera'
    },
    {
        id: 'service-video',
        name: 'Service Vidéo & Drone',
        role: 'Responsable',
        email: 'video@kabapo.com',
        avatarId: 'avatar-2',
        type: 'service',
        icon: 'Video'
    },
     {
        id: 'service-event',
        name: 'Service Événementiel',
        role: 'Responsable',
        email: 'event@kabapo.com',
        avatarId: 'avatar-3',
        type: 'service',
        icon: 'PartyPopper'
    },
    {
        id: 'emergency',
        name: 'Contact d\'urgence & Légal',
        role: 'Support',
        email: 'contact@kabapo.com',
        avatarId: 'none',
        type: 'support'
    },
    {
        id: 'complaints',
        name: 'Réclamations & WhatsApp',
        role: 'Support',
        phone: '+237699264201',
        avatarId: 'none',
        type: 'support'
    }
]
