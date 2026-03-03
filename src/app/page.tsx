import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { QrCode } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function Home() {
  const heroImage = PlaceHolderImages.find(p => p.id === 'hero-image');

  return (
    <div className="relative w-full h-screen bg-background">
      {heroImage && (
         <Image
            src={heroImage.imageUrl}
            alt={heroImage.description}
            fill
            className="object-cover opacity-10 dark:opacity-20"
            data-ai-hint={heroImage.imageHint}
            priority
        />
      )}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
        <div className="p-8 bg-background/80 backdrop-blur-sm rounded-xl border border-border/20 shadow-2xl">
          <h1 className="text-5xl md:text-7xl font-bold text-primary mb-4 font-headline tracking-tight">
            TraceFacile
          </h1>
          <p className="text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto mb-8">
            Suivez la traçabilité de vos produits en toute simplicité. Scannez, analysez et exportez les données en quelques clics.
          </p>
          <Button asChild size="lg" className="shadow-lg">
            <Link href="/scan">
              <QrCode className="mr-2 h-5 w-5" />
              Commencer à scanner
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
