"use client";

import { useState, useEffect } from 'react';
import { QrScanner } from '@/components/qr-scanner';
import { ScanResultDialog } from '@/components/scan-result-dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { QrCode, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUserProfile } from '@/hooks/use-user-profile';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

type ScanStep = 'product' | 'product_scanned' | 'hopper';

export default function ScanPage() {
  const { profile, isLoaded } = useUserProfile();
  const router = useRouter();
  const [scanStep, setScanStep] = useState<ScanStep>('product');
  const [productQr, setProductQr] = useState<string | null>(null);
  const [hopperQr, setHopperQr] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showScanner, setShowScanner] = useState(true);

  useEffect(() => {
    if (isLoaded && !profile) {
      router.push('/');
    }
  }, [isLoaded, profile, router]);

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
        // If the same QR is scanned again, re-enable scanner to try again.
        setShowScanner(true);
        return;
      };
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
      return "Positionnez le code QR de votre produit dans le cadre.";
    }
    if (scanStep === 'product_scanned') {
      return "Le produit a bien été identifié. Passez à l'étape suivante.";
    }
    return `Maintenant, positionnez le code QR de la trémie dans le cadre.`;
  };
  
  const scanResultForDialog = productQr && hopperQr ? `Produit: ${productQr}, Trémie: ${hopperQr}` : null;

  if (!isLoaded || !profile) {
    return (
        <div className="flex flex-col items-center gap-8 w-full max-w-2xl mx-auto">
            <div className="text-center w-full">
                <Skeleton className="h-10 w-3/4 mx-auto" />
                <Skeleton className="h-6 w-1/2 mx-auto mt-2" />
            </div>
            <Skeleton className="w-full max-w-lg aspect-square rounded-lg" />
        </div>
    );
  }

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
                   Produit dois aller dans la trémie N°3.
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
          qrData={scanResultForDialog}
          isOpen={isDialogOpen}
          onClose={handleDialogClose}
        />
      )}
    </div>
  );
}
