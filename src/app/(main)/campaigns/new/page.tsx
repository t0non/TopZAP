import { PageHeader, PageHeaderHeading, PageHeaderDescription } from '@/components/page-header';
import { CreateCampaignForm } from '@/components/campaigns/create-campaign-form';

export default function NewCampaignPage() {
  return (
    <div className="container">
      <PageHeader>
        <PageHeaderHeading>Criar Nova Campanha</PageHeaderHeading>
        <PageHeaderDescription>
          Crie e agende campanhas WhatsApp com mensagens personalizadas.
        </PageHeaderDescription>
      </PageHeader>
      
      <CreateCampaignForm />
    </div>
  );
}
