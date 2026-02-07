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
        name: 'Jean-Pierre Dupont',
        role: 'CEO',
        avatarId: 'contact-ceo',
        type: 'management'
    },
    {
        id: 'hr',
        name: 'Amina Ndiaye',
        role: 'Directeur des Ressources Humaines',
        avatarId: 'contact-hr',
        type: 'management'
    },
    {
        id: 'service-photo',
        name: 'Service Photographie',
        role: 'Responsable',
        email: 'photo@inoubliable.com',
        avatarId: 'avatar-1',
        type: 'service',
        icon: 'Camera'
    },
    {
        id: 'service-video',
        name: 'Service Vidéo & Drone',
        role: 'Responsable',
        email: 'video@inoubliable.com',
        avatarId: 'avatar-2',
        type: 'service',
        icon: 'Video'
    },
     {
        id: 'service-event',
        name: 'Service Événementiel',
        role: 'Responsable',
        email: 'event@inoubliable.com',
        avatarId: 'avatar-3',
        type: 'service',
        icon: 'PartyPopper'
    },
    {
        id: 'emergency',
        name: 'Contact d\'urgence',
        role: 'Urgence',
        email: 'urgence@inoubliable.com',
        avatarId: 'none',
        type: 'support'
    },
    {
        id: 'complaints',
        name: 'Service des réclamations',
        role: 'Réclamations',
        phone: '+237 600 00 00 02',
        avatarId: 'none',
        type: 'support'
    }
]
