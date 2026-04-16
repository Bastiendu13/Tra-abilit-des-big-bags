"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, Package } from 'lucide-react';

interface ScanResultDialogProps {
  tremie: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ScanResultDialog({ tremie, isOpen, onClose }: ScanResultDialogProps) {

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><CheckCircle className="text-green-500" />SML Reconnu</DialogTitle>
          <DialogDescription>
            Le produit doit être placé dans la trémie suivante.
          </DialogDescription>
        </DialogHeader>

        <div className="py-8 text-center">
            <h4 className="font-semibold text-sm mb-2 text-muted-foreground flex items-center justify-center gap-2">
                <Package /> Trémie Affectée
            </h4>
            <p className="text-6xl font-bold text-primary">{tremie}</p>
        </div>

        <DialogFooter>
          <Button onClick={onClose} className="w-full">OK</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
