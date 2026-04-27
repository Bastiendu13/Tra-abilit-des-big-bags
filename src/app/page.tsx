"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserProfile } from "@/hooks/use-user-profile";
import { Loader2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  const router = useRouter();
  const { profile, isLoaded } = useUserProfile();

  useEffect(() => {
    if (isLoaded) {
      if (profile === 'administrateur') {
        router.replace('/config');
      } else if (profile === 'utilisateur') {
        router.replace('/scan');
      }
    }
  }, [profile, isLoaded, router]);

  if (!isLoaded) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (profile) {
    // Should be redirected, but show loading just in case.
    return (
       <div className="flex h-screen w-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="flex items-center justify-center gap-2 text-3xl">
            <Package className="h-8 w-8 text-primary" />
            TraceFacile
          </CardTitle>
          <CardDescription>
            Suivi de traçabilité simple et efficace par QR code.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p>Veuillez vous connecter pour continuer.</p>
           <Button onClick={() => router.push('/login')} size="lg">
             Connexion Administrateur
           </Button>
        </CardContent>
      </Card>
    </div>
  );
}
