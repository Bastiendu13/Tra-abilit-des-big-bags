"use client";

import { useState, useEffect, useMemo } from 'react';
import { QrScanner } from '@/components/qr-scanner';
import { ScanResultDialog } from '@/components/scan-result-dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { QrCode, ArrowRight, Settings, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUserProfile } from '@/hooks/use-user-profile';
import { useSessionConfig, type Assignment } from '@/hooks/use-session-config';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

type ScanStep = 'product' | 'product_scanned' | 'hopper';

export default function ScanPage() {
  const { profile, isLoaded: profileLoaded } = useUserProfile();
  const { activeAssignments, isLoaded: configLoaded } = useSessionConfig();
  const router = useRouter();
  const [scanStep, setScanStep] = useState<ScanStep>('product');
  const [productQr, setProductQr] = useState<string | null>(null);
  const [hopperQr, setHopperQr] = useState<string | null>(null);
  const [matchingAssignment, setMatchingAssignment] = useState<Assignment | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showScanner, setShowScanner] = useState(true);
  const [scannerKey, setScannerKey] = useState(Date.now()); // Key to force re-mounting QrScanner
  const [errorDialog, setErrorDialog] = useState<{ title: string; description: string } | null>(null);

  const assignmentBasedOnSml = useMemo(() => {
    if (!productQr) return null;
    return activeAssignments.find(a => productQr.includes(a.sml)) || null;
  }, [productQr, activeAssignments]);

  useEffect(() => {
    if (profileLoaded && !profile) {
      router.push('/');
    }

    // Protection logic
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

  // This effect will trigger the dialog once we have both QR codes.
  useEffect(() => {
    if (productQr && hopperQr && matchingAssignment) {
      setIsDialogOpen(true);
    }
  }, [productQr, hopperQr, matchingAssignment]);

  const handleScanSuccess = (decodedText: string) => {
    if (scanStep === 'product') {
      const isHopper = activeAssignments.some(a => a.tremie === decodedText);
      if (isHopper) {
        setErrorDialog({
          title: "Erreur de séquence",
          description: "Vous avez scanné une trémie. Veuillez d'abord scanner le code QR du produit.",
        });
        setScannerKey(Date.now());
        return;
      }
      setProductQr(decodedText);
      setScanStep('product_scanned');
      setShowScanner(false);
    } else if (scanStep === 'hopper') {
      // Don't scan the same product QR as hopper QR
      if (decodedText === productQr) {
        setErrorDialog({
          title: "Erreur de scan",
          description: "Le code QR de la trémie ne peut pas être le même que celui du produit.",
        });
        setScannerKey(Date.now());
        return;
      };

      // Re-use memoized value, it's correct for this render pass
      if (assignmentBasedOnSml) {
          // A specific SML was found in the product. The hopper MUST match.
          if (decodedText === assignmentBasedOnSml.tremie) {
              // SUCCESS: SML detected and correct hopper scanned.
              setShowScanner(false);
              setHopperQr(decodedText);
              setMatchingAssignment(assignmentBasedOnSml);
          } else {
              // ERROR: SML detected but WRONG hopper scanned.
              setErrorDialog({
                  title: "Affectation incorrecte",
                  description: `Pour le produit contenant "${assignmentBasedOnSml.sml}", la trémie attendue est "${assignmentBasedOnSml.tremie}". Vous avez scanné "${decodedText}".`,
              });
              setScannerKey(Date.now());
          }
          return; // This branch is completely handled, so we exit.
      }

      // If we're here, it means no specific SML was found in the product QR.
      // Now, we just check if the scanned hopper matches ANY active assignment.
      const anyMatchingAssignment = activeAssignments.find(a => a.tremie === decodedText);

      if (anyMatchingAssignment) {
          // SUCCESS: No SML in product, but hopper matches an active session.
          setShowScanner(false);
          setHopperQr(decodedText);
          setMatchingAssignment(anyMatchingAssignment);
      } else {
          // ERROR: Hopper does not match any active session.
          setErrorDialog({
              title: "Affectation incorrecte",
              description: `La trémie scannée ("${decodedText}") n'est pas valide pour les sessions actives. Veuillez scanner l'une des trémies configurées : ${activeAssignments.map(a => a.tremie).join(', ')}.`,
          });
          setScannerKey(Date.now());
      }
    }
  };
  
  const handleStartHopperScan = () => {
    setScanStep('hopper');
    setScannerKey(Date.now()); // Give scanner a new key to ensure it's fresh
    setShowScanner(true);
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    // Reset state to start over after a short delay
    setTimeout(() => {
      setProductQr(null);
      setHopperQr(null);
      setMatchingAssignment(null);
      setScanStep('product');
      setShowScanner(true);
      setScannerKey(Date.now());
    }, 300); 
  };
  
  const scanResultForDialog = productQr && hopperQr && matchingAssignment ? {
      qrData: `Produit: ${productQr}, Trémie: ${hopperQr}`,
      sml: matchingAssignment.sml,
      tremie: matchingAssignment.tremie
  } : null;

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

  const getTitle = () => {
    if (scanStep === 'product') {
      return "Scanner un code QR Produit";
    }
    if (scanStep === 'product_scanned') {
      return "Produit scanné";
    }
    return `Scanner le code QR de la Trémie`;
  };

  const getDescription = () => {
    if (scanStep === 'product') {
      return `Sessions actives : ${activeAssignmentsText}. Positionnez le code QR du produit.`;
    }
    if (scanStep === 'product_scanned') {
      return `Le produit a bien été identifié.`;
    }
    // This is for scanStep === 'hopper'
    if (assignmentBasedOnSml) {
      return `Veuillez scanner le code QR de la trémie "${assignmentBasedOnSml.tremie}".`;
    }
    return `Scannez la trémie correspondante pour l'une des sessions actives : ${activeAssignmentsText}.`;
  };
  

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-2xl mx-auto">
      <div className="text-center w-full">
        <h1 className="text-3xl font-bold tracking-tight">{getTitle()}</h1>
        <p className="text-muted-foreground mt-2">
          {getDescription()}
        </p>
      </div>
      
      {showScanner && (
         <QrScanner key={scannerKey} onScanSuccess={handleScanSuccess} />
      )}

      {scanStep === 'product_scanned' && productQr && !hopperQr && (
        <div className="w-full space-y-6 animate-in fade-in duration-500">
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Produit scanné</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="font-mono break-all bg-secondary p-3 rounded-md">{productQr}</p>
                </CardContent>
            </Card>

            <Alert>
                <ArrowRight className="h-4 w-4" />
                <AlertTitle>Action requise</AlertTitle>
                <AlertDescription>
                   {assignmentBasedOnSml
                       ? "Ce produit doit aller dans la trémie associée au SML scanné."
                       : `Ce produit doit aller dans une trémie d'une session active : ${activeAssignmentsText}.`
                   }
                </AlertDescription>
            </Alert>
            
            <Button onClick={handleStartHopperScan} className="w-full" size="lg">
                <QrCode className="mr-2 h-5 w-5" />
                Scan trémie
            </Button>
        </div>
      )}

      {scanResultForDialog && (
        <ScanResultDialog
          scanData={scanResultForDialog}
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
