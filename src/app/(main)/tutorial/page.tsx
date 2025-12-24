'use client';
import { useEffect } from 'react';
import { PageHeader, PageHeaderHeading, PageHeaderDescription } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { useTutorial } from '@/components/tutorial-provider';
import { PlayCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function TutorialPage() {
  const { startTutorial } = useTutorial();
  const router = useRouter();

  const handleStart = () => {
    // Navigate to dashboard first, then start the tutorial
    router.push('/dashboard');
    // A small delay ensures the dashboard has time to render before the tour starts
    setTimeout(() => {
        startTutorial();
    }, 300);
  };

  return (
    <div className="container text-center">
      <PageHeader>
        <PageHeaderHeading>Tutorial Interativo</PageHeaderHeading>
        <PageHeaderDescription>
          Precisa de uma ajudinha? Clique no botão abaixo para iniciar nosso guia passo a passo e aprender a usar o sistema.
        </PageHeaderDescription>
      </PageHeader>
      
      <Button size="lg" onClick={handleStart}>
        <PlayCircle className="mr-2 h-5 w-5" />
        Iniciar Guia Interativo
      </Button>
    </div>
  );
}
