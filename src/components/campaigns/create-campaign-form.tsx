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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { contacts } from '@/lib/data';
import {
  CalendarIcon, Loader2, Sparkles, AlertTriangle, Paperclip, FileText, Video, Image as ImageIcon, Music, MessageSquare, Users, Star, Cake, ShieldX, Globe
} from 'lucide-react';
import { useState, useRef, useEffect, useMemo } from 'react';
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
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';
import { PhonePreview } from './phone-preview';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const formSchema = z.object({
  name: z.string().min(5, { message: 'O nome da campanha deve ter pelo menos 5 caracteres.' }),
  contactSegment: z.string().min(1, { message: 'Por favor, selecione um segmento de contato.' }),
  message: z.string().optional(),
  sendSpeed: z.string().default('safe'),
  liabilityAccepted: z.boolean().refine((val) => val === true, {
    message: 'Você deve aceitar os termos de responsabilidade para continuar.',
  }),
  media: z.any().optional(),
}).refine(data => data.message || data.media, {
    message: "A campanha precisa ter uma mensagem ou um anexo de mídia.",
    path: ['message'],
});

export function CreateCampaignForm() {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationResult, setOptimizationResult] =
    useState<OptimizeMessageContentOutput | null>(null);
  const [messageType, setMessageType] = useState('text');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      contactSegment: 'all',
      message: '',
      sendSpeed: 'safe',
      liabilityAccepted: false,
    },
  });

  const { watch, setValue } = form;
  const messageValue = watch('message');
  const sendSpeedValue = watch('sendSpeed');
  const mediaFile = watch('media');
  const liabilityAccepted = watch('liabilityAccepted');
  const selectedSegment = watch('contactSegment');
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [fileName, setFileName] = useState('');

  const recipientCount = useMemo(() => {
    const activeContacts = contacts.filter(c => c.segment !== 'Inactive');
    switch (selectedSegment) {
        case 'all':
            return activeContacts.length;
        case 'vip':
            return activeContacts.filter(c => c.segment === 'VIP').length;
        case 'regular':
            return activeContacts.filter(c => c.segment === 'Regular' || c.segment === 'New').length;
        case 'birthday_month':
            const currentMonth = new Date().getMonth();
            return activeContacts.filter(c => c.birthday && new Date(c.birthday).getMonth() === currentMonth).length;
        default:
            return 0;
    }
  }, [selectedSegment]);

  const blockedCount = contacts.filter(c => c.segment === 'Inactive').length;

  useEffect(() => {
    if (mediaFile) {
        setFileName(mediaFile.name);
    } else {
        setFileName('');
    }
  }, [mediaFile]);
  
  useEffect(() => {
    // Clear media when switching back to text tab
    if (messageType === 'text') {
      setValue('media', null);
    }
  }, [messageType, setValue]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    toast({
      title: "Campanha Enviada para a Fila!",
      description: `A campanha "${values.name}" foi iniciada com sucesso.`
    })
    console.log(values);
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

  const handleVariableInsert = (variable: string) => {
    const textarea = textareaRef.current;
    if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const newText = text.substring(0, start) + `[${variable}]` + text.substring(end);
        setValue('message', newText, { shouldValidate: true });
        textarea.focus();
        setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = start + variable.length + 2;
        }, 0)
    }
  };
  
  const MediaUploadSlot = ({ type }: { type: 'media' | 'audio' | 'doc' }) => (
    <FormField
      control={form.control}
      name="media"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Anexo</FormLabel>
          <FormControl>
            <div className="relative">
                <Input 
                    type="file" 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={(e) => field.onChange(e.target.files ? e.target.files[0] : null)}
                    accept={
                        type === 'media' ? 'image/*,video/*' :
                        type === 'audio' ? 'audio/*' :
                        type === 'doc' ? '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx' : '*'
                    }
                />
                <div className="flex items-center justify-center w-full h-32 border-2 border-dashed rounded-md text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                    {fileName ? (
                        <p>{fileName}</p>
                    ) : (
                        <div className='text-center space-y-1'>
                            { type === 'media' && <ImageIcon className="mx-auto h-8 w-8" /> }
                            { type === 'audio' && <Music className="mx-auto h-8 w-8" /> }
                            { type === 'doc' && <FileText className="mx-auto h-8 w-8" /> }
                            <p className='text-sm'>
                                {
                                    type === 'media' ? 'Clique para anexar Imagem ou Vídeo' :
                                    type === 'audio' ? 'Clique para anexar um Áudio' :
                                    'Clique para anexar um Documento'
                                }
                            </p>
                        </div>
                    )}
                </div>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
  
  const MessageSlot = ({label = "Mensagem", placeholder = "Olá [Nome], confira nossas novidades...", isOptional=false}) => (
    <FormField
        control={form.control}
        name="message"
        render={({ field }) => (
        <FormItem>
            <div className="flex items-center justify-between gap-2 flex-wrap">
                <FormLabel>{label} {isOptional && <span className='text-muted-foreground text-xs'>(Opcional)</span>}</FormLabel>
                <div className="flex items-center gap-2">
                    <span className='text-xs text-muted-foreground'>Inserir variável:</span>
                    <Button type="button" variant="outline" size="sm" className="h-7 px-2" onClick={() => handleVariableInsert('Nome')}>[Nome]</Button>
                    <Button type="button" variant="outline" size="sm" className="h-7 px-2" onClick={() => handleVariableInsert('Telefone')}>[Telefone]</Button>
                </div>
            </div>
            <FormControl>
            <Textarea
                placeholder={placeholder}
                className="min-h-[120px] resize-y"
                {...field}
                ref={textareaRef}
            />
            </FormControl>
            <div className="flex items-center justify-between gap-2 flex-wrap">
                <FormMessage />
                <Button type="button" variant="outline" size="sm" onClick={onOptimize} disabled={isOptimizing || !messageValue}>
                    {isOptimizing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                    Otimizar com IA
                </Button>
            </div>
        </FormItem>
        )}
    />
  )

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Coluna Esquerda e Central (Formulário) */}
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>1. Para quem vamos mandar?</CardTitle>
                <CardDescription>Escolha o grupo de pessoas que receberá sua mensagem.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
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
                 <FormField
                  control={form.control}
                  name="contactSegment"
                  render={({ field }) => (
                    <FormItem>
                        <FormLabel>Grupo de Destinatários</FormLabel>
                        <FormControl>
                            <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2"
                            >
                                <Label className={cn("border-2 rounded-lg p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary transition-all", field.value === 'all' && 'border-primary ring-2 ring-primary')}>
                                    <RadioGroupItem value="all" className="sr-only" />
                                    <Globe className="w-8 h-8"/>
                                    <span className="font-bold text-center">Todos os Contatos</span>
                                    <span className="text-xs text-muted-foreground">Enviar para toda a base.</span>
                                </Label>
                                <Label className={cn("border-2 rounded-lg p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary transition-all", field.value === 'regular' && 'border-primary ring-2 ring-primary')}>
                                    <RadioGroupItem value="regular" className="sr-only" />
                                    <Users className="w-8 h-8"/>
                                    <span className="font-bold text-center">Clientes</span>
                                     <span className="text-xs text-muted-foreground">Pessoas que já compraram.</span>
                                </Label>
                                 <Label className={cn("border-2 rounded-lg p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-yellow-500 transition-all", field.value === 'vip' && 'border-yellow-500 ring-2 ring-yellow-500 text-yellow-600')}>
                                    <RadioGroupItem value="vip" className="sr-only" />
                                    <Star className="w-8 h-8"/>
                                    <span className="font-bold text-center">Clientes VIP</span>
                                     <span className="text-xs text-muted-foreground">Seus melhores compradores.</span>
                                </Label>
                                <Label className={cn("border-2 rounded-lg p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-pink-500 transition-all", field.value === 'birthday_month' && 'border-pink-500 ring-2 ring-pink-500 text-pink-600')}>
                                    <RadioGroupItem value="birthday_month" className="sr-only" />
                                    <Cake className="w-8 h-8"/>
                                    <span className="font-bold text-center">Aniversariantes</span>
                                     <span className="text-xs text-muted-foreground">Do mês atual.</span>
                                </Label>
                            </RadioGroup>
                        </FormControl>
                        <FormMessage />
                        {selectedSegment && (
                        <div className='space-y-2 pt-2'>
                          <FormDescription>
                            Esta campanha será enviada para <strong>{recipientCount}</strong> pessoas.
                          </FormDescription>
                          {blockedCount > 0 && (
                            <Alert variant="default" className="bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-400 [&>svg]:text-blue-700 dark:[&>svg]:text-blue-400">
                              <ShieldX className="h-4 w-4" />
                              <AlertTitle>Proteção Automática</AlertTitle>
                              <AlertDescription>
                                Removemos automaticamente <strong>{blockedCount}</strong> contato(s) da sua lista de bloqueio para este envio.
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>
                      )}
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>2. Compositor de Mensagem</CardTitle>
                <CardDescription>Escolha o formato e crie o conteúdo da sua campanha.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                 <Tabs defaultValue="text" className="w-full" onValueChange={setMessageType}>
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="text"><MessageSquare className="mr-2 h-4 w-4"/>Texto</TabsTrigger>
                        <TabsTrigger value="media"><ImageIcon className="mr-2 h-4 w-4"/>Imagem/Vídeo</TabsTrigger>
                        <TabsTrigger value="audio"><Music className="mr-2 h-4 w-4"/>Áudio</TabsTrigger>
                        <TabsTrigger value="document"><FileText className="mr-2 h-4 w-4"/>Documento</TabsTrigger>
                    </TabsList>
                    <TabsContent value="text" className='pt-4'>
                        <MessageSlot />
                    </TabsContent>
                    <TabsContent value="media" className='pt-4 space-y-4'>
                        <MediaUploadSlot type="media" />
                        <MessageSlot label="Legenda" placeholder="Digite uma legenda opcional..." isOptional />
                    </TabsContent>
                    <TabsContent value="audio" className='pt-4 space-y-4'>
                         <MediaUploadSlot type="audio" />
                    </TabsContent>
                    <TabsContent value="document" className='pt-4 space-y-4'>
                        <MediaUploadSlot type="doc" />
                        <MessageSlot label="Legenda" placeholder="Digite uma legenda opcional..." isOptional />
                    </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>3. Configuração de Envio e Segurança</CardTitle>
                <CardDescription>Defina a velocidade para evitar bloqueios e confirme sua responsabilidade.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="sendSpeed"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Velocidade de Envio (Delay)</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="safe" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              🐢 Modo Seguro (20-45s / msg) - Recomendado
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="fast" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              🐇 Modo Rápido (10-20s / msg) - Risco Médio
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="turbo" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              🚀 Modo Turbo (5-10s / msg) - Alto Risco
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {sendSpeedValue === 'turbo' && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Modo de Alto Risco Ativado!</AlertTitle>
                    <AlertDescription>
                      O Modo Turbo aumenta significativamente a chance de bloqueio do seu número. Use com extrema cautela e apenas para contatos que esperam sua mensagem.
                    </AlertDescription>
                  </Alert>
                )}
                
                <FormField
                    control={form.control}
                    name="liabilityAccepted"
                    render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-background">
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
                            Declaro que os contatos desta lista consentiram em receber mensagens. Entendo que o uso abusivo viola as políticas do WhatsApp e pode acarretar no bloqueio definitivo do meu número.
                        </FormDescription>
                        <FormMessage className='pt-2' />
                        </div>
                    </FormItem>
                    )}
                />
              </CardContent>
            </Card>

            <div className="flex justify-end gap-3">
              <Button variant="ghost">Salvar como Rascunho</Button>
              <Button type="submit" disabled={!liabilityAccepted} size="lg">
                Iniciar Disparo Agora
              </Button>
            </div>
          </div>

          {/* Coluna Direita (Preview) */}
          <div className="lg:col-span-1 sticky top-6">
             <Card>
                <CardHeader>
                    <CardTitle>Preview da Mensagem</CardTitle>
                </CardHeader>
                <CardContent>
                    <PhonePreview message={messageValue} media={mediaFile} />
                </CardContent>
             </Card>
          </div>
        </form>
      </Form>
      
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
