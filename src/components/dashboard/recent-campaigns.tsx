import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { campaigns, contacts } from '@/lib/data';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Button } from '../ui/button';

export function RecentCampaigns() {
    const recentCampaigns = campaigns.slice(0, 5);

  return (
    <Card>
        <CardHeader>
            <CardTitle>Campanhas Recentes</CardTitle>
            <CardDescription>As últimas 5 campanhas enviadas ou agendadas.</CardDescription>
        </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {recentCampaigns.map((campaign, index) => (
            <div key={campaign.id} className="flex items-center">
              <Avatar className="h-9 w-9">
                <AvatarImage src={contacts[index].avatarUrl} alt="Avatar" />
                <AvatarFallback>{campaign.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="ml-4 space-y-1">
                <p className="text-sm font-medium leading-none">{campaign.name}</p>
                <p className="text-sm text-muted-foreground">{campaign.recipients} destinatários</p>
              </div>
              <div className="ml-auto font-medium">
                <Badge 
                  variant={campaign.status === 'Sent' ? 'default' : campaign.status === 'Scheduled' ? 'secondary' : 'destructive'}
                  className={cn(
                    campaign.status === 'Sent' && 'bg-green-500/20 text-green-700 border-transparent hover:bg-green-500/30',
                    campaign.status === 'Scheduled' && 'bg-blue-500/20 text-blue-700 border-transparent hover:bg-blue-500/30',
                    campaign.status === 'Draft' && 'bg-gray-500/20 text-gray-700 border-transparent hover:bg-gray-500/30',
                    campaign.status === 'Failed' && 'bg-red-500/20 text-red-700 border-transparent hover:bg-red-500/30',
                  )}
                >
                  {campaign.status === 'Sent' ? 'Enviada' : campaign.status === 'Scheduled' ? 'Agendada' : campaign.status === 'Draft' ? 'Rascunho' : 'Falhou'}
                </Badge>
              </div>
            </div>
          ))}
        </div>
        <div className="pt-6 text-center">
            <Button variant="outline" asChild>
                <Link href="/campaigns">Ver todas as campanhas</Link>
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}
