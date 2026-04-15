"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserProfile } from '@/hooks/use-user-profile';
import { useSessionConfig } from '@/hooks/use-session-config';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronRight, Settings, ScanLine, CheckCircle, XCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
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
} from "@/components/ui/alert-dialog"

const SML_OPTIONS = Array.from({ length: 8 }, (_, i) => `SML${i + 1}`);
const TREMIE_OPTIONS = Array.from({ length: 6 }, (_, i) => `Trémie ${i + 1}`);

export default function ConfigPage() {
  const { profile, isLoaded: profileLoaded } = useUserProfile();
  const { config, setConfig, clearConfig, isLoaded: configLoaded } = useSessionConfig();
  const router = useRouter();

  const [selectedSml, setSelectedSml] = useState<string | null>(null);
  const [selectedTremie, setSelectedTremie] = useState<string | null>(null);

  useEffect(() => {
    // Redirect if not admin or profile not loaded yet
    if (profileLoaded && profile !== 'administrateur') {
      router.push('/');
    }
  }, [profileLoaded, profile, router]);
  
  useEffect(() => {
    // Pre-fill selection from context
    if (configLoaded && config.sml) {
        setSelectedSml(config.sml);
    }
    if (configLoaded && config.tremie) {
        setSelectedTremie(config.tremie);
    }
  }, [configLoaded, config]);

  const handleSmlSelect = (sml: string) => {
    setSelectedSml(sml);
    // Reset tremie selection if SML changes
    setSelectedTremie(null);
  };

  const handleTremieSelect = (tremie: string) => {
    setSelectedTremie(tremie);
  };

  const handleStartScan = () => {
    if (selectedSml && selectedTremie) {
        setConfig(selectedSml, selectedTremie);
        router.push('/scan');
    }
  };
  
  const handleClearConfig = () => {
    clearConfig();
    setSelectedSml(null);
    setSelectedTremie(null);
  }

  if (!profileLoaded || !configLoaded || !profile) {
    return (
      <div className="space-y-8 max-w-4xl mx-auto">
        <Skeleton className="h-10 w-3/4" />
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-4 w-3/4" />
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {SML_OPTIONS.map(sml => <Skeleton key={sml} className="h-12 w-full" />)}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Settings className="h-8 w-8" />
            Configuration de la Session
          </h1>
          <p className="text-muted-foreground">
            Veuillez paramétrer la session avant de commencer le scan.
          </p>
        </div>
        {config.sml && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="destructive" >
                    <XCircle className="mr-2 h-4 w-4" />
                    Réinitialiser
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Réinitialiser la session ?</AlertDialogTitle>
                <AlertDialogDescription>
                  Cette action est irréversible et effacera la configuration de la session (SML et trémie). Les utilisateurs seront déconnectés jusqu'à ce qu'une nouvelle configuration soit définie. L'historique des scans ne sera pas affecté.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={handleClearConfig}>Confirmer</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Étape 1: Sélectionner le SML
            {selectedSml && <CheckCircle className="h-6 w-6 text-green-500" />}
          </CardTitle>
          <CardDescription>Choisissez un SML pour continuer.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {SML_OPTIONS.map(sml => (
              <Button
                key={sml}
                variant={selectedSml === sml ? 'default' : 'outline'}
                onClick={() => handleSmlSelect(sml)}
                className="justify-center"
                size="lg"
              >
                {sml}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedSml && (
        <Card className="animate-in fade-in duration-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Étape 2: Sélectionner la Trémie
              {selectedTremie && <CheckCircle className="h-6 w-6 text-green-500" />}
            </CardTitle>
            <CardDescription>
              Le SML sélectionné est <strong>{selectedSml}</strong>. Choisissez maintenant une trémie.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {TREMIE_OPTIONS.map(tremie => (
                <Button
                  key={tremie}
                  variant={selectedTremie === tremie ? 'default' : 'outline'}
                  onClick={() => handleTremieSelect(tremie)}
                  className="justify-center"
                   size="lg"
                >
                  {tremie}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {selectedSml && selectedTremie && (
          <div className="flex flex-col items-center gap-8 text-center animate-in fade-in duration-500">
             <Card className="bg-secondary border-primary/20 w-full">
                <CardContent className="p-6">
                    <p className="text-lg font-medium text-secondary-foreground">Configuration de la session :</p>
                    <p className="text-2xl font-bold text-primary flex items-center justify-center">
                        {selectedSml} <ChevronRight className="inline-block h-6 w-6 mx-2" /> {selectedTremie}
                    </p>
                </CardContent>
             </Card>
             <Button onClick={handleStartScan} size="lg" className="shadow-lg w-full max-w-xs">
                <ScanLine className="mr-2 h-5 w-5" />
                Commencer le scan
            </Button>
          </div>
      )}
    </div>
  );
}
