"use client";

import { useState, useEffect } from 'react';
import { QrScanner } from '@/components/qr-scanner';
import { ScanResultDialog } from '@/components/scan-result-dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { QrCode, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type ScanStep = 'product' | 'product_scanned' | 'hopper';

export default function ScanPage() {
  const [scanStep, setScanStep] = useState<ScanStep>('product');
  const [productQr, setProductQr] = useState<string | null>(null);
  const [hopperQr, setHopperQr] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showScanner, setShowScanner] = useState(true);

  // This effect will trigger the dialog once we have both QR codes.
  useEffect(() => {
    if (productQr && hopperQr) {
      setIsDialogOpen(true);
      setShowScanner(false);
    }
  }, [productQr, hopperQr]);

  const handleScanSuccess = (decodedText: string) => {
    // Prevent scanning if dialog is open or being opened
    if (isDialogOpen || (productQr && hopperQr)) return;

    if (scanStep === 'product') {
      setProductQr(decodedText);
      setScanStep('product_scanned');
      setShowScanner(false);
    } else if (scanStep === 'hopper') {
      // Don't scan the same product QR as hopper QR
      if (decodedText === productQr) return;
      setHopperQr(decodedText);
      // The useEffect will handle opening the dialog and hiding the scanner
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

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-2xl mx-auto">
      <div className="text-center w-full">
        <h1 className="text-3xl font-bold tracking-tight">{getTitle()}</h1>
        <p className="text-muted-foreground mt-2">
          {getDescription()}
        </p>
      </div>
      
      {showScanner && <QrScanner onScanSuccess={handleScanSuccess} />}

      {scanStep === 'product_scanned' && productQr && (
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
