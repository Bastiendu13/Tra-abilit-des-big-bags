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

  const onScanSuccessRef = useRef(onScanSuccess);
  onScanSuccessRef.current = onScanSuccess;

  const onScanFailureRef = useRef(onScanFailure);
  onScanFailureRef.current = onScanFailure;

  useEffect(() => {
    // Using a timeout to defer scanner initialization. This helps prevent race conditions
    // where the library tries to access the DOM element before it's fully painted by the browser,
    // which can lead to errors like "Cannot read properties of null (reading 'clientWidth')".
    const initTimeout = setTimeout(() => {
      // Ensure the DOM element exists before proceeding.
      if (!document.getElementById(qrcodeRegionId)) {
        console.warn("QR scanner DOM element not found on init.");
        return;
      }
      
      const scanner = new Html5Qrcode(qrcodeRegionId, false);
      scannerRef.current = scanner;

      const config = { fps: 10, qrbox: { width: 250, height: 250 } };

      const successCallback = (text: string, result: any) => {
        if (!hasScannedRef.current) {
          hasScannedRef.current = true;
          onScanSuccessRef.current(text, result);
        }
      };

      const failureCallback = (err: string) => {
        if (onScanFailureRef.current) {
          onScanFailureRef.current(err);
        }
      };

      const startScanner = async () => {
        if (!document.getElementById(qrcodeRegionId)) {
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
          const errorMessage = (typeof err === 'string' ? err : err?.message) || '';
          if (errorMessage.includes("Cannot transition to a new state")) {
              console.warn("Caught a benign scanner transition error on remount.");
          } else {
              // The error is re-thrown by Next.js dev overlay, so no need to console.error here.
              setError("Impossible d'accéder à la caméra. Veuillez vérifier les autorisations de votre navigateur.");
          }
        }
      };

      startScanner();
    }, 100); // 100ms delay is usually sufficient for the DOM to be ready.

    return () => {
      clearTimeout(initTimeout);
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(err => {
          const errorMessage = (typeof err === 'string' ? err : err?.message) || '';
          if (err.name !== 'NotScanningError' && !errorMessage.includes("Cannot transition to a new state")) {
            console.warn("Échec de l'arrêt du scanner lors du nettoyage:", err);
          }
        });
      }
    };
  }, []); // Empty dependency array ensures this runs only once on mount.


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
