"use client";

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode';
import { CameraOff, ScanLine } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QrScannerProps {
  onScanSuccess: (decodedText: string, decodedResult: any) => void;
  onScanFailure?: (error: string) => void;
}

export function QrScanner({ onScanSuccess, onScanFailure }: QrScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const hasScannedRef = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const qrcodeRegionId = "qr-code-reader";

  // Use refs for the callbacks to prevent the effect from re-running on every parent render.
  // This is crucial for stability and prevents race conditions.
  const onScanSuccessRef = useRef(onScanSuccess);
  onScanSuccessRef.current = onScanSuccess;

  const onScanFailureRef = useRef(onScanFailure);
  onScanFailureRef.current = onScanFailure;

  useEffect(() => {
    // The effect now runs only once on mount, thanks to the empty dependency array.
    const scanner = new Html5Qrcode(qrcodeRegionId, false);
    scannerRef.current = scanner;

    const config = { fps: 10, qrbox: { width: 250, height: 250 } };

    const successCallback = (text: string, result: any) => {
      if (!hasScannedRef.current) {
        hasScannedRef.current = true;
        // Call the latest callback via the ref.
        onScanSuccessRef.current(text, result);
      }
    };

    const failureCallback = (err: string) => {
      if (onScanFailureRef.current) {
        // Call the latest callback via the ref.
        onScanFailureRef.current(err);
      }
    };

    const startScanner = async () => {
      // Ensure the DOM element is available before starting the scanner.
      // This is generally true since useEffect runs after render, but this check adds robustness.
      if (!document.getElementById(qrcodeRegionId)) {
        console.error("QR scanner DOM element not found.");
        return;
      }
      try {
        const cameras = await Html5Qrcode.getCameras();
        if (cameras && cameras.length > 0) {
          const backCamera = cameras.find(c => c.label.toLowerCase().includes('back'));
          const cameraId = backCamera ? backCamera.id : cameras[0].id;

          if (scannerRef.current && scannerRef.current.getState() === Html5QrcodeScannerState.NOT_STARTED) {
            await scannerRef.current.start(cameraId, config, successCallback, failureCallback);
            setError(null);
          }
        } else {
          setError("Aucune caméra trouvée sur cet appareil.");
        }
      } catch (err: any) {
        console.error("Erreur de démarrage de la caméra:", err);
        setError("Impossible d'accéder à la caméra. Veuillez vérifier les autorisations de votre navigateur.");
      }
    };

    startScanner();

    return () => {
      // Cleanup function to stop the scanner when the component unmounts.
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(err => {
          // It's common for stop() to throw an error if the scanner is already stopped or in a weird state.
          // We can often safely ignore this during cleanup.
          if (err.name !== 'NotScanningError') {
            console.warn("Échec de l'arrêt du scanner lors du nettoyage:", err);
          }
        });
      }
    };
  }, []); // <-- Empty dependency array is the key to the fix. It ensures the effect runs only once.

  return (
    <div className={cn("w-full max-w-lg mx-auto aspect-square rounded-lg border-4 border-dashed border-primary/50 bg-secondary/50 overflow-hidden relative flex items-center justify-center")}>
      {error ? (
        <div className="text-center text-destructive p-4 flex flex-col items-center">
          <CameraOff className="w-16 h-16 mb-4" />
          <p className="font-semibold">Erreur de caméra</p>
          <p className="text-sm">{error}</p>
        </div>
      ) : (
        <>
          <div id={qrcodeRegionId} className="w-full h-full" />
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-[250px] h-[250px] relative">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-accent rounded-tl-lg"></div>
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-accent rounded-tr-lg"></div>
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-accent rounded-bl-lg"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-accent rounded-br-lg"></div>
              <ScanLine className="absolute inset-x-0 top-0 w-full h-1 text-accent animate-pulse-scan" style={{ animation: 'pulse-scan 3s infinite' }} />
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
