import { PageHeader, PageHeaderHeading, PageHeaderDescription } from '@/components/page-header';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';


export default function SafetyPage() {
  return (
    <div className="container">
      <PageHeader>
        <PageHeaderHeading>Central de Segurança e Boas Práticas</PageHeaderHeading>
        <PageHeaderDescription>
          Entenda os limites e responsabilidades ao usar a automação para garantir a longevidade da sua operação.
        </PageHeaderDescription>
      </PageHeader>
      
      <div className="space-y-8">
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>API Não-Oficial: Entenda a Natureza da Ferramenta</AlertTitle>
          <AlertDescription>
            Este sistema utiliza automação de navegador para operar, simulando as ações que um usuário faria em um navegador web. 
            Não é uma API oficial do WhatsApp. Isso significa que está sujeito a mudanças e interrupções caso o WhatsApp altere seu funcionamento. 
            O uso indevido e em excesso pode levar ao bloqueio do número.
          </AlertDescription>
        </Alert>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>O que é "aquecer" um chip de WhatsApp?</AccordionTrigger>
            <AccordionContent>
              "Aquecer" um número significa simular um comportamento humano normal por um período antes de iniciar envios em massa. 
              Comece conversando manualmente com contatos salvos, participe de grupos e aumente gradualmente o volume de mensagens. 
              Um chip novo que começa a enviar centenas de mensagens no primeiro dia tem altíssima chance de ser banido.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>Quais são os principais motivos de bloqueio?</AccordionTrigger>
            <AccordionContent>
              <ul className="list-disc space-y-2 pl-6">
                <li><strong>Spam:</strong> Enviar mensagens em massa para contatos que não solicitaram ou não esperam seu contato.</li>
                <li><strong>Velocidade:</strong> Enviar muitas mensagens em um curto intervalo de tempo. Use os delays de segurança.</li>
                <li><strong>Conteúdo:</strong> Enviar links suspeitos, maliciosos, conteúdo adulto, de ódio ou proibido pelos termos de serviço.</li>
                <li><strong>Denúncias:</strong> Se muitos usuários denunciarem seu número como spam, o bloqueio é quase certo.</li>
              </ul>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger>Qual a minha responsabilidade legal (LGPD)?</AccordionTrigger>
            <AccordionContent>
              Você é inteiramente responsável por garantir que sua base de contatos seja "opt-in", ou seja, que as pessoas tenham consentido previamente em receber suas mensagens. 
              A Lei Geral de Proteção de Dados (LGPD) exige o consentimento explícito do titular dos dados para comunicações de marketing. 
              Não compre listas de contatos. Use o sistema apenas para se comunicar com sua base de clientes e leads qualificados.
            </AccordionContent>
          </AccordionItem>
           <AccordionItem value="item-4">
            <AccordionTrigger>O que é a "Regra dos 3 Nãos"?</AccordionTrigger>
            <AccordionContent>
              É uma diretriz simples para evitar problemas:
              <ol className="list-decimal space-y-2 pl-6 mt-2">
                  <li><strong>NÃO</strong> envie spam para quem não te conhece.</li>
                  <li><strong>NÃO</strong> envie links suspeitos, vírus ou conteúdo ilegal/imoral.</li>
                  <li><strong>NÃO</strong> finja ser outra pessoa ou empresa.</li>
              </ol>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

    </div>
  );
}
