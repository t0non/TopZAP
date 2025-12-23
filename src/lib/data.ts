import type { Campaign, Contact } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export const contacts: Contact[] = [
  { id: '1', name: 'Ana Silva', phone: '+55 11 98765-4321', segment: 'VIP', createdAt: '2023-01-15', avatarUrl: PlaceHolderImages[0].imageUrl },
  { id: '2', name: 'Bruno Costa', phone: '+55 21 91234-5678', segment: 'New', createdAt: '2023-02-20', avatarUrl: PlaceHolderImages[1].imageUrl },
  { id: '3', name: 'Carla Dias', phone: '+55 31 99999-8888', segment: 'Regular', createdAt: '2022-11-30', avatarUrl: PlaceHolderImages[2].imageUrl },
  { id: '4', name: 'Daniel Alves', phone: '+55 41 98888-7777', segment: 'VIP', createdAt: '2023-03-10', avatarUrl: PlaceHolderImages[3].imageUrl },
  { id: '5', name: 'Eduarda Lima', phone: '+55 51 97777-6666', segment: 'Inactive', createdAt: '2022-09-05', avatarUrl: PlaceHolderImages[4].imageUrl },
  { id: '6', name: 'Fábio Pereira', phone: '+55 61 96666-5555', segment: 'New', createdAt: '2023-04-01', avatarUrl: PlaceHolderImages[5].imageUrl },
  { id: '7', name: 'Gabriela Santos', phone: '+55 71 95555-4444', segment: 'Regular', createdAt: '2023-01-25', avatarUrl: PlaceHolderImages[6].imageUrl },
  { id: '8', name: 'Heitor Martins', phone: '+55 81 94444-3333', segment: 'VIP', createdAt: '2022-12-18', avatarUrl: PlaceHolderImages[7].imageUrl },
  { id: '9', name: 'Isabela Rocha', phone: '+55 91 93333-2222', segment: 'Regular', createdAt: '2023-03-22', avatarUrl: PlaceHolderImages[8].imageUrl },
  { id: '10', name: 'João Mendes', phone: '+55 11 92222-1111', segment: 'New', createdAt: '2023-04-12', avatarUrl: PlaceHolderImages[9].imageUrl },
];

export const campaigns: Campaign[] = [
  { id: '1', name: 'Promoção de Verão', sentDate: '2023-06-15', status: 'Sent', engagement: 85, recipients: 500 },
  { id: '2', name: 'Lançamento Outono/Inverno', sentDate: '2023-09-01', status: 'Scheduled', engagement: 0, recipients: 1200 },
  { id: '3', name: 'Newsletter Mensal - Maio', sentDate: '2023-05-30', status: 'Sent', engagement: 72, recipients: 850 },
  { id: '4', name: 'Black Friday Teaser', sentDate: '2023-11-10', status: 'Draft', engagement: 0, recipients: 2500 },
  { id: '5', name: 'Aniversariantes de Abril', sentDate: '2023-04-05', status: 'Sent', engagement: 92, recipients: 80 },
  { id: '6', name: 'Cupom de Desconto - Teste A/B', sentDate: '2023-02-18', status: 'Failed', engagement: 15, recipients: 200 },
  { id: '7', name: 'Feliz Ano Novo!', sentDate: '2022-12-31', status: 'Sent', engagement: 65, recipients: 2300 },
  { id: '8', name: 'Pesquisa de Satisfação', sentDate: '2023-07-20', status: 'Scheduled', engagement: 0, recipients: 1500 },
];

export const chartData = [
    { month: 'Jan', sent: 400, opened: 240 },
    { month: 'Fev', sent: 300, opened: 139 },
    { month: 'Mar', sent: 200, opened: 180 },
    { month: 'Abr', sent: 278, opened: 190 },
    { month: 'Mai', sent: 189, opened: 120 },
    { month: 'Jun', sent: 239, opened: 180 },
    { month: 'Jul', sent: 349, opened: 210 },
];
