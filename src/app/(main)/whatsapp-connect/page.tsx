'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { PageHeader, PageHeaderHeading, PageHeaderDescription } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, QrCode, Smartphone, CheckCircle2, RefreshCw, LogOut, Link as LinkIcon, Wifi, WifiOff, ShieldCheck } from 'lucide-react';
import Image from 'next/image';
import { initInstance, connectInstance, getInstanceStatus, disconnectInstance } from '@/app/actions/whatsapp-actions';
import { useToast } from '@/hooks/use-toast';
import { InstanceStatus } from '@/lib/uazapi-types';
import { useUser, useFirestore } from '@/firebase/provider';
import { doc, onSnapshot, updateDoc, deleteField } from 'firebase/firestore';
import { cn } from '@/lib/utils';

// Helper to check connection status
const checkIsConnected = (statusStr?: string) => {
    return ['connected', 'open', 'authenticated', 'ready'].includes(statusStr || '');
};

export default function WhatsAppConnectPage() {
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  
  // State
  const [instanceName, setInstanceName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState(''); // For Pair Code
  const [instanceToken, setInstanceToken] = useState('');
  const [status, setStatus] = useState<InstanceStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [activeTab, setActiveTab] = useState('qrcode');
  const [isInitializing, setIsInitializing] = useState(false);
  const isInitializingRef = useRef(false);

  // Auto-Init Handler
  const handleAutoInit = useCallback(async (currentUser: any) => {
      if (isInitializingRef.current) return;
      isInitializingRef.current = true;
      setIsInitializing(true);
      
      const cleanName = (currentUser.displayName || 'user').replace(/[^a-zA-Z0-9]/g, '');
      const generatedName = `${cleanName}_${currentUser.uid.slice(0, 4)}`;
      
      try {
          const res = await initInstance(generatedName);
          
          if (res.error) {
              console.error("Auto-init failed:", res.error);
              toast({ variant: "destructive", title: "Erro na Inicialização", description: res.error });
          } else {
              const token = res.token || res.hash || res.instance?.token || res.instance?.hash;
              
              if (token) {
                  // Configure Webhook
                  const webhookUrl = `${window.location.origin}/api/webhooks/whatsapp`;
                  await setWebhook(generatedName, token, webhookUrl);

                  await updateDoc(doc(firestore, 'users', currentUser.uid), {
                      uazapi: {
                          instanceName: generatedName,
                          token: token,
                          createdAt: new Date().toISOString(),
                          status: 'created'
                      }
                  });
                  toast({ title: "Instância Pronta", description: "Conecte seu WhatsApp agora." });
              }
          }
      } catch (e) {
          console.error("Auto-init exception", e);
      } finally {
          isInitializingRef.current = false;
          setIsInitializing(false);
      }
  }, [firestore, toast]);

  // Sync with Firestore & Auto-Init
  useEffect(() => {
      if (!user || !firestore) return;

      const userDocRef = doc(firestore, 'users', user.uid);
      const unsubscribe = onSnapshot(userDocRef, (docSnapshot) => {
          if (docSnapshot.exists()) {
              const data = docSnapshot.data();
              if (data.uazapi && data.uazapi.instanceName && data.uazapi.token) {
                  setInstanceName(data.uazapi.instanceName);
                  setInstanceToken(data.uazapi.token);
                  setIsPolling(true);
              } else {
                  if (!isInitializingRef.current && !data.uazapi) {
                      handleAutoInit(user);
                  }
              }
          }
      });

      return () => unsubscribe();
  }, [user, firestore, handleAutoInit]);

  const isConnected = checkIsConnected(status?.status);

  // Poll status
  const pollStatus = useCallback(async () => {
    if (!instanceName || !instanceToken) return;

    try {
        const result = await getInstanceStatus(instanceName, instanceToken);
        if ('error' in result) {
            // Handle error silently or log
        } else {
            let statusValue = result.status || result.instance?.status;

            if (typeof statusValue === 'object' && statusValue !== null) {
                if ('connected' in statusValue) {
                    statusValue = statusValue.connected ? 'connected' : 'disconnected';
                } else {
                    statusValue = 'unknown'; 
                }
            }

            const normalizedStatus = {
                ...result,
                qrCode: result.qrCode || (result.instance as any)?.qrcode || (result.instance as any)?.qrCode,
                pairCode: result.pairCode || (result.instance as any)?.paircode || (result.instance as any)?.pairCode,
                status: statusValue
            };
            
            setStatus(normalizedStatus);
            
            if (checkIsConnected(normalizedStatus.status) && user) {
                 await updateDoc(doc(firestore, 'users', user.uid), {
                      'uazapi.status': normalizedStatus.status,
                      'uazapi.token': instanceToken
                 }).catch(e => console.error("Error updating status in DB", e));
            }
        }
    } catch (e) {
        console.error("Polling error", e);
    }
  }, [instanceName, instanceToken, user, firestore]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPolling && instanceName && instanceToken) {
        pollStatus();
        interval = setInterval(pollStatus, 3000);
    }
    return () => clearInterval(interval);
  }, [isPolling, pollStatus, instanceName, instanceToken]);

  // Handlers
  const handleGenerateQR = async () => {
     if (!instanceToken) return;
     if (isConnected) return;
     
     setIsLoading(true);
     try {
         const res = await connectInstance(instanceName, instanceToken);
         if (res.error) {
             toast({ variant: "destructive", title: "Erro", description: res.error });
         } else {
             setIsPolling(true);
             toast({ title: "Gerado", description: "Aguarde o QR Code..." });
         }
     } finally {
         setIsLoading(false);
     }
  };

  const handleGeneratePairCode = async () => {
      if (!phoneNumber) {
          toast({ variant: "destructive", title: "Obrigatório", description: "Informe o número do celular." });
          return;
      }
      if (!instanceToken) return;
      if (isConnected) return;

      setIsLoading(true);
      try {
          const res = await connectInstance(instanceName, instanceToken, phoneNumber);
           if (res.error) {
             toast({ variant: "destructive", title: "Erro", description: res.error });
         } else {
             setIsPolling(true);
             toast({ title: "Solicitado", description: "Código de pareamento gerado." });
         }
      } finally {
          setIsLoading(false);
      }
  };

  const handleDisconnect = async () => {
      if (!instanceName || !instanceToken) return;
      setIsLoading(true);
      try {
          await disconnectInstance(instanceName, instanceToken);
          if (user) {
              await updateDoc(doc(firestore, 'users', user.uid), {
                  uazapi: deleteField()
              });
          }
          setInstanceToken('');
          setInstanceName('');
          setStatus(null);
          setIsPolling(false);
          toast({ title: "Desconectado", description: "Instância removida." });
      } catch (e) {
          console.error(e);
          toast({ variant: "destructive", title: "Erro", description: "Falha ao desconectar." });
      } finally {
          setIsLoading(false);
      }
  };

  if (isUserLoading || (isInitializing && !instanceName)) {
      return (
          <div className="flex h-[80vh] w-full flex-col items-center justify-center gap-4">
              <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <div className="absolute inset-0 animate-ping rounded-full bg-primary/20 delay-150 duration-1000" />
              </div>
              <p className="animate-pulse text-sm font-medium text-muted-foreground">Preparando ambiente seguro...</p>
          </div>
      );
  }

  return (
    <div className="container max-w-6xl px-4 py-8 md:px-6 lg:py-10 animate-in fade-in duration-500">
      <div className="mb-10 flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Conexão WhatsApp</h1>
            <p className="text-muted-foreground">Gerencie a conexão da sua instância para automação de mensagens.</p>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-secondary/50 px-4 py-1.5 backdrop-blur-sm">
             <div className={cn("h-2.5 w-2.5 rounded-full", isConnected ? "bg-green-500 animate-pulse" : "bg-amber-500")} />
             <span className="text-sm font-medium text-secondary-foreground">
                 {isConnected ? "Sistema Operacional" : "Aguardando Vínculo"}
             </span>
          </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Left Column: Status & Device Info */}
        <div className="lg:col-span-5 space-y-6">
            <Card className="overflow-hidden border-none shadow-lg bg-gradient-to-br from-background to-secondary/20">
                <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
                <CardHeader className="relative pb-0">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5 text-primary" />
                        Status da Sessão
                    </CardTitle>
                </CardHeader>
                <CardContent className="relative pt-6">
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                        <div className={cn(
                            "relative mb-4 flex h-24 w-24 items-center justify-center rounded-full border-4 transition-colors duration-500",
                            isConnected ? "border-green-100 bg-green-50" : "border-amber-100 bg-amber-50"
                        )}>
                            {isConnected && status?.profilePictureUrl ? (
                                <Image 
                                    src={status.profilePictureUrl} 
                                    alt="Profile" 
                                    width={96} 
                                    height={96} 
                                    className="rounded-full object-cover h-full w-full p-1" 
                                />
                            ) : isConnected ? (
                                <CheckCircle2 className="h-10 w-10 text-green-600" />
                            ) : (
                                <WifiOff className="h-10 w-10 text-amber-500" />
                            )}
                            
                            {isConnected && (
                                <span className="absolute bottom-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-green-500 ring-4 ring-background">
                                    <Wifi className="h-3 w-3 text-white" />
                                </span>
                            )}
                        </div>

                        <h3 className="text-xl font-bold text-foreground">
                            {isConnected ? (status?.profileName || 'WhatsApp Business') : 'Desconectado'}
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {isConnected ? (status?.phone || status?.id || 'Sessão Ativa') : 'Nenhuma sessão ativa detectada'}
                        </p>

                        {!isConnected && (
                             <div className="mt-6 w-full rounded-lg bg-amber-50/50 p-3 text-sm text-amber-800 border border-amber-100/50">
                                <p className="font-medium">Ação Necessária</p>
                                <p className="text-amber-700/80 mt-1">Escaneie o QR Code ao lado para iniciar.</p>
                             </div>
                        )}
                    </div>
                </CardContent>
                {isConnected && (
                    <CardFooter className="relative bg-muted/30 p-4">
                        <Button 
                            variant="destructive" 
                            onClick={handleDisconnect} 
                            disabled={isLoading} 
                            className="w-full transition-all hover:bg-red-600"
                        >
                            <LogOut className="mr-2 h-4 w-4" /> 
                            {isLoading ? 'Encerrando...' : 'Desconectar Sessão'}
                        </Button>
                    </CardFooter>
                )}
            </Card>

            {/* Features / Instructions List */}
            <div className="space-y-4 pl-2">
                <div className="flex gap-4 items-start">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">1</div>
                    <div>
                        <h4 className="font-medium">Abra o WhatsApp</h4>
                        <p className="text-sm text-muted-foreground">No seu celular, toque em Menu ou Configurações.</p>
                    </div>
                </div>
                <div className="flex gap-4 items-start">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">2</div>
                    <div>
                        <h4 className="font-medium">Dispositivos Conectados</h4>
                        <p className="text-sm text-muted-foreground">Toque em "Conectar um aparelho".</p>
                    </div>
                </div>
                <div className="flex gap-4 items-start">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">3</div>
                    <div>
                        <h4 className="font-medium">Escaneie o Código</h4>
                        <p className="text-sm text-muted-foreground">Aponte a câmera para o QR Code na tela.</p>
                    </div>
                </div>
            </div>
        </div>

        {/* Right Column: Connection Interface */}
        <div className="lg:col-span-7">
            {instanceToken && !isConnected ? (
                <Card className="h-full border-none shadow-lg overflow-hidden">
                    <div className="h-2 w-full bg-gradient-to-r from-primary/50 to-emerald-400" />
                    <CardHeader>
                        <CardTitle>Vincular Novo Dispositivo</CardTitle>
                        <CardDescription>Escolha o método de conexão preferido.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <div className="px-6">
                                <TabsList className="grid w-full grid-cols-2 p-1 bg-muted/50 rounded-xl">
                                    <TabsTrigger value="qrcode" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm">
                                        <QrCode className="mr-2 h-4 w-4" /> QR Code
                                    </TabsTrigger>
                                    <TabsTrigger value="paircode" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm">
                                        <Smartphone className="mr-2 h-4 w-4" /> Código via SMS
                                    </TabsTrigger>
                                </TabsList>
                            </div>
                            
                            <div className="p-6 min-h-[400px] flex flex-col justify-center">
                                <TabsContent value="qrcode" className="mt-0 space-y-6 focus-visible:ring-0">
                                    <div className="flex flex-col items-center justify-center">
                                        <div className="relative flex h-72 w-72 items-center justify-center rounded-3xl bg-white p-4 shadow-inner ring-1 ring-black/5">
                                            {status?.qrCode ? (
                                                <div className="relative h-full w-full overflow-hidden rounded-xl">
                                                    <Image 
                                                        src={status.qrCode.startsWith('data:image') ? status.qrCode : `data:image/png;base64,${status.qrCode}`}
                                                        alt="QR Code" 
                                                        fill
                                                        className="object-contain"
                                                    />
                                                    {/* Scanning Line Animation */}
                                                    <div className="absolute inset-x-0 top-0 h-1 bg-primary/50 shadow-[0_0_20px_rgba(37,211,102,0.6)] animate-scan" />
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center text-muted-foreground/50">
                                                    <QrCode className="h-20 w-20 opacity-20" />
                                                    <p className="mt-4 text-sm font-medium">Aguardando geração...</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <Button 
                                        onClick={handleGenerateQR} 
                                        disabled={isLoading} 
                                        className="w-full h-12 text-base font-medium transition-transform active:scale-[0.98]"
                                        size="lg"
                                    >
                                        {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <RefreshCw className="mr-2 h-5 w-5" />}
                                        {status?.qrCode ? 'Atualizar QR Code' : 'Gerar QR Code'}
                                    </Button>
                                </TabsContent>
                                
                                <TabsContent value="paircode" className="mt-0 space-y-6 focus-visible:ring-0">
                                    <div className="space-y-4 pt-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="phone" className="text-base">Número do WhatsApp</Label>
                                            <div className="relative">
                                                <Input 
                                                    id="phone" 
                                                    placeholder="Ex: 5511999998888" 
                                                    value={phoneNumber}
                                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                                    className="h-12 pl-12 text-lg"
                                                />
                                                <Smartphone className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
                                            </div>
                                            <p className="text-sm text-muted-foreground">Digite o número completo com código do país (DDI) e DDD.</p>
                                        </div>
                                        
                                        {status?.pairCode && (
                                            <div className="group relative overflow-hidden rounded-xl bg-slate-900 p-8 text-center transition-all hover:bg-slate-800">
                                                <p className="text-sm font-medium text-slate-400 mb-3 uppercase tracking-wider">Código de Pareamento</p>
                                                <div className="flex justify-center gap-2">
                                                    {status.pairCode.split('').map((char, i) => (
                                                        <span key={i} className="flex h-12 w-10 items-center justify-center rounded-lg bg-slate-700 text-2xl font-bold text-white shadow-sm ring-1 ring-white/10">
                                                            {char}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        
                                        <Button 
                                            onClick={handleGeneratePairCode} 
                                            disabled={isLoading || !phoneNumber} 
                                            className="w-full h-12 text-base font-medium"
                                            size="lg"
                                        >
                                            {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Smartphone className="mr-2 h-5 w-5" />}
                                            Gerar Código
                                        </Button>
                                    </div>
                                </TabsContent>
                            </div>
                        </Tabs>
                    </CardContent>
                </Card>
            ) : isConnected ? (
                 <Card className="flex h-full flex-col items-center justify-center border-none shadow-none bg-transparent">
                    <div className="text-center space-y-4 max-w-md mx-auto">
                        <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-full bg-green-100/50 ring-8 ring-green-50">
                            <div className="relative">
                                <Smartphone className="h-16 w-16 text-green-600" />
                                <div className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-green-500 ring-4 ring-white flex items-center justify-center">
                                    <CheckCircle2 className="h-4 w-4 text-white" />
                                </div>
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight text-foreground">Tudo Pronto!</h2>
                        <p className="text-lg text-muted-foreground">
                            Sua instância do WhatsApp está conectada e sincronizada com sucesso. Você já pode iniciar suas campanhas.
                        </p>
                    </div>
                </Card>
            ) : (
                <div className="flex h-full items-center justify-center rounded-xl border border-dashed p-8 text-center text-muted-foreground">
                    <p>Inicializando serviço de conexão...</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
