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
import { Settings, XCircle, Info, Loader2, Package } from 'lucide-react';
import { useUserProfile } from '@/hooks/use-user-profile';
import { useSessionConfig, type Assignment } from '@/hooks/use-session-config';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { useScanHistory } from '@/hooks/use-scan-history';
import { getTraceabilityContext } from '@/lib/actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ScanPage() {
  const { profile, isLoaded: profileLoaded } = useUserProfile();
  const { activeAssignments, isLoaded: configLoaded } = useSessionConfig();
  const { addScan } = useScanHistory();
  const router = useRouter();

  const [scanStep, setScanStep] = useState<'product' | 'hopper'>('product');
  const [productQrData, setProductQrData] = useState<string | null>(null);
  const [matchingAssignment, setMatchingAssignment] = useState<Assignment | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showScanner, setShowScanner] = useState(true);
  const [scannerKey, setScannerKey] = useState(Date.now());
  const [errorDialog, setErrorDialog] = useState<{ title: string; description: string } | null>(null);
  const [showHopperInfoDialog, setShowHopperInfoDialog] = useState(false);

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
    if (scanStep === 'product') {
      // Logic to extract SML from 'key=value;' string
      const qrData: { [key: string]: string } = decodedText
        .split(';')
        .map(part => part.split('='))
        .reduce((acc, [key, value]) => {
          if (key && value) {
            acc[key.trim().toUpperCase()] = value.trim();
          }
          return acc;
        }, {} as { [key: string]: string });

      const extractedSml = qrData['SML'];

      if (!extractedSml) {
        setErrorDialog({
          title: "Format de QR code invalide",
          description: "Le code QR du produit ne contient pas de clé 'SML' au format 'clé=valeur;'.",
        });
        setScannerKey(Date.now());
        return;
      }
      
      const assignment = activeAssignments.find(
        a => a.sml.toUpperCase() === extractedSml.toUpperCase()
      );

      if (assignment) {
        setMatchingAssignment(assignment);
        setProductQrData(decodedText);
        setShowScanner(false); // Hide scanner
        setShowHopperInfoDialog(true); // Show info dialog
      } else {
        setErrorDialog({
          title: "SML non configurée",
          description: `La SML "${extractedSml}" scannée ne correspond à aucune session active.`,
        });
        setScannerKey(Date.now());
      }
    } else if (scanStep === 'hopper') {
      if (!matchingAssignment || !productQrData) return;

      const expectedTremie = matchingAssignment.tremie;
      const scannedTremie = decodedText;

      if (expectedTremie.toUpperCase() === scannedTremie.toUpperCase()) {
        setIsSaving(true);
        setShowScanner(false);

        const finalQrData = `Produit: ${productQrData}; Trémie: ${scannedTremie}`;
        
        getTraceabilityContext(finalQrData)
          .then(aiContext => {
            addScan({
              qrData: finalQrData,
              sml: matchingAssignment.sml,
              tremie: matchingAssignment.tremie,
              aiContext: aiContext,
            });
          })
          .catch(error => {
            console.error("AI analysis failed, adding scan without it.", error);
            addScan({
              qrData: finalQrData,
              sml: matchingAssignment.sml,
              tremie: matchingAssignment.tremie,
            });
          })
          .finally(() => {
            setIsSaving(false);
            setIsDialogOpen(true);
          });
      } else {
        setErrorDialog({
          title: "Mauvaise trémie",
          description: `Trémie incorrecte. Attendu: "${expectedTremie}". Scanné: "${scannedTremie}". Veuillez scanner la bonne trémie.`,
        });
        setScannerKey(Date.now());
      }
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setTimeout(() => {
      setScanStep('product');
      setProductQrData(null);
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
        <h1 className="text-3xl font-bold tracking-tight">
          {scanStep === 'product' ? 'Étape 1: Scanner le QR Produit' : 'Étape 2: Scanner le QR Trémie'}
        </h1>
         <p className="text-muted-foreground mt-2">
           Sessions actives : {activeAssignmentsText}
        </p>
      </div>
      
      {showScanner && (
        <QrScanner key={scannerKey} onScanSuccess={handleScanSuccess} />
      )}

      {scanStep === 'hopper' && matchingAssignment && !isSaving && (
        <Card className="w-full max-w-lg bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800 animate-in fade-in duration-500">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                    <Info className="h-6 w-6"/>
                    Action requise
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-center text-lg text-foreground">
                    Produit reconnu. Veuillez maintenant scanner le QR code de la trémie <strong className="text-primary text-xl font-bold">{matchingAssignment.tremie}</strong>.
                </p>
            </CardContent>
        </Card>
      )}

      {isSaving && (
        <div className="flex flex-col items-center gap-4 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p>Enregistrement du scan...</p>
        </div>
      )}

      {showHopperInfoDialog && matchingAssignment && (
        <AlertDialog open={showHopperInfoDialog} onOpenChange={setShowHopperInfoDialog}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2 text-2xl">
                        <Package className="h-8 w-8 text-primary"/>
                        Déposer le produit dans la trémie
                    </AlertDialogTitle>
                </AlertDialogHeader>
                <div className="py-4 text-center">
                    <p className="text-7xl font-bold text-primary">{matchingAssignment.tremie}</p>
                </div>
                <AlertDialogFooter>
                    <AlertDialogAction onClick={() => {
                        setShowHopperInfoDialog(false);
                        setScanStep('hopper');
                        setShowScanner(true);
                        setScannerKey(Date.now());
                    }} className="w-full">
                        OK
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
      )}

      {isDialogOpen && matchingAssignment && (
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
