"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSessionConfig } from '@/hooks/use-session-config';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronRight, Settings, PlusCircle, Trash2, Power, PowerOff, Shield, AlertTriangle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useUserProfile } from '@/hooks/use-user-profile';

const SLM_OPTIONS = Array.from({ length: 8 }, (_, i) => `SLM${i + 1}`);
const TREMIE_OPTIONS = Array.from({ length: 6 }, (_, i) => `Trémie ${i + 1}`);

export default function ConfigPage() {
  const { profile, isLoaded: isProfileLoaded } = useUserProfile();
  const { assignments, activeAssignments, addAssignment, removeAssignment, activateAssignment, deactivateAssignment, isLoaded: configLoaded } = useSessionConfig();
  const router = useRouter();
  const { toast } = useToast();

  const [selectedSlm, setSelectedSlm] = useState<string | null>(null);
  const [selectedTremie, setSelectedTremie] = useState<string | null>(null);

  const isLoading = !isProfileLoaded || !configLoaded;
  const isAuthorized = profile === 'administrateur';

  useEffect(() => {
    if (isProfileLoaded && !profile) {
      router.replace('/login');
    } else if (isProfileLoaded && profile !== 'administrateur') {
      router.replace('/scan');
      toast({
        variant: "destructive",
        title: "Accès non autorisé",
        description: "Vous devez être administrateur pour accéder à cette page."
      });
    }
  }, [isProfileLoaded, profile, router, toast]);

  const handleAddAssignment = () => {
    if (selectedSlm && selectedTremie) {
        addAssignment(selectedSlm, selectedTremie);
        toast({
          title: "Affectation ajoutée",
          description: `${selectedSlm} / ${selectedTremie} a été ajouté à la liste.`,
        });
        setSelectedSlm(null);
        setSelectedTremie(null);
    }
  };

  const handleActivate = (assignmentId: string) => {
    activateAssignment(assignmentId);
    const assignment = assignments.find(a => a.id === assignmentId);
    toast({
        title: "Session activée",
        description: `La session de scan est maintenant active pour ${assignment?.Slm} / ${assignment?.tremie}.`,
    });
  };

  const handleDeactivate = (assignmentId: string) => {
    deactivateAssignment(assignmentId);
    const assignment = assignments.find(a => a.id === assignmentId);
    toast({
        title: "Session désactivée",
        description: `La session pour ${assignment?.Slm} / ${assignment?.tremie} est inactive.`,
    });
  };

  const handleRemove = (assignmentId: string) => {
    removeAssignment(assignmentId);
    toast({
        title: "Affectation supprimée",
        variant: "destructive"
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-8 max-w-4xl mx-auto">
        <Skeleton className="h-10 w-3/4" />
        <Card>
          <CardHeader><Skeleton className="h-8 w-1/2" /></CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAuthorized) {
     return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
        <h1 className="text-2xl font-bold">Accès refusé</h1>
        <p className="text-muted-foreground">Vous n'avez pas les autorisations nécessaires pour voir cette page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
        <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <Settings className="h-8 w-8" />
                Gestion des Affectations
              </h1>
              <p className="text-muted-foreground">
                Créez des affectations Slm/Trémie et activez-les pour la session de scan.
              </p>
            </div>
        </div>

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <PlusCircle className="h-6 w-6" />
                    Ajouter une nouvelle affectation
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <h3 className="font-semibold mb-2 text-muted-foreground">Étape 1: Sélectionner le Slm</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {SLM_OPTIONS.map(Slm => (
                        <Button
                            key={Slm}
                            variant={selectedSlm === Slm ? 'default' : 'outline'}
                            onClick={() => setSelectedSlm(Slm)}
                        >
                            {Slm}
                        </Button>
                        ))}
                    </div>
                </div>
                {selectedSlm && (
                    <div className="animate-in fade-in duration-500">
                        <h3 className="font-semibold mb-2 text-muted-foreground">Étape 2: Sélectionner la Trémie</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {TREMIE_OPTIONS.map(tremie => (
                            <Button
                            key={tremie}
                            variant={selectedTremie === tremie ? 'default' : 'outline'}
                            onClick={() => setSelectedTremie(tremie)}
                            >
                            {tremie}
                            </Button>
                        ))}
                        </div>
                    </div>
                )}
            </CardContent>
            {selectedSlm && selectedTremie && (
                <CardFooter>
                    <Button onClick={handleAddAssignment} className="w-full">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Ajouter l'affectation: {selectedSlm} / {selectedTremie}
                    </Button>
                </CardFooter>
            )}
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle>Liste des Affectations</CardTitle>
                <CardDescription>
                     {activeAssignments.length > 0 
                        ? <>{activeAssignments.length} session{activeAssignments.length > 1 ? 's' : ''} active{activeAssignments.length > 1 ? 's' : ''} : <strong className="text-primary">{activeAssignments.map(a => `${a.Slm} / ${a.tremie}`).join(', ')}</strong></> 
                        : "Aucune session n'est active. Les utilisateurs ne peuvent pas scanner."
                    }
                </CardDescription>
            </CardHeader>
            <CardContent>
                {assignments.length > 0 ? (
                    <div className="space-y-3">
                        {assignments.map(assignment => {
                            const isActive = activeAssignments.some(a => a.id === assignment.id);
                            return (
                                <Card key={assignment.id} className={cn("flex items-center justify-between p-4", isActive && "bg-primary/10 border-primary")}>
                                    <p className="font-semibold text-lg">
                                        {assignment.Slm} <ChevronRight className="inline-block h-5 w-5 mx-1 text-muted-foreground" /> {assignment.tremie}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        {isActive ? (
                                            <Button variant="outline" size="sm" onClick={() => handleDeactivate(assignment.id)}>
                                                <PowerOff className="mr-2 h-4 w-4" />
                                                Désactiver
                                            </Button>
                                        ) : (
                                            <Button variant="default" size="sm" onClick={() => handleActivate(assignment.id)}>
                                                <Power className="mr-2 h-4 w-4" />
                                                Activer
                                            </Button>
                                        )}
                                        <Button variant="destructive" size="icon" onClick={() => handleRemove(assignment.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                ) : (
                    <p className="text-muted-foreground text-center py-4">Aucune affectation créée.</p>
                )}
            </CardContent>
        </Card>
    </div>
  );
}
