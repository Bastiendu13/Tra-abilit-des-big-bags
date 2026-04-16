"use client";

import { useState, useEffect } from 'react';
import { QrScanner } from '@/components/qr-scanner';
import { ScanResultDialog } from '@/components/scan-result-dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Settings, XCircle } from 'lucide-react';
import { useUserProfile } from '@/hooks/use-user-profile';
import { useSessionConfig, type Assignment } from '@/hooks/use-session-config';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

export default function ScanPage() {
  const { profile, isLoaded: profileLoaded } = useUserProfile();
  const { activeAssignments, isLoaded: configLoaded } = useSessionConfig();
  const router = useRouter();

  const [matchingAssignment, setMatchingAssignment] = useState<Assignment | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showScanner, setShowScanner] = useState(true);
  const [scannerKey, setScannerKey] = useState(Date.now());
  const [errorDialog, setErrorDialog] = useState<{ title: string; description: string } | null>(null);

  useEffect(() => {
    if (profileLoaded && !profile) {
      router.push('/');
    }

    if (configLoaded) {
      if (activeAssignments.length === 0) {
        if (profile === 'administrateur') {
          router.replace('/config');
        } else if (profile === 'utilisateur') {
          router.replace('/wait-for-config');
        }
      }
    }
  }, [profileLoaded, configLoaded, profile, activeAssignments, router]);

  const handleScanSuccess = (decodedText: string) => {
    const assignment = activeAssignments.find(a => decodedText.includes(a.sml));

    if (assignment) {
      setMatchingAssignment(assignment);
      setShowScanner(false);
      setIsDialogOpen(true);
    } else {
      setErrorDialog({
        title: "SML non configuré",
        description: "Le SML scanné ne fait partie d'aucune session de scan active.",
      });
      setScannerKey(Date.now());
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setTimeout(() => {
      setMatchingAssignment(null);
      setShowScanner(true);
      setScannerKey(Date.now());
    }, 300);
  };

  if (!profileLoaded || !configLoaded || !profile || activeAssignments.length === 0) {
    return (
        <div className="flex flex-col items-center gap-8 w-full max-w-2xl mx-auto">
            <div className="text-center w-full">
                <Skeleton className="h-10 w-3/4 mx-auto" />
                <Skeleton className="h-6 w-1/2 mx-auto mt-2" />
            </div>
            <Skeleton className="w-full max-w-lg aspect-square rounded-lg" />
            <p className="flex items-center gap-2 text-muted-foreground"><Settings className="animate-spin" />Chargement de la configuration de la session...</p>
        </div>
    );
  }
  
  const activeAssignmentsText = activeAssignments.map(a => `${a.sml} / ${a.tremie}`).join(' | ');

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-2xl mx-auto">
      <div className="text-center w-full">
        <h1 className="text-3xl font-bold tracking-tight">Scanner un code QR SML</h1>
        <p className="text-muted-foreground mt-2">
          Sessions actives : {activeAssignmentsText}
        </p>
      </div>
      
      {showScanner && (
         <QrScanner key={scannerKey} onScanSuccess={handleScanSuccess} />
      )}

      {matchingAssignment && (
        <ScanResultDialog
          tremie={matchingAssignment.tremie}
          isOpen={isDialogOpen}
          onClose={handleDialogClose}
        />
      )}

      {errorDialog && (
        <AlertDialog open={!!errorDialog} onOpenChange={() => setErrorDialog(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2 text-2xl">
                    <XCircle className="h-8 w-8 text-destructive"/>
                    {errorDialog.title}
                </AlertDialogTitle>
                <AlertDialogDescription className="text-lg text-center py-4 text-foreground">
                  {errorDialog.description}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogAction onClick={() => setErrorDialog(null)} className="w-full">Réessayer</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
