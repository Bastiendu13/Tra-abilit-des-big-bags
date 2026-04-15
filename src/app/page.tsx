"use client";

import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { User, Shield } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useUserProfile } from '@/hooks/use-user-profile';
import { useRouter } from 'next/navigation';

export default function Home() {
  const heroImage = PlaceHolderImages.find(p => p.id === 'hero-image');
  const { setProfile } = useUserProfile();
  const router = useRouter();

  const handleProfileSelect = (profile: 'administrateur' | 'utilisateur') => {
    setProfile(profile);
    if (profile === 'administrateur') {
      router.push('/config');
    } else {
      router.push('/scan');
    }
  };

  return (
    <div className="relative w-full h-screen bg-background">
      {heroImage && (
         <Image
            src={heroImage.imageUrl}
            alt={heroImage.description}
            fill
            className="object-cover opacity-10 dark:opacity-20"
            data-ai-hint={heroImage.imageHint}
            priority
        />
      )}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
        <div className="p-8 bg-background/80 backdrop-blur-sm rounded-xl border border-border/20 shadow-2xl">
          <h1 className="text-5xl md:text-7xl font-bold text-primary mb-4 font-headline tracking-tight">
            TraceFacile
          </h1>
          <p className="text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto mb-8">
            Suivez la traçabilité de vos produits en toute simplicité. Scannez, analysez et exportez les données en quelques clics.
          </p>
          <div className="space-y-4">
            <p className="font-semibold">Veuillez sélectionner votre profil pour commencer :</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={() => handleProfileSelect('administrateur')} size="lg" className="shadow-lg">
                    <Shield className="mr-2 h-5 w-5" />
                    Administrateur
                </Button>
                <Button onClick={() => handleProfileSelect('utilisateur')} size="lg" variant="secondary" className="shadow-lg">
                    <User className="mr-2 h-5 w-5" />
                    Utilisateur
                </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
