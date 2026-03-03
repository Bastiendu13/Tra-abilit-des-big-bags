"use client";

import { useState } from 'react';
import { QrScanner } from '@/components/qr-scanner';
import { ScanResultDialog } from '@/components/scan-result-dialog';

export default function ScanPage() {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleScanSuccess = (decodedText: string) => {
    // To avoid continuous scanning of the same code
    if (scanResult === decodedText && isDialogOpen) return;
    
    setScanResult(decodedText);
    setIsDialogOpen(true);
  };
  
  const handleDialogClose = () => {
    setIsDialogOpen(false);
    // Reset scan result to allow re-scanning the same code after closing dialog
    setTimeout(() => setScanResult(null), 300); 
  };

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Scanner un code QR</h1>
        <p className="text-muted-foreground">
          Positionnez le code QR de votre produit dans le cadre.
        </p>
      </div>
      
      <QrScanner onScanSuccess={handleScanSuccess} />

      {scanResult && (
        <ScanResultDialog
          qrData={scanResult}
          isOpen={isDialogOpen}
          onClose={handleDialogClose}
        />
      )}
    </div>
  );
}
