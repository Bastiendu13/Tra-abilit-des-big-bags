"use client";

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { getTraceabilityContext } from '@/lib/actions';
import type { AISuggestTraceabilityContextOutput } from '@/ai/flows/ai-suggest-traceability-context-flow';
import { useScanHistory } from '@/hooks/use-scan-history';
import { useToast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';
import { CheckCircle, Lightbulb, List, Package, Save, Share2 } from 'lucide-react';

interface ScanResultDialogProps {
  qrData: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ScanResultDialog({ qrData, isOpen, onClose }: ScanResultDialogProps) {
  const [aiContext, setAiContext] = useState<AISuggestTraceabilityContextOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addScan } = useScanHistory();
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && qrData) {
      const fetchContext = async () => {
        setIsLoading(true);
        setError(null);
        setAiContext(null);
        try {
          const context = await getTraceabilityContext(qrData);
          setAiContext(context);
        } catch (e: any) {
          setError(e.message || "Une erreur est survenue lors de l'analyse IA.");
        } finally {
          setIsLoading(false);
        }
      };
      fetchContext();
    }
  }, [isOpen, qrData]);

  const handleSave = () => {
    addScan({ qrData, aiContext: aiContext ?? undefined });
    toast({
      title: "Scan sauvegardé",
      description: "Le résultat du scan a été ajouté à votre historique.",
      action: <ToastAction altText="OK">OK</ToastAction>,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><CheckCircle className="text-green-500" />Scan réussi !</DialogTitle>
          <DialogDescription>
            Voici les informations extraites du code QR et l'analyse de l'IA.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <h4 className="font-semibold text-sm mb-2 text-muted-foreground">Données brutes du QR</h4>
            <p className="text-sm bg-muted p-3 rounded-md font-mono break-all">{qrData}</p>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2"><Lightbulb className="text-primary"/>Analyse IA</h3>
            {isLoading && <AISkeletonLoader />}
            {error && <p className="text-sm text-destructive">{error}</p>}
            {aiContext && <AIContextView context={aiContext} />}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Fermer</Button>
          <Button onClick={handleSave} disabled={isLoading}>
            <Save className="mr-2 h-4 w-4" />
            Sauvegarder
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const AIContextView = ({ context }: { context: AISuggestTraceabilityContextOutput }) => (
  <div className="space-y-4">
    <div>
      <h4 className="font-semibold text-sm mb-2 flex items-center gap-2 text-muted-foreground"><Package/>Catégories de produits suggérées</h4>
      <div className="flex flex-wrap gap-2">
        {context.productCategories.map((cat, i) => <Badge key={i} variant="secondary">{cat}</Badge>)}
      </div>
    </div>
    <div>
      <h4 className="font-semibold text-sm mb-2 flex items-center gap-2 text-muted-foreground"><Share2/>Informations d'origine</h4>
      <div className="flex flex-wrap gap-2">
        {context.originInformation.map((info, i) => <Badge key={i} variant="outline">{info}</Badge>)}
      </div>
    </div>
    <div>
      <h4 className="font-semibold text-sm mb-2 flex items-center gap-2 text-muted-foreground"><List/>Prochaines étapes possibles</h4>
      <ul className="list-disc list-inside text-sm space-y-1">
        {context.nextSteps.map((step, i) => <li key={i}>{step}</li>)}
      </ul>
    </div>
     <div>
      <h4 className="font-semibold text-sm mb-2 text-muted-foreground">Résumé</h4>
      <p className="text-sm text-foreground/80">{context.summary}</p>
    </div>
  </div>
);

const AISkeletonLoader = () => (
  <div className="space-y-4">
    <div className="space-y-2">
      <Skeleton className="h-4 w-1/3" />
      <div className="flex gap-2">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-6 w-32" />
      </div>
    </div>
    <div className="space-y-2">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
    </div>
  </div>
);
