import { PageHeader, PageHeaderHeading, PageHeaderDescription, PageHeaderActions } from '@/components/page-header';
import { ContactsTable } from '@/components/contacts/contacts-table';
import { Button } from '@/components/ui/button';
import { PlusCircle, Upload } from 'lucide-react';

export default function ContactsPage() {
  return (
    <div className="container">
      <PageHeader>
        <div className='flex-1'>
        <PageHeaderHeading>Gerenciamento de Contatos</PageHeaderHeading>
        <PageHeaderDescription>
          Importe, organize e segmente seus contatos para mensagens direcionadas.
        </PageHeaderDescription>
        </div>
        <PageHeaderActions>
            <Button variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                Importar Contatos
            </Button>
            <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Novo Contato
            </Button>
        </PageHeaderActions>
      </PageHeader>
      
      <ContactsTable />
    </div>
  );
}
