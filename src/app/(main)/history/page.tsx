"use client";

import { useScanHistory } from '@/hooks/use-scan-history';
import { Button } from '@/components/ui/button';
import { FileDown, History, Trash2, Server } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { exportToCsv } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useUserProfile } from '@/hooks/use-user-profile';

export default function HistoryPage() {
  const { scans, clearHistory, isLoaded } = useScanHistory();
  const { toast } = useToast();
  const { profile } = useUserProfile();

  const handleExport = () => {
    if (scans.length === 0) {
      toast({
        title: "Exportation impossible",
        description: "L'historique est vide.",
        variant: "destructive"
      });
      return;
    }
    const flattenedData = scans.map(scan => {
      let productQr = '';
      const match = scan.qrData.match(/Produit: (.*), Trémie: (.*)/);
      if (match && match.length === 3) {
        productQr = match[1];
      } else {
        // Fallback for older data that might not have the "Produit: ..., Trémie: ..." format
        productQr = scan.qrData;
      }
      
      const qrDataMap: { [key: string]: string } = productQr
        .split(';')
        .map(part => part.split('='))
        .reduce((acc, [key, value]) => {
          if (key && value) {
            acc[key.trim().toUpperCase()] = value.trim();
          }
          return acc;
        }, {} as { [key: string]: string });

      return {
        'Produit': qrDataMap['SLM'] || 'N/A',
        'Fabricant': qrDataMap['FAB'] || 'N/A',
        'Date de fabrication': qrDataMap['DATE'] || 'N/A',
        'Numéro du lot': qrDataMap['LOT'] || 'N/A',
        'Date de scan': new Date(scan.timestamp).toLocaleString('fr-FR'),
        'Trémie': scan.tremie,
      };
    });
    exportToCsv(`tracabilite-big-bags-historique-${new Date().toISOString()}.csv`, flattenedData);
    toast({
      title: "Exportation réussie",
      description: "Votre historique a été téléchargé en CSV.",
    });
  };

  const handleClear = () => {
    clearHistory();
    toast({
      title: "Historique vidé",
      description: "Tous les scans ont été supprimés.",
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Historique des scans</h1>
          <p className="text-muted-foreground">
            Retrouvez ici tous les codes QR que vous avez scannés.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport} disabled={scans.length === 0}>
            <FileDown className="mr-2 h-4 w-4" />
            Exporter
          </Button>
          {profile === 'administrateur' && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={scans.length === 0}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Vider
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Cette action est irréversible et supprimera définitivement tout votre historique de scans.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClear}>Confirmer</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      {!isLoaded ? (
        <p>Chargement de l'historique...</p>
      ) : scans.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <History className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">Aucun scan dans l'historique</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Commencez par scanner un code QR pour le voir apparaître ici.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {scans.map(scan => (
            <Card key={scan.id}>
              <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle className="break-all text-lg">{scan.qrData}</CardTitle>
                    <Badge variant="outline" className="flex-shrink-0 ml-4">
                        <Server className="mr-2 h-4 w-4"/>
                        {scan.SLM} / {scan.tremie}
                    </Badge>
                </div>
                <CardDescription>
                  Scanné le {new Date(scan.timestamp).toLocaleString('fr-FR')}
                </CardDescription>
              </CardHeader>
              {scan.aiContext && (
                <CardContent>
                  <Accordion type="single" collapsible>
                    <AccordionItem value={scan.id}>
                      <AccordionTrigger>Voir l'analyse IA</AccordionTrigger>
                      <AccordionContent className="space-y-4 pt-4">
                        <p className="text-sm">{scan.aiContext.summary}</p>
                         <div>
                            <h4 className="font-semibold text-sm mb-2">Catégories :</h4>
                            <div className="flex flex-wrap gap-2">
                                {scan.aiContext.productCategories.map((cat, i) => <Badge key={i} variant="secondary">{cat}</Badge>)}
                            </div>
                        </div>
                        <div>
                            <h4 className="font-semibold text-sm mb-2">Origine :</h4>
                             <div className="flex flex-wrap gap-2">
                                {scan.aiContext.originInformation.map((info, i) => <Badge key={i} variant="outline">{info}</Badge>)}
                            </div>
                        </div>
                        <div>
                            <h4 className="font-semibold text-sm mb-2">Prochaines étapes :</h4>
                            <ul className="list-disc list-inside text-sm space-y-1">
                                {scan.aiContext.nextSteps.map((step, i) => <li key={i}>{step}</li>)}
                            </ul>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
