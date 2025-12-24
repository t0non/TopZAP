'use client';
import {
  Download,
  CheckCircle,
  XCircle,
  MessageSquareText,
  TrendingUp,
  Loader2,
} from 'lucide-react';
import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { Campaign, Contact } from '@/lib/types';
import { PageHeader, PageHeaderHeading, PageHeaderActions } from '@/components/page-header';
import { useDoc, useUser, useFirestore, useCollection } from '@/firebase';
import { doc, collection } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/provider';

export default function CampaignReportPage({
  params,
}: {
  params: { id: string };
}) {
  const { user } = useUser();
  const firestore = useFirestore();

  const campaignRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, 'users', user.uid, 'campaigns', params.id);
  }, [firestore, user, params.id]);

  const { data: campaign, isLoading: isCampaignLoading } = useDoc<Campaign>(campaignRef);
  
  const contactsRef = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, 'users', user.uid, 'contacts');
  }, [firestore, user]);

  const { data: contacts, isLoading: areContactsLoading } = useCollection<Contact>(contactsRef);

  const isLoading = isCampaignLoading || areContactsLoading;

  if (isLoading) {
    return (
        <div className="container px-4 py-6 md:px-6 lg:py-8">
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        </div>
    )
  }
  
  if (!campaign) {
    return (
        <div className="container px-4 py-6 md:px-6 lg:py-8">
            <PageHeader>
                <PageHeaderHeading>Campanha não encontrada</PageHeaderHeading>
                <p className="text-muted-foreground mt-2">
                    A campanha que você está procurando não foi encontrada.
                </p>
            </PageHeader>
        </div>
    )
  }

  const reportData = {
    campaignName: campaign.name,
    date: new Date(campaign.sentDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' }),
    stats: {
      total: campaign.recipients,
      success: Math.floor(campaign.recipients * (campaign.engagement / 100)),
      failed: campaign.recipients - Math.floor(campaign.recipients * (campaign.engagement / 100)),
    },
    contacts: (contacts || []).slice(0, 10).map(c => ({
      name: c.name,
      phone: c.phone,
      status: Math.random() > 0.2 ? 'Sucesso' : 'Falha', // This part remains mock 
    })),
  };

  return (
    <div className="container px-4 py-6 md:px-6 lg:py-8">
      <PageHeader className="mb-6">
        <div>
          <PageHeaderHeading>Relatório: {reportData.campaignName}</PageHeaderHeading>
          <p className="text-muted-foreground mt-2">
            Relatório detalhado da campanha enviada em {reportData.date}.
          </p>
        </div>
        <PageHeaderActions>
            <Button>
              <Download className="mr-2 h-4 w-4" />
              Baixar PDF
            </Button>
        </PageHeaderActions>
      </PageHeader>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Envios</CardTitle>
            <MessageSquareText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sucesso</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.stats.success}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Falhas</CardTitle>
            <XCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.stats.failed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Abertura</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaign.engagement}%</div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Detalhes por Contato</CardTitle>
          <CardDescription>
            Status de entrega para cada contato na campanha.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reportData.contacts.map((contact, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{contact.name}</TableCell>
                  <TableCell>{contact.phone}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        contact.status === 'Sucesso' ? 'default' : 'destructive'
                      }
                      className={
                        contact.status === 'Sucesso'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }
                    >
                      {contact.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
