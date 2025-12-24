'use client';

import React from 'react';
import Joyride, { Step, CallBackProps } from 'react-joyride';
import { useTutorial } from './tutorial-provider';
import { useTheme } from 'next-themes';

const tourSteps: Step[] = [
    {
      target: 'body',
      content: 'Vamos configurar tudo em 30 segundos? Clique em Próximo.',
      title: 'Bem-vindo ao WhatsConnect!',
      placement: 'center',
      disableBeacon: true,
    },
    {
      target: '#tour-connect-wa',
      title: 'Primeiro Passo',
      content: 'Escaneie o QR Code aqui para conectar seu WhatsApp.',
      placement: 'right',
    },
    {
      target: '#tour-stats-card',
      title: 'Seus Resultados',
      content: 'Aqui você vai ver quantas mensagens foram enviadas e sua economia.',
       placement: 'bottom',
    },
    {
      target: '#tour-new-campaign',
      title: 'Mandar Mensagem',
      content: 'Quando estiver pronto, clique aqui para criar seu primeiro disparo.',
       placement: 'left',
    },
  ];

export function WelcomeTour() {
  const { isTourRunning, completeTutorial } = useTutorial();
  const { theme } = useTheme();

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    const finishedStatuses: string[] = ['finished', 'skipped'];

    if (finishedStatuses.includes(status)) {
      completeTutorial();
    }
  };

  return (
    <Joyride
        steps={tourSteps}
        run={isTourRunning}
        continuous
        showProgress
        showSkipButton
        callback={handleJoyrideCallback}
        styles={{
            options: {
              arrowColor: theme === 'dark' ? '#1f2937' : '#fff',
              backgroundColor: theme === 'dark' ? '#1f2937' : '#fff',
              primaryColor: '#128C7E',
              textColor: theme === 'dark' ? '#f8fafc' : '#0f172a',
              zIndex: 1000,
            },
            buttonNext: {
                backgroundColor: '#25D366',
            },
            buttonBack: {
                color: theme === 'dark' ? '#f8fafc' : '#0f172a'
            },
            spotlight: {
                borderRadius: '8px',
            }
        }}
        locale={{
            back: 'Anterior',
            close: 'Fechar',
            last: 'Fim',
            next: 'Próximo',
            skip: 'Pular',
        }}
    />
  );
}
