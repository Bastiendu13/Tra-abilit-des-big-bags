"use client";

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode';
import { CameraOff, ScanLine } from 'lucide-react';

interface QrScannerProps {
  onScanSuccess: (decodedText: string, decodedResult: any) => void;
  onScanFailure?: (error: string) => void;
}

export function QrScanner({ onScanSuccess, onScanFailure }: QrScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const qrcodeRegionId = "qr-code-reader";
    const config = { fps: 10, qrbox: { width: 250, height: 250 } };

    const scanner = new Html5Qrcode(qrcodeRegionId);
    scannerRef.current = scanner;

    const startScanner = async () => {
      try {
        await scanner.start(
          { facingMode: "environment" },
          config,
          onScanSuccess,
          onScanFailure || ((errorMessage) => console.log(errorMessage))
        );
        setError(null);
      } catch (err: any) {
        console.error("Camera start error:", err);
        setError("Impossible de démarrer la caméra. Veuillez vérifier les autorisations de votre navigateur.");
        // Try back camera
        try {
            await scanner.start(
                {}, // Default camera
                config,
                onScanSuccess,
                onScanFailure || ((errorMessage) => console.log(errorMessage))
              );
              setError(null);
        } catch (err2: any) {
            console.error("Second camera attempt failed:", err2);
            setError("Impossible de démarrer la caméra. Assurez-vous d'en avoir une et de donner les autorisations.");
        }
      }
    };

    startScanner();

    return () => {
      if (scannerRef.current && scannerRef.current.getState() === Html5QrcodeScannerState.SCANNING) {
        scannerRef.current.stop().catch(err => {
          console.error("Failed to stop scanner", err);
        });
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="w-full max-w-lg mx-auto aspect-square rounded-lg border-4 border-dashed border-primary/50 bg-secondary/50 overflow-hidden relative flex items-center justify-center">
      {error ? (
        <div className="text-center text-destructive p-4 flex flex-col items-center">
            <CameraOff className="w-16 h-16 mb-4" />
            <p className="font-semibold">Erreur de caméra</p>
            <p className="text-sm">{error}</p>
        </div>
      ) : (
        <>
            <div id="qr-code-reader" className="w-full h-full" />
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-[250px] h-[250px] relative">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-accent rounded-tl-lg"></div>
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-accent rounded-tr-lg"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-accent rounded-bl-lg"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-accent rounded-br-lg"></div>
                    <ScanLine className="absolute inset-x-0 top-0 w-full h-1 text-accent animate-pulse-scan" style={{ animation: 'pulse-scan 3s infinite' }}/>
                </div>
            </div>
             <style jsx>{`
                @keyframes pulse-scan {
                    0% { transform: translateY(0); opacity: 0.5; }
                    50% { transform: translateY(240px); opacity: 1; }
                    100% { transform: translateY(0); opacity: 0.5; }
                }
            `}</style>
        </>
      )}
    </div>
  );
}
