'use client';

import React, { useEffect } from 'react';
import Joyride, { Step, CallBackProps } from 'react-joyride';
import { useTutorial } from './tutorial-provider';
import { useTheme } from 'next-themes';

const tourSteps: Step[] = [
    {
      target: '#nav-settings',
      content: 'Vamos começar por aqui! Clique em "Configurações" para definirmos seu nome de usuário, que será a identificação da sua empresa.',
      disableBeacon: true,
      placement: 'right',
    },
    {
      target: '#nav-whatsapp-connect',
      content: 'Agora, a etapa mais importante. Clique em "Conectar" para vincular o número de WhatsApp que fará os disparos.',
      placement: 'right',
    },
    {
      target: '#nav-contacts',
      content: 'Com o número conectado, o próximo passo é adicionar seus contatos. Você pode fazer isso manualmente ou importar um arquivo CSV.',
       placement: 'right',
    },
    {
      target: '#nav-campaigns',
      content: 'Tudo pronto! Agora clique em "Campanhas" para criar seu primeiro envio e começar a engajar seus clientes.',
       placement: 'right',
    },
     {
      target: '#nav-safety',
      content: 'Uma última dica: antes de disparar, leia nossas dicas de segurança para usar a ferramenta de forma inteligente e evitar bloqueios.',
       placement: 'right',
    },
  ];

export function WelcomeTour() {
  const { isTourRunning, runTour, completeTutorial } = useTutorial();
  const { theme } = useTheme();

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    const finishedStatuses: string[] = ['finished', 'skipped'];

    if (finishedStatuses.includes(status)) {
      completeTutorial();
    }
  };
  
  // This useEffect ensures the body is scrollable when the tour is not active
  useEffect(() => {
    if (!isTourRunning) {
      document.body.style.overflow = 'auto';
    }
  }, [isTourRunning]);

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
              primaryColor: '#008394',
              textColor: theme === 'dark' ? '#f8fafc' : '#0f172a',
              zIndex: 1000,
            },
            buttonNext: {
                backgroundColor: '#008394',
            },
            buttonBack: {
                color: '#0f172a'
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
