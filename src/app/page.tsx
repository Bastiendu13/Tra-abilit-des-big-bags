"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserProfile } from "@/hooks/use-user-profile";
import { Loader2, Package, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function Home() {
  const router = useRouter();
  const { profile, isLoaded, setProfile } = useUserProfile();

  useEffect(() => {
    if (isLoaded) {
      if (profile === 'administrateur') {
        router.replace('/config');
      } else if (profile === 'utilisateur') {
        router.replace('/scan');
      }
    }
  }, [profile, isLoaded, router]);

  const handleUserLogin = () => {
    setProfile('utilisateur');
    router.push('/scan');
  };

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
            Sélectionnez votre profil pour commencer.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
           <Button onClick={() => router.push('/login')} size="lg" variant="outline">
             Connexion Administrateur
           </Button>
            <div className="flex items-center gap-4">
                <Separator className="flex-1" />
                <span className="text-xs text-muted-foreground">OU</span>
                <Separator className="flex-1" />
            </div>
           <Button onClick={handleUserLogin} size="lg">
             <User className="mr-2 h-5 w-5" />
             Entrer comme Utilisateur
           </Button>
        </CardContent>
      </Card>
    </div>
  );
}
