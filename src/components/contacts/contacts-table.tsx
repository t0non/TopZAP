'use client';
import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  SortingState,
  getSortedRowModel,
  ColumnFiltersState,
  getFilteredRowModel,
  Row,
} from "@tanstack/react-table"
import { contacts as defaultData } from '@/lib/data';
import type { Contact } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '../ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '../ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { ContactForm } from './contact-form';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { PlaceHolderImages } from '@/lib/placeholder-images';

interface ContactsTableProps {
    onEditRequest: (contact: Contact) => void;
}

const ActionsCell = ({ row, onEdit, onDelete }: { row: Row<Contact>, onEdit: (contact: Contact) => void, onDelete: (contact: Contact) => void }) => {
    const contact = row.original;
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onEdit(contact)}>Editar</DropdownMenuItem>
          <DropdownMenuItem>Ver Detalhes</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive" onClick={() => onDelete(contact)}>
            Remover
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
};

export function ContactsTable() {
    const { toast } = useToast();
    const [data, setData] = React.useState<Contact[]>(() => [...defaultData]);
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [contactToDelete, setContactToDelete] = React.useState<Contact | null>(null);
    const [isFormOpen, setIsFormOpen] = React.useState(false);
    const [contactToEdit, setContactToEdit] = React.useState<Contact | null>(null);


    const handleSaveContact = (contactData: Omit<Contact, 'avatarUrl' | 'createdAt'>) => {
        if (contactData.id) {
            // Edit existing contact
            setData(prev => prev.map(c => c.id === contactData.id ? { ...c, ...contactData } : c));
            toast({ title: "Contato atualizado!", description: `${contactData.name} foi atualizado com sucesso.` });
        } else {
            // Add new contact
            const newContact: Contact = {
                ...contactData,
                id: uuidv4(),
                createdAt: new Date().toISOString(),
                avatarUrl: PlaceHolderImages[Math.floor(Math.random() * PlaceHolderImages.length)].imageUrl,
            };
            setData(prev => [newContact, ...prev]);
            toast({ title: "Contato criado!", description: `${newContact.name} foi adicionado à sua lista.` });
        }
        setContactToEdit(null);
    };

    const handleEdit = (contact: Contact) => {
        setContactToEdit(contact);
        setIsFormOpen(true);
    };

    const handleDeleteRequest = (contact: Contact) => {
        setContactToDelete(contact);
    };

    const handleDeleteConfirm = () => {
        if (contactToDelete) {
            setData(prev => prev.filter(c => c.id !== contactToDelete.id));
            toast({ title: "Contato removido", description: `${contactToDelete.name} foi removido da sua lista.` });
            setContactToDelete(null);
        }
    };

    const columns: ColumnDef<Contact>[] = [
      {
        accessorKey: "name",
        header: "Nome",
        cell: ({ row }) => {
          const contact = row.original;
          return (
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={contact.avatarUrl} alt={contact.name} />
                <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="font-medium">{contact.name}</span>
            </div>
          );
        },
      },
      {
        accessorKey: "phone",
        header: "Telefone",
      },
      {
        accessorKey: "segment",
        header: "Segmento",
        cell: ({ row }) => {
          const segment = row.getValue("segment") as string;
          return (
              <Badge variant="outline" className={cn(
                  segment === 'VIP' && 'border-yellow-500 text-yellow-600',
                  segment === 'New' && 'border-blue-500 text-blue-600',
                  segment === 'Regular' && 'border-green-500 text-green-600',
                  segment === 'Inactive' && 'border-gray-500 text-gray-600',
              )}>{segment}</Badge>
          )
        },
      },
      {
        accessorKey: "birthday",
        header: "Aniversário",
        cell: ({ row }) => {
            const birthday = row.getValue("birthday") as string;
            return birthday ? new Date(birthday).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'UTC' }) : '-';
        }
      },
      {
        accessorKey: "createdAt",
        header: "Data de Adição",
        cell: ({ row }) => new Date(row.getValue("createdAt")).toLocaleDateString('pt-BR', { timeZone: 'UTC' }),
      },
      {
          id: "actions",
          cell: ({ row }) => <ActionsCell row={row} onEdit={handleEdit} onDelete={handleDeleteRequest} />,
      },
    ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
    meta: {
        onEdit: handleEdit,
        onDelete: handleDeleteRequest,
    }
  });

  return (
    <>
        <div className="flex items-center py-4">
            <Input
            placeholder="Filtrar por nome..."
            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
                table.getColumn("name")?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
            />
        </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Nenhum resultado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Anterior
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Próximo
        </Button>
      </div>

      <AlertDialog open={!!contactToDelete} onOpenChange={() => setContactToDelete(null)}>
          <AlertDialogContent>
              <AlertDialogHeader>
                  <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita. Isso removerá permanentemente o contato
                    "{contactToDelete?.name}" da sua lista.
                  </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteConfirm}>Continuar</AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>

      <ContactForm
        isOpen={isFormOpen}
        onOpenChange={(isOpen) => {
            setIsFormOpen(isOpen);
            if (!isOpen) {
                setContactToEdit(null);
            }
        }}
        contact={contactToEdit}
        onSave={handleSaveContact}
       />
    </>
  );
}

// We need a way to generate UUIDs for new contacts
declare module 'uuid' {
    export function v4(): string;
}
