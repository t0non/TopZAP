// @ts-nocheck
'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { contacts } from '@/lib/data';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon, Loader2, Sparkles } from 'lucide-react';
import { Calendar } from '../ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useState } from 'react';
import { handleOptimizeMessage } from '@/app/actions';
import type { OptimizeMessageContentOutput } from '@/ai/flows/optimize-message-content';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '../ui/dialog';
import { Checkbox } from '../ui/checkbox';

const formSchema = z.object({
  name: z.string().min(5, { message: 'O nome da campanha deve ter pelo menos 5 caracteres.' }),
  contactSegment: z.string().min(1, { message: 'Por favor, selecione um segmento de contato.' }),
  message: z.string().min(10, { message: 'A mensagem deve ter pelo menos 10 caracteres.' }),
  sendDate: z.date({
    required_error: 'A data de envio é obrigatória.',
  }),
  liabilityAccepted: z.boolean().refine((val) => val === true, {
    message: 'Você deve aceitar os termos de responsabilidade para enviar a campanha.',
  }),
});

export function CreateCampaignForm() {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationResult, setOptimizationResult] =
    useState<OptimizeMessageContentOutput | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      contactSegment: '',
      message: '',
      liabilityAccepted: false,
    },
  });

  const liabilityAccepted = form.watch('liabilityAccepted');

  async function onSubmit(values: z.infer<typeof formSchema>) {
    toast({
      title: "Campanha Agendada!",
      description: `A campanha "${values.name}" foi agendada para ${format(values.sendDate, "PPP", { locale: ptBR })}.`
    })
  }

  const onOptimize = async () => {
    const message = form.getValues('message');
    if (!message || message.length < 10) {
      form.setError('message', {
        type: 'manual',
        message: 'Por favor, insira uma mensagem com pelo menos 10 caracteres para otimizar.',
      });
      return;
    }
    setIsOptimizing(true);
    try {
      const result = await handleOptimizeMessage({ message });
      setOptimizationResult(result);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro na Otimização",
        description: error instanceof Error ? error.message : "Ocorreu um erro desconhecido.",
      })
    } finally {
      setIsOptimizing(false);
    }
  };

  const contactSegments = ['Todos', ...Array.from(new Set(contacts.map((c) => c.segment)))];

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Detalhes da Campanha</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Campanha</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Lançamento de Inverno" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField
                  control={form.control}
                  name="contactSegment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Segmento de Contatos</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um segmento" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {contactSegments.map((segment) => (
                            <SelectItem key={segment} value={segment}>
                              {segment}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sendDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Data de Envio</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={'outline'}
                              className={cn(
                                'w-full pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground'
                              )}
                            >
                              {field.value ? (
                                format(field.value, 'PPP', { locale: ptBR })
                              ) : (
                                <span>Escolha uma data</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => {
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);
                                return date < today;
                            }}
                            initialFocus
                            locale={ptBR}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Mensagem</FormLabel>
                      <Button type="button" variant="outline" size="sm" onClick={onOptimize} disabled={isOptimizing}>
                        {isOptimizing ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Sparkles className="mr-2 h-4 w-4" />
                        )}
                        Otimizar com IA
                      </Button>
                    </div>
                    <FormControl>
                      <Textarea
                        placeholder="Olá [Nome], confira nossas novidades..."
                        className="min-h-[150px] resize-y"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Use [Nome] para personalizar a mensagem com o nome do contato.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="liabilityAccepted"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Termo de Responsabilidade
                      </FormLabel>
                      <FormDescription>
                        Estou ciente de que o uso massivo para contatos frios (spam) viola os termos do WhatsApp e assumo o risco de bloqueio do número. Confirmo que estes contatos aceitaram receber minhas mensagens.
                      </FormDescription>
                       <FormMessage className='pt-2' />
                    </div>
                  </FormItem>
                )}
              />


              <div className="flex justify-end gap-2">
                <Button variant="ghost">Salvar como Rascunho</Button>
                <Button type="submit" disabled={!liabilityAccepted}>Agendar Campanha</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <Dialog open={!!optimizationResult} onOpenChange={(open) => !open && setOptimizationResult(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Otimização de Mensagem com IA</DialogTitle>
            <DialogDescription>
              Analisamos sua mensagem e aqui estão nossas sugestões para melhorar o impacto.
            </DialogDescription>
          </DialogHeader>
          {optimizationResult && (
            <div className="grid gap-6 py-4">
              <Alert>
                <Sparkles className="h-4 w-4" />
                <AlertTitle>Mensagem Otimizada</AlertTitle>
                <AlertDescription>
                  <p className="font-mono text-sm p-4 bg-muted rounded-md">{optimizationResult.optimizedMessage}</p>
                </AlertDescription>
              </Alert>

              <div>
                <h4 className="font-semibold mb-2">Sugestões Específicas:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  {optimizationResult.suggestions.map((suggestion, index) => (
                    <li key={index}>{suggestion}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Raciocínio da IA:</h4>
                <p className="text-sm text-muted-foreground">{optimizationResult.reasoning}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
                <Button type="button" variant="secondary">Fechar</Button>
            </DialogClose>
            <Button
              type="button"
              onClick={() => {
                if (optimizationResult) {
                  form.setValue('message', optimizationResult.optimizedMessage);
                }
                setOptimizationResult(null);
                toast({ title: "Mensagem atualizada com sucesso!"})
              }}
            >
              Usar esta mensagem
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
