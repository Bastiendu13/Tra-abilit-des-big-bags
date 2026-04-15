"use client";

import { useState, useEffect } from 'react';
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
import { useSessionConfig } from '@/hooks/use-session-config';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

type ScanStep = 'product' | 'product_scanned' | 'hopper';

export default function ScanPage() {
  const { profile, isLoaded: profileLoaded } = useUserProfile();
  const { activeAssignment, isLoaded: configLoaded } = useSessionConfig();
  const router = useRouter();
  const [scanStep, setScanStep] = useState<ScanStep>('product');
  const [productQr, setProductQr] = useState<string | null>(null);
  const [hopperQr, setHopperQr] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showScanner, setShowScanner] = useState(true);
  const [scannerKey, setScannerKey] = useState(Date.now()); // Key to force re-mounting QrScanner
  const [errorDialog, setErrorDialog] = useState<{ title: string; description: string } | null>(null);

  useEffect(() => {
    if (profileLoaded && !profile) {
      router.push('/');
    }

    // Protection logic
    if (configLoaded) {
      if (!activeAssignment) {
        if (profile === 'administrateur') {
          router.replace('/config');
        } else if (profile === 'utilisateur') {
          router.replace('/wait-for-config');
        }
      }
    }
  }, [profileLoaded, configLoaded, profile, activeAssignment, router]);

  // This effect will trigger the dialog once we have both QR codes.
  useEffect(() => {
    if (productQr && hopperQr) {
      setIsDialogOpen(true);
    }
  }, [productQr, hopperQr]);

  const handleScanSuccess = (decodedText: string) => {
    if (scanStep === 'product') {
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
        // Reset scanner by changing key to allow a new scan
        setScannerKey(Date.now());
        return;
      };

      // Check if the scanned hopper QR matches the session configuration
      if (decodedText !== activeAssignment?.tremie) {
        setErrorDialog({
          title: "Mauvaise trémie scannée",
          description: `Veuillez scanner la ${activeAssignment?.tremie}. Vous avez scanné une autre trémie.`,
        });
        // Reset scanner by changing key to allow a new scan
        setScannerKey(Date.now());
        return;
      }
      
      // On success for hopper, hide scanner and set QR
      setShowScanner(false);
      setHopperQr(decodedText);
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
      setScanStep('product');
      setShowScanner(true);
      setScannerKey(Date.now());
    }, 300); 
  };
  
  const scanResultForDialog = productQr && hopperQr && activeAssignment ? {
      qrData: `Produit: ${productQr}, Trémie: ${hopperQr}`,
      sml: activeAssignment.sml,
      tremie: activeAssignment.tremie
  } : null;

  if (!profileLoaded || !configLoaded || !profile || !activeAssignment) {
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

  const getTitle = () => {
    if (scanStep === 'product') {
      return "Scanner un code QR Produit";
    }
    if (scanStep === 'product_scanned') {
      return "Produit scanné";
    }
    return "Scanner le code QR de la Trémie";
  };

  const getDescription = () => {
    if (scanStep === 'product') {
      return `Session: ${activeAssignment.sml} / ${activeAssignment.tremie}. Positionnez le code QR de votre produit.`;
    }
    if (scanStep === 'product_scanned') {
      return `Session: ${activeAssignment.sml} / ${activeAssignment.tremie}. Le produit a bien été identifié.`;
    }
    return `Session: ${activeAssignment.sml} / ${activeAssignment.tremie}. Positionnez le code QR de la trémie.`;
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
                   Le produit doit aller dans la {activeAssignment.tremie}.
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
