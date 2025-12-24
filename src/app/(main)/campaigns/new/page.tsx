import { PageHeader, PageHeaderHeading, PageHeaderDescription, PageHeaderActions } from '@/components/page-header';
import { CreateCampaignWizard } from '@/components/campaigns/create-campaign-wizard';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import Link from 'next/link';

export default function NewCampaignPage() {
  return (
    <div className="container px-4 py-6 md:px-6 lg:py-8">
      <PageHeader className="mb-6 flex flex-row items-start justify-between">
        <div className="flex-1">
          <PageHeaderHeading>Criar Nova Campanha</PageHeaderHeading>
          <PageHeaderDescription>
            Siga os passos para criar, personalizar e agendar sua campanha do WhatsApp.
          </PageHeaderDescription>
        </div>
        <PageHeaderActions className="w-auto">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/campaigns">
              <X className="h-4 w-4" />
              <span className="sr-only">Fechar</span>
            </Link>
          </Button>
        </PageHeaderActions>
      </PageHeader>
      
      <CreateCampaignWizard />
    </div>
  );
}
