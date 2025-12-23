import Link from 'next/link';
import { PageHeader, PageHeaderHeading, PageHeaderDescription, PageHeaderActions } from '@/components/page-header';
import { CampaignsTable } from '@/components/campaigns/campaigns-table';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

export default function CampaignsPage() {
  return (
    <div className="container">
      <PageHeader>
        <div className='flex-1'>
        <PageHeaderHeading>Histórico de Campanhas</PageHeaderHeading>
        <PageHeaderDescription>
          Visualize e gerencie todas as suas campanhas passadas e agendadas.
        </PageHeaderDescription>
        </div>
        <PageHeaderActions>
            <Button asChild>
                <Link href="/campaigns/new">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Nova Campanha
                </Link>
            </Button>
        </PageHeaderActions>
      </PageHeader>
      
      <CampaignsTable />
    </div>
  );
}
