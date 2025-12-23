import { PageHeader, PageHeaderHeading, PageHeaderDescription } from '@/components/page-header';
import { StatCard } from '@/components/dashboard/stat-card';
import { OverviewChart } from '@/components/dashboard/overview-chart';
import { RecentCampaigns } from '@/components/dashboard/recent-campaigns';
import { DollarSign, Users, Send, BarChart } from 'lucide-react';
import { contacts, campaigns } from '@/lib/data';

export default function DashboardPage() {
  const totalContacts = contacts.length;
  const totalCampaigns = campaigns.length;
  const avgEngagement = campaigns.reduce((acc, c) => acc + c.engagement, 0) / campaigns.filter(c => c.status === 'Sent').length;

  return (
    <div className="container relative">
      <PageHeader>
        <PageHeaderHeading>Painel de Controle</PageHeaderHeading>
        <PageHeaderDescription>
          Visão geral das suas atividades e desempenho.
        </PageHeaderDescription>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total de Campanhas"
          value={totalCampaigns.toString()}
          icon={Send}
          description="Número total de campanhas criadas"
        />
        <StatCard 
          title="Total de Contatos"
          value={totalContacts.toString()}
          icon={Users}
          description="Número total de contatos na sua lista"
        />
        <StatCard 
          title="Taxa de Engajamento"
          value={`${avgEngagement.toFixed(1)}%`}
          icon={BarChart}
          description="Média de engajamento das campanhas enviadas"
        />
        <StatCard 
          title="Receita (Exemplo)"
          value="R$ 12,234"
          icon={DollarSign}
          description="+15% em relação ao mês passado"
        />
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
          <OverviewChart />
        </div>
        <div className="col-span-4 lg:col-span-3">
          <RecentCampaigns />
        </div>
      </div>
    </div>
  );
}
