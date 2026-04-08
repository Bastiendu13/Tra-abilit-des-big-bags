"use client";

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode';
import { CameraOff, ScanLine } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QrScannerProps {
  onScanSuccess: (decodedText: string, decodedResult: any) => void;
  onScanFailure?: (error: string) => void;
  active: boolean;
}

export function QrScanner({ onScanSuccess, onScanFailure, active }: QrScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const qrcodeRegionId = "qr-code-reader";

  // Use a ref to hold the latest callbacks to avoid dependency issues with useEffect
  const onScanSuccessRef = useRef(onScanSuccess);
  onScanSuccessRef.current = onScanSuccess;

  const onScanFailureRef = useRef(onScanFailure);
  onScanFailureRef.current = onScanFailure;

  useEffect(() => {
    if (!scannerRef.current) {
        // verbose=false to prevent library-level console logs
        scannerRef.current = new Html5Qrcode(qrcodeRegionId, false);
    }
    const scanner = scannerRef.current;
    const config = { fps: 10, qrbox: { width: 250, height: 250 } };

    const startScanner = async () => {
      // Wrap callbacks to use the latest from refs
      const successCallback = (text: string, result: any) => onScanSuccessRef.current(text, result);
      const failureCallback = (err: string) => {
        if (onScanFailureRef.current) {
            onScanFailureRef.current(err)
        }
        // Non-fatal scanning errors can be ignored or logged here.
      };

      try {
        const cameras = await Html5Qrcode.getCameras();
        if (cameras && cameras.length > 0) {
            let cameraId;
            // Find back camera
            const backCamera = cameras.find(c => c.label.toLowerCase().includes('back'));
            if (backCamera) {
                cameraId = backCamera.id;
            } else {
                // Fallback to the first camera if no back camera is found
                cameraId = cameras[0].id;
            }

            await scanner.start(
                cameraId,
                config,
                successCallback,
                failureCallback
            );
            setError(null);
        } else {
            setError("Aucune caméra trouvée sur cet appareil.");
        }
      } catch (err: any) {
        console.error("Erreur de démarrage de la caméra:", err);
        setError("Impossible d'accéder à la caméra. Veuillez vérifier les autorisations de votre navigateur.");
      }
    };

    const stopScanner = () => {
      // Check if scanner is in a stoppable state.
      if (scanner && (scanner.getState() === Html5QrcodeScannerState.SCANNING || scanner.getState() === Html5QrcodeScannerState.PAUSED)) {
        scanner.stop().catch(err => {
          // 'AbortError' is expected if the user navigates away or stops quickly.
          if (err.name !== 'AbortError') {
            console.error("Échec de l'arrêt du scanner", err);
          }
        });
      }
    }

    if (active) {
      // Ensure we're not already trying to scan
      if (scanner.getState() === Html5QrcodeScannerState.NOT_STARTED) {
        startScanner();
      }
    } else {
      stopScanner();
    }

    // Cleanup on unmount or when `active` changes.
    return () => {
      stopScanner();
    };
  }, [active]);

  return (
    <div className={cn("w-full max-w-lg mx-auto aspect-square rounded-lg border-4 border-dashed border-primary/50 bg-secondary/50 overflow-hidden relative flex items-center justify-center", !active && 'hidden')}>
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
