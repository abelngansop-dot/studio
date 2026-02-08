'use client';

import { useCollection } from '@/firebase/firestore/use-collection';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import { useFirestore, useMemoFirebase } from '@/firebase/provider';
import { deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { DataTable } from '@/components/ui/data-table';
import { columns as serviceColumns } from './columns';
import { columns as eventTypeColumns } from './event-types-columns';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, ChevronDown } from 'lucide-react';
import { ServiceDialog } from './service-dialog';
import { EventTypeDialog } from './event-type-dialog';
import { useState } from 'react';
import type { Service } from './columns';
import type { EventType } from './event-types-columns';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function CataloguePage() {
  const firestore = useFirestore();
  const { toast } = useToast();

  // State for services
  const [isServiceDialogOpen, setIsServiceDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);

  // State for event types
  const [isEventTypeDialogOpen, setIsEventTypeDialogOpen] = useState(false);
  const [selectedEventType, setSelectedEventType] = useState<EventType | null>(null);
  const [eventTypeToDelete, setEventTypeToDelete] = useState<EventType | null>(null);

  // Data fetching
  const servicesQuery = useMemoFirebase(() => firestore && query(collection(firestore, 'services'), orderBy('name', 'asc')), [firestore]);
  const { data: services, isLoading: servicesLoading } = useCollection<Service>(servicesQuery);
  
  const eventTypesQuery = useMemoFirebase(() => firestore && query(collection(firestore, 'eventTypes'), orderBy('name', 'asc')), [firestore]);
  const { data: eventTypes, isLoading: eventTypesLoading } = useCollection<EventType>(eventTypesQuery);

  // Handlers for Services
  const handleEditService = (service: Service) => {
    setSelectedService(service);
    setIsServiceDialogOpen(true);
  }

  const handleDeleteServiceRequest = (service: Service) => {
    setServiceToDelete(service);
  }
  
  const handleServiceDialogChange = (open: boolean) => {
    setIsServiceDialogOpen(open);
    if (!open) {
      setSelectedService(null);
    }
  }

  const handleDeleteServiceConfirm = () => {
    if (!firestore || !serviceToDelete) return;
    const serviceRef = doc(firestore, 'services', serviceToDelete.id);
    deleteDocumentNonBlocking(serviceRef);
    toast({ title: "Service supprimé", description: `Le service "${serviceToDelete.name}" a été supprimé.`});
    setServiceToDelete(null);
  }

  // Handlers for Event Types
  const handleEditEventType = (eventType: EventType) => {
    setSelectedEventType(eventType);
    setIsEventTypeDialogOpen(true);
  }
  
  const handleEventTypeDialogChange = (open: boolean) => {
    setIsEventTypeDialogOpen(open);
    if (!open) {
      setSelectedEventType(null);
    }
  }

  const handleDeleteEventTypeRequest = (eventType: EventType) => {
    setEventTypeToDelete(eventType);
  }

  const handleDeleteEventTypeConfirm = () => {
    if (!firestore || !eventTypeToDelete) return;
    const eventTypeRef = doc(firestore, 'eventTypes', eventTypeToDelete.id);
    deleteDocumentNonBlocking(eventTypeRef);
    toast({ title: "Type d'événement supprimé", description: `Le type "${eventTypeToDelete.name}" a été supprimé.`});
    setEventTypeToDelete(null);
  }

  return (
    <AlertDialog open={!!serviceToDelete || !!eventTypeToDelete} onOpenChange={(open) => {
      if (!open) {
        setServiceToDelete(null);
        setEventTypeToDelete(null);
      }
    }}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Catalogue</h2>
            <p className="text-muted-foreground">
              Gérez les services et types d'événements proposés par Inoublevents.
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Ajouter
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => { setSelectedService(null); setIsServiceDialogOpen(true); }}>
                Ajouter un service
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setSelectedEventType(null); setIsEventTypeDialogOpen(true); }}>
                Ajouter un type d'événement
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Tabs defaultValue="services">
          <TabsList>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="eventTypes">Types d'événement</TabsTrigger>
          </TabsList>
          <TabsContent value="services">
            <Card>
              <CardContent className="pt-6">
                <DataTable columns={serviceColumns(handleEditService, handleDeleteServiceRequest)} data={services || []} />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="eventTypes">
            <Card>
              <CardContent className="pt-6">
                <DataTable columns={eventTypeColumns(handleEditEventType, handleDeleteEventTypeRequest)} data={eventTypes || []} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <ServiceDialog 
          isOpen={isServiceDialogOpen} 
          setIsOpen={handleServiceDialogChange}
          service={selectedService}
        />
        <EventTypeDialog 
          isOpen={isEventTypeDialogOpen}
          setIsOpen={handleEventTypeDialogChange}
          eventType={selectedEventType}
        />
      </div>

       <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                <AlertDialogDescription>
                    Cette action est irréversible. L'élément <span className="font-semibold">{serviceToDelete?.name || eventTypeToDelete?.name}</span> sera définitivement supprimé.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={serviceToDelete ? handleDeleteServiceConfirm : handleDeleteEventTypeConfirm} className="bg-destructive hover:bg-destructive/90">Supprimer</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
  );
}
