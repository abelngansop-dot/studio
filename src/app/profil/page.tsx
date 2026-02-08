'use client';

import { useState, useRef } from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase, useFirebaseApp } from '@/firebase';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { getAuth, deleteUser as deleteAuthUser, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ShieldAlert, Trash2, Camera } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useRouter } from 'next/navigation';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';

type UserProfileData = {
  displayName: string;
  email: string;
  photoURL: string | null;
  phone?: string | null;
  gender?: 'homme' | 'femme';
};

const profileSchema = z.object({
  displayName: z.string().min(1, 'Le nom ne peut pas être vide.'),
  phone: z.string().optional(),
  gender: z.enum(['homme', 'femme']).optional(),
});

function ProfileSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-4 w-3/4" />
      </CardHeader>
      <CardContent className="flex items-center gap-6">
        <Skeleton className="h-24 w-24 rounded-full" />
        <div className="space-y-4 flex-1">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-2/3" />
        </div>
      </CardContent>
      <CardFooter>
        <Skeleton className="h-10 w-24" />
      </CardFooter>
    </Card>
  );
}

export default function ProfilPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const app = useFirebaseApp();
  const storage = getStorage(app);
  const { toast } = useToast();
  const router = useRouter();
  
  const [isDeleting, setIsDeleting] = useState(false);
  const [isReauthRequired, setIsReauthRequired] = useState(false);
  const [password, setPassword] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile, isLoading } = useDoc<UserProfileData>(userDocRef);

  const { control, handleSubmit, formState: { isSubmitting, errors }, watch } = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    values: {
      displayName: userProfile?.displayName || '',
      phone: userProfile?.phone || '',
      gender: userProfile?.gender || undefined,
    },
    resetOptions: {
      keepDirtyValues: true,
    },
    mode: 'onChange',
  });

  const onSubmit = async (data: z.infer<typeof profileSchema>) => {
    if (!userDocRef) return;
    try {
      const updateData = {
          displayName: data.displayName,
          phone: data.phone || null,
          gender: data.gender || null
      }
      await updateDoc(userDocRef, updateData);
      toast({ title: 'Profil mis à jour avec succès !' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'La mise à jour a échoué.' });
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !storage) return;

    setIsUploading(true);
    setUploadProgress(0);

    const filePath = `profile-pictures/${user.uid}/${file.name}`;
    const fileRef = storageRef(storage, filePath);
    const uploadTask = uploadBytesResumable(fileRef, file);

    uploadTask.on('state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        setIsUploading(false);
        toast({ variant: 'destructive', title: 'Erreur de téléversement', description: 'Impossible de téléverser l\'image.' });
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
          if(userDocRef) {
            await updateDoc(userDocRef, { photoURL: downloadURL });
          }
          setIsUploading(false);
          toast({ title: 'Photo de profil mise à jour !' });
        });
      }
    );
  };
  
  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser || !firestore) {
        toast({ variant: 'destructive', title: 'Erreur', description: 'Utilisateur non trouvé.' });
        setIsDeleting(false);
        return;
    }

    try {
        if(isReauthRequired) {
            if(!password) {
                 toast({ variant: 'destructive', title: 'Erreur', description: 'Le mot de passe est requis.' });
                 setIsDeleting(false);
                 return;
            }
            const credential = EmailAuthProvider.credential(currentUser.email!, password);
            await reauthenticateWithCredential(currentUser, credential);
        }

        await deleteDoc(doc(firestore, 'users', currentUser.uid));
        await deleteAuthUser(currentUser);

        toast({ title: 'Compte supprimé', description: 'Votre compte et vos données ont été supprimés.' });
        router.push('/');
    } catch (error: any) {
        if(error.code === 'auth/requires-recent-login') {
            setIsReauthRequired(true);
            toast({ variant: 'destructive', title: 'Action requise', description: 'Veuillez entrer votre mot de passe pour confirmer.' });
        } else {
            toast({ variant: 'destructive', title: 'Erreur', description: 'La suppression a échoué. Veuillez réessayer.' });
        }
        setIsDeleting(false);
    }
  };

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (!userProfile) {
    return <div>Profil non trouvé.</div>;
  }

  const userInitial = userProfile.displayName?.charAt(0) || userProfile.email?.charAt(0) || '?';

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-3xl mx-auto">
        <form onSubmit={handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl font-bold font-headline">Mon Profil</CardTitle>
              <CardDescription>Gérez vos informations personnelles et vos préférences.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative group">
                    <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/png, image/jpeg" hidden/>
                    <Avatar className="h-24 w-24 text-3xl cursor-pointer" onClick={handleAvatarClick}>
                      <AvatarImage src={userProfile.photoURL || undefined} alt={userProfile.displayName || ''} />
                      <AvatarFallback>{userInitial.toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" onClick={handleAvatarClick}>
                        <Camera className="h-8 w-8 text-white" />
                    </div>
                    {isUploading && (
                        <div className="absolute inset-0 bg-black/70 rounded-full flex flex-col items-center justify-center">
                           <Loader2 className="h-8 w-8 text-white animate-spin" />
                           <Progress value={uploadProgress} className="h-1 w-16 mt-2 bg-gray-600" />
                        </div>
                    )}
                </div>
                <div className="w-full space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Nom d'affichage</Label>
                    <Controller
                      name="displayName"
                      control={control}
                      render={({ field }) => <Input id="displayName" {...field} />}
                    />
                    {errors.displayName && <p className="text-sm text-destructive">{errors.displayName.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={userProfile.email} disabled />
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                  <div className="space-y-2">
                      <Label htmlFor="phone">Numéro de téléphone</Label>
                      <Controller
                          name="phone"
                          control={control}
                          render={({ field }) => <Input id="phone" type="tel" placeholder="+237 6 XX XX XX XX" {...field} value={field.value || ''} />}
                      />
                      {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="gender">Genre</Label>
                      <Controller
                          name="gender"
                          control={control}
                          render={({ field }) => (
                            <RadioGroup onValueChange={field.onChange} value={field.value} className="flex gap-4 pt-2">
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="homme" id="male" />
                                    <Label htmlFor="male">Homme</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="femme" id="female" />
                                    <Label htmlFor="female">Femme</Label>
                                </div>
                            </RadioGroup>
                          )}
                      />
                  </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isSubmitting || isUploading}>
                {(isSubmitting || isUploading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Enregistrer les modifications
              </Button>
            </CardFooter>
          </Card>
        </form>

        <div className="mt-12 pt-8 border-t border-destructive/20">
          <h3 className="text-lg font-semibold text-destructive flex items-center gap-2">
              <ShieldAlert className="h-5 w-5" />
              Zone de Danger
          </h3>
          <p className="text-sm text-destructive/90 my-2">
              La suppression de votre compte est une action irréversible. Toutes vos données, y compris vos réservations, seront définitivement effacées.
          </p>
           <AlertDialog>
              <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Supprimer mon compte
                  </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                  <AlertDialogHeader>
                      <AlertDialogTitle>Êtes-vous absolument sûr ?</AlertDialogTitle>
                      <AlertDialogDescription>
                         Cette action est irréversible et supprimera définitivement votre compte et vos données.
                         {isReauthRequired && (
                             <div className="mt-4 space-y-2">
                                 <Label htmlFor="password">Veuillez entrer votre mot de passe pour confirmer</Label>
                                 <Input 
                                  id="password" 
                                  type="password" 
                                  value={password}
                                  onChange={(e) => setPassword(e.target.value)}
                                  placeholder="********"
                                  />
                             </div>
                         )}
                      </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                      <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteAccount} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
                          {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Oui, supprimer mon compte
                      </AlertDialogAction>
                  </AlertDialogFooter>
              </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}
