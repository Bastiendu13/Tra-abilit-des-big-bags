"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserProfile } from '@/hooks/use-user-profile';
import { useSessionConfig } from '@/hooks/use-session-config';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronRight, Settings, PlusCircle, Trash2, Power, PowerOff } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

const SML_OPTIONS = Array.from({ length: 8 }, (_, i) => `SML${i + 1}`);
const TREMIE_OPTIONS = Array.from({ length: 6 }, (_, i) => `Trémie ${i + 1}`);

export default function ConfigPage() {
  const { profile, isLoaded: profileLoaded } = useUserProfile();
  const { assignments, activeAssignment, addAssignment, removeAssignment, setActiveAssignmentId, isLoaded: configLoaded } = useSessionConfig();
  const router = useRouter();
  const { toast } = useToast();

  const [selectedSml, setSelectedSml] = useState<string | null>(null);
  const [selectedTremie, setSelectedTremie] = useState<string | null>(null);

  useEffect(() => {
    if (profileLoaded && profile !== 'administrateur') {
      router.push('/');
    }
  }, [profileLoaded, profile, router]);

  const handleAddAssignment = () => {
    if (selectedSml && selectedTremie) {
        addAssignment(selectedSml, selectedTremie);
        toast({
          title: "Affectation ajoutée",
          description: `${selectedSml} / ${selectedTremie} a été ajouté à la liste.`,
        });
        setSelectedSml(null);
        setSelectedTremie(null);
    }
  };

  const handleActivate = (assignmentId: string) => {
    setActiveAssignmentId(assignmentId);
    const assignment = assignments.find(a => a.id === assignmentId);
    toast({
        title: "Session activée",
        description: `La session de scan est maintenant active pour ${assignment?.sml} / ${assignment?.tremie}.`,
    });
  };

  const handleDeactivate = () => {
    setActiveAssignmentId(null);
    toast({
        title: "Session désactivée",
        description: `Aucune session de scan n'est active.`,
    });
  };

  const handleRemove = (assignmentId: string) => {
    removeAssignment(assignmentId);
    toast({
        title: "Affectation supprimée",
        variant: "destructive"
    });
  };

  if (!profileLoaded || !configLoaded || !profile) {
    return (
      <div className="space-y-8 max-w-4xl mx-auto">
        <Skeleton className="h-10 w-3/4" />
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
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
                Gestion des Affectations
              </h1>
              <p className="text-muted-foreground">
                Créez des affectations SML/Trémie et activez-en une pour la session de scan.
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
                    <h3 className="font-semibold mb-2 text-muted-foreground">Étape 1: Sélectionner le SML</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {SML_OPTIONS.map(sml => (
                        <Button
                            key={sml}
                            variant={selectedSml === sml ? 'default' : 'outline'}
                            onClick={() => setSelectedSml(sml)}
                        >
                            {sml}
                        </Button>
                        ))}
                    </div>
                </div>
                {selectedSml && (
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
            {selectedSml && selectedTremie && (
                <CardFooter>
                    <Button onClick={handleAddAssignment} className="w-full">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Ajouter l'affectation: {selectedSml} / {selectedTremie}
                    </Button>
                </CardFooter>
            )}
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle>Liste des Affectations</CardTitle>
                <CardDescription>
                    {activeAssignment 
                        ? <>Session active : <strong className="text-primary">{activeAssignment.sml} / {activeAssignment.tremie}</strong></> 
                        : "Aucune session n'est active. Les utilisateurs ne peuvent pas scanner."
                    }
                </CardDescription>
            </CardHeader>
            <CardContent>
                {assignments.length > 0 ? (
                    <div className="space-y-3">
                        {assignments.map(assignment => {
                            const isActive = activeAssignment?.id === assignment.id;
                            return (
                                <Card key={assignment.id} className={cn("flex items-center justify-between p-4", isActive && "bg-primary/10 border-primary")}>
                                    <p className="font-semibold text-lg">
                                        {assignment.sml} <ChevronRight className="inline-block h-5 w-5 mx-1 text-muted-foreground" /> {assignment.tremie}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        {isActive ? (
                                            <Button variant="outline" size="sm" onClick={handleDeactivate}>
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
