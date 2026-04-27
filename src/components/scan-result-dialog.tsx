"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, Package, Server, ChevronRight } from 'lucide-react';

interface ScanResultDialogProps {
  sml: string;
  tremie: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ScanResultDialog({ sml, tremie, isOpen, onClose }: ScanResultDialogProps) {

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <CheckCircle className="h-8 w-8 text-green-500" />
            Scan Réussi
          </DialogTitle>
          <DialogDescription>
            L'association produit/trémie a été enregistrée avec succès.
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
            <h4 className="text-center font-semibold text-sm mb-3 text-muted-foreground">
                Récapitulatif du Scan
            </h4>
            <div className="flex items-center justify-center gap-4 rounded-lg border bg-secondary/50 p-4 text-lg">
                <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-muted-foreground" />
                    <span className="font-bold">{sml}</span>
                </div>
                <ChevronRight className="h-6 w-6 text-muted-foreground" />
                <div className="flex items-center gap-2">
                    <Server className="h-5 w-5 text-muted-foreground" />
                    <span className="font-bold">{tremie}</span>
                </div>
            </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose} className="w-full">
            Nouveau Scan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
