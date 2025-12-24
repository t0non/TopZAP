'use client';

import React, { useEffect, useState } from 'react';
import { PageHeader, PageHeaderHeading } from '@/components/page-header';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Clock,
  MessageSquareText,
  TrendingUp,
  TriangleAlert,
  XCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import type { Campaign } from '@/lib/types';
import { campaigns as defaultCampaigns } from '@/lib/data';
import { subDays, format, isToday, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Greeting = () => {
    // Hardcoded user name for now.
    const userName = "Usuário";
    return <PageHeaderHeading>Olá, {userName}.</PageHeaderHeading>;
}

const StatCard: React.FC<{ title: string; value: string | number; description: string; icon: React.ReactNode; isError?: boolean }> = ({ title, value, description, icon, isError }) => (
    <Card className={`border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow duration-300 ${isError ? 'bg-destructive/10 border-destructive/50' : ''}`}>
        <CardHeader className="pb-2">
            <CardTitle className='flex items-center justify-between text-base'>
                <span>{title}</span>
                <div className={`h-5 w-5 ${isError ? 'text-destructive' : 'text-muted-foreground'}`}>{icon}</div>
            </CardTitle>
        </CardHeader>
        <CardContent>
            <p className={`text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50 ${isError ? 'text-destructive' : ''}`}>{value}</p>
            <p className='text-sm text-muted-foreground'>{description}</p>
        </CardContent>
    </Card>
);

export default function DashboardPage() {
    const [isMounted, setIsMounted] = useState(false);
    const [allCampaigns, setAllCampaigns] = useState<Campaign[]>([]);

    useEffect(() => {
        setIsMounted(true);
        try {
            const storedCampaigns = localStorage.getItem('campaigns');
            if (storedCampaigns) {
                setAllCampaigns(JSON.parse(storedCampaigns));
            } else {
                localStorage.setItem('campaigns', JSON.stringify(defaultCampaigns));
                setAllCampaigns(defaultCampaigns);
            }
        } catch (error) {
            console.error("Failed to access localStorage", error);
            setAllCampaigns(defaultCampaigns);
        }
    }, []);

    const dailyStats = {
        sentToday: allCampaigns.filter(c => c.status === 'Sent' && isToday(parseISO(c.sentDate))).length,
        inQueue: allCampaigns.filter(c => c.status === 'Scheduled').length,
        errorRate: allCampaigns.filter(c => isToday(parseISO(c.sentDate)) && c.status !== 'Sent').length > 0 ?
            (allCampaigns.filter(c => isToday(parseISO(c.sentDate)) && c.status !== 'Sent').length / allCampaigns.filter(c => isToday(parseISO(c.sentDate))).length) * 100
            : 0,
        dailyLimit: 300,
    };

    const weeklyPerformance = Array.from({ length: 7 }).map((_, i) => {
        const date = subDays(new Date(), i);
        const sentOnDay = allCampaigns.filter(c => c.sentDate.startsWith(format(date, 'yyyy-MM-dd')));
        return {
            day: format(date, 'EEE', { locale: ptBR }),
            success: sentOnDay.filter(c => c.status === 'Sent').length,
            fails: sentOnDay.filter(c => c.status === 'Failed').length,
        };
    }).reverse();

    const lastSentMessages = allCampaigns
        .filter(c => c.status === 'Sent' || c.status === 'Failed' || c.status === 'Scheduled')
        .sort((a, b) => parseISO(b.sentDate).getTime() - parseISO(a.sentDate).getTime())
        .slice(0, 5)
        .map(c => ({
            id: c.id,
            to: `Campanha para ${c.recipients} contatos`,
            status: c.status === 'Scheduled' ? 'Waiting' : c.status,
            campaign: c.name,
        }));

    if (!isMounted) {
        return null;
    }

  return (
    <div className="container relative">
      <PageHeader className='pb-4'>
            <Greeting />
      </PageHeader>
      
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Special Gradient Card */}
        <div className="relative p-[2px] rounded-xl bg-gradient-to-r from-blue-400 to-green-300 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="h-full w-full bg-card dark:bg-slate-900 rounded-lg">
                <CardHeader className="pb-2">
                    <CardTitle className='flex items-center justify-between text-base'>
                        <span>Envios Hoje</span>
                        <MessageSquareText className="h-5 w-5 text-muted-foreground" />
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50">{dailyStats.sentToday}</p>
                    <p className='text-sm text-muted-foreground'>Mensagens nas últimas 24h</p>
                </CardContent>
            </div>
        </div>

        <StatCard
            title="Fila de Espera"
            value={dailyStats.inQueue}
            description="Aguardando envio"
            icon={<Clock />}
        />

        <StatCard
            title="Taxa de Erro"
            value={`${dailyStats.errorRate.toFixed(1)}%`}
            description="Falhas de envio hoje"
            icon={<XCircle />}
            isError={dailyStats.errorRate > 5}
        />

        <Card className="border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow duration-300">
             <CardHeader className="pb-2">
                <CardTitle className='flex items-center justify-between text-base'>
                    <span>Limite de Segurança</span>
                    <TriangleAlert className="h-5 w-5 text-muted-foreground" />
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-2xl font-bold mb-2 tracking-tight text-slate-900 dark:text-slate-50">{`${dailyStats.sentToday}/${dailyStats.dailyLimit}`}</p>
                <Progress value={(dailyStats.sentToday / dailyStats.dailyLimit) * 100} className='h-3' />
                 <p className='text-sm text-muted-foreground mt-2'>Cota de envios diária</p>
            </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle>Desempenho da Semana</CardTitle>
                    <CardDescription>Envios bem-sucedidos vs. falhas nos últimos 7 dias.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={weeklyPerformance}>
                            <XAxis dataKey="day" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))' }}/>
                            <Bar dataKey="success" name="Sucesso" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="fails" name="Falhas" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-1">
          <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Últimos Envios</CardTitle>
                <CardDescription>Mini-histórico das últimas 5 mensagens processadas.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {lastSentMessages.map(msg => (
                          <div key={msg.id} className="flex items-center justify-between">
                            <div className='space-y-1'>
                                <p className="font-medium">{msg.to}</p>
                                <p className="text-sm text-muted-foreground">{msg.campaign}</p>
                            </div>
                            <Badge variant={
                                msg.status === 'Sent' ? 'default' : 
                                msg.status === 'Failed' ? 'destructive' : 'secondary'
                            }
                            className={
                                msg.status === 'Sent' ? 'bg-primary/20 text-primary-foreground dark:text-primary' :
                                msg.status === 'Waiting' ? 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400' : ''
                            }
                            >{msg.status}</Badge>
                        </div>
                    ))}
                </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
