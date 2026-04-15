"use client";

import { useState, useEffect } from 'react';
import { QrScanner } from '@/components/qr-scanner';
import { ScanResultDialog } from '@/components/scan-result-dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { QrCode, ArrowRight, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUserProfile } from '@/hooks/use-user-profile';
import { useSessionConfig } from '@/hooks/use-session-config';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

type ScanStep = 'product' | 'product_scanned' | 'hopper';

export default function ScanPage() {
  const { profile, isLoaded: profileLoaded } = useUserProfile();
  const { config, isLoaded: configLoaded } = useSessionConfig();
  const router = useRouter();
  const { toast } = useToast();
  const [scanStep, setScanStep] = useState<ScanStep>('product');
  const [productQr, setProductQr] = useState<string | null>(null);
  const [hopperQr, setHopperQr] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showScanner, setShowScanner] = useState(true);

  useEffect(() => {
    if (profileLoaded && !profile) {
      router.push('/');
    }

    // Protection logic
    if (configLoaded) {
      if (!config.sml || !config.tremie) {
        if (profile === 'administrateur') {
          router.replace('/config');
        } else if (profile === 'utilisateur') {
          router.replace('/wait-for-config');
        }
      }
    }
  }, [profileLoaded, configLoaded, profile, config, router]);

  // This effect will trigger the dialog once we have both QR codes.
  useEffect(() => {
    if (productQr && hopperQr) {
      setIsDialogOpen(true);
    }
  }, [productQr, hopperQr]);

  const handleScanSuccess = (decodedText: string) => {
    // This function is now guaranteed by the QrScanner to be called only once per scan session.
    // Immediately stop rendering the scanner, which will unmount it and stop the camera.
    setShowScanner(false);

    if (scanStep === 'product') {
      setProductQr(decodedText);
      setScanStep('product_scanned');
    } else if (scanStep === 'hopper') {
      // Don't scan the same product QR as hopper QR
      if (decodedText === productQr) {
        toast({
          variant: "destructive",
          title: "Erreur de scan",
          description: "Le code QR de la trémie ne peut pas être le même que celui du produit.",
        });
        // If the same QR is scanned again, re-enable scanner to try again.
        setShowScanner(true);
        return;
      };

      // Check if the scanned hopper QR matches the session configuration
      if (decodedText !== config.tremie) {
        toast({
          variant: "destructive",
          title: "Mauvaise trémie scannée",
          description: `Veuillez scanner la ${config.tremie}. Vous avez scanné une autre trémie.`,
        });
        setShowScanner(true);
        return;
      }
      
      setHopperQr(decodedText);
    }
  };
  
  const handleStartHopperScan = () => {
    setScanStep('hopper');
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
    }, 300); 
  };
  
  const scanResultForDialog = productQr && hopperQr && config.sml && config.tremie ? {
      qrData: `Produit: ${productQr}, Trémie: ${hopperQr}`,
      sml: config.sml,
      tremie: config.tremie
  } : null;

  if (!profileLoaded || !configLoaded || !profile || !config.sml || !config.tremie) {
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
      return `Session: ${config.sml} / ${config.tremie}. Positionnez le code QR de votre produit.`;
    }
    if (scanStep === 'product_scanned') {
      return `Session: ${config.sml} / ${config.tremie}. Le produit a bien été identifié.`;
    }
    return `Session: ${config.sml} / ${config.tremie}. Positionnez le code QR de la trémie.`;
  };
  

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-2xl mx-auto">
      <div className="text-center w-full">
        <h1 className="text-3xl font-bold tracking-tight">{getTitle()}</h1>
        <p className="text-muted-foreground mt-2">
          {getDescription()}
        </p>
      </div>
      
      {/* Conditionally render QrScanner to ensure it unmounts and stops correctly */}
      {showScanner && <QrScanner onScanSuccess={handleScanSuccess} />}

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
                   Le produit doit aller dans la {config.tremie}.
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
    </div>
  );
}
