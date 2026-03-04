"use client";

import { useState, useEffect } from 'react';
import { QrScanner } from '@/components/qr-scanner';
import { ScanResultDialog } from '@/components/scan-result-dialog';

export default function ScanPage() {
  const [scanStep, setScanStep] = useState<'product' | 'hopper'>('product');
  const [productQr, setProductQr] = useState<string | null>(null);
  const [hopperQr, setHopperQr] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // This effect will trigger the dialog once we have both QR codes.
  useEffect(() => {
    if (productQr && hopperQr) {
      setIsDialogOpen(true);
    }
  }, [productQr, hopperQr]);

  const handleScanSuccess = (decodedText: string) => {
    // Prevent scanning if dialog is open or being opened
    if (isDialogOpen || (productQr && hopperQr)) return;

    if (scanStep === 'product') {
      setProductQr(decodedText);
      setScanStep('hopper');
    } else if (scanStep === 'hopper') {
      // Don't scan the same product QR as hopper QR
      if (decodedText === productQr) return;
      setHopperQr(decodedText);
    }
  };
  
  const handleDialogClose = () => {
    setIsDialogOpen(false);
    // Reset state to start over after a short delay
    setTimeout(() => {
      setProductQr(null);
      setHopperQr(null);
      setScanStep('product');
    }, 300); 
  };

  const getTitle = () => {
    if (scanStep === 'product') {
      return "Scanner un code QR Produit";
    }
    return "Scanner le code QR de la Trémie";
  };

  const getDescription = () => {
    if (scanStep === 'product') {
      return "Positionnez le code QR de votre produit dans le cadre.";
    }
    return `Maintenant, positionnez le code QR de la trémie dans le cadre.`;
  };
  
  const scanResultForDialog = productQr && hopperQr ? `Produit: ${productQr}, Trémie: ${hopperQr}` : null;

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">{getTitle()}</h1>
        <p className="text-muted-foreground">
          {getDescription()}
        </p>
        {productQr && scanStep === 'hopper' && !isDialogOpen && (
          <div className="mt-4 text-sm bg-secondary p-3 rounded-md w-full max-w-lg">
            <span className="font-semibold text-muted-foreground">Produit scanné :</span>
            <p className="font-mono break-all mt-1">{productQr}</p>
          </div>
        )}
      </div>
      
      <QrScanner onScanSuccess={handleScanSuccess} />

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
