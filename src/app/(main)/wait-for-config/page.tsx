"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSessionConfig } from '@/hooks/use-session-config';
import { Loader2, Settings } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function WaitForConfigPage() {
    const router = useRouter();
    const { activeAssignments, isLoaded } = useSessionConfig();

    useEffect(() => {
        // If config is set, redirect to scan page
        if (isLoaded && activeAssignments.length > 0) {
            router.replace('/scan');
        }
    }, [activeAssignments, isLoaded, router]);

    return (
        <div className="flex items-center justify-center h-full">
            <Card className="max-w-md w-full">
                <CardHeader className="text-center">
                    <CardTitle className="flex items-center justify-center gap-2">
                        <Loader2 className="h-6 w-6 animate-spin" />
                        En attente de configuration
                    </CardTitle>
                    <CardDescription>
                       Une session de scan doit être activée par un administrateur.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg">
                        <Settings className="mx-auto h-12 w-12" />
                        <p className="mt-4">
                           Veuillez demander à un administrateur d'activer une affectation SLM/trémie pour pouvoir commencer à scanner.
                        </p>
                        <p className="mt-2 text-sm">
                            Cette page se rafraîchira automatiquement.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
