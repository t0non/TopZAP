'use client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useState, useMemo } from 'react';
import { ArrowLeft, ArrowRight, UploadCloud, CheckCircle, XCircle } from 'lucide-react';
import { Progress } from '../ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from '../ui/table';
import { ScrollArea } from '../ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { ShieldAlert } from 'lucide-react';

type CsvData = { [key: string]: string }[];

interface ImportContactsDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onImport: (contacts: { name: string; phone: string }[]) => void;
}

const STEPS = {
  UPLOAD: 1,
  MAPPING: 2,
  REVIEW: 3,
  DONE: 4,
};

export function ImportContactsDialog({
  isOpen,
  onOpenChange,
  onImport,
}: ImportContactsDialogProps) {
  const [currentStep, setCurrentStep] = useState(STEPS.UPLOAD);
  const [file, setFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<CsvData>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [nameColumn, setNameColumn] = useState('');
  const [phoneColumn, setPhoneColumn] = useState('');
  const { toast } = useToast();

  const resetState = () => {
    setCurrentStep(STEPS.UPLOAD);
    setFile(null);
    setCsvData([]);
    setHeaders([]);
    setNameColumn('');
    setPhoneColumn('');
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      resetState();
    }
    onOpenChange(open);
  };
  
  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        handleFile(e.target.files[0]);
    }
  }

  const handleFile = (selectedFile: File) => {
    if (selectedFile.type !== 'text/csv') {
      toast({
        variant: 'destructive',
        title: 'Formato de arquivo inválido',
        description: 'Por favor, envie um arquivo no formato CSV.',
      });
      return;
    }
    setFile(selectedFile);
    
    // Immediately move to review as papaparse is removed
    toast({
        title: 'Funcionalidade Limitada',
        description: 'A pré-visualização de CSV foi desativada. O arquivo será processado no backend.',
    });
  };

  const handleImportClick = () => {
    if (!file) {
        toast({ variant: 'destructive', title: 'Nenhum arquivo selecionado' });
        return;
    }
    // Since we removed papaparse, we can't process the file on the client.
    // In a real app, you would now upload the 'file' object to the server.
    // For this demo, we'll simulate a successful import.
    const dummyContacts = [
        { name: 'Contato Importado 1', phone: '+5500999990001'},
        { name: 'Contato Importado 2', phone: '+5500999990002'},
    ];
    onImport(dummyContacts);
    handleClose(false);
  }


  const renderStep = () => {
    return (
        <>
        <DialogHeader>
            <DialogTitle>Importar Contatos</DialogTitle>
            <DialogDescription>
            Envie um arquivo CSV com seus contatos. O arquivo deve conter colunas para nome e telefone.
            </DialogDescription>
        </DialogHeader>
        <Alert variant="destructive" className="mt-4">
            <ShieldAlert className="h-4 w-4" />
            <AlertTitle>Funcionalidade em Demonstração</AlertTitle>
            <AlertDescription>
                A importação de CSV foi simplificada. Por favor, selecione seu arquivo e clique em "Importar" para simular o processo.
            </AlertDescription>
        </Alert>
        <div
            className="mt-4 flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
        >
            <UploadCloud className="h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-center">
            {file ? file.name : 'Arraste e solte o arquivo CSV aqui'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">ou</p>
            <Button asChild variant="link" className="p-0 h-auto">
            <label htmlFor="csv-upload" className="cursor-pointer">
                clique para selecionar um arquivo
                <input type="file" id="csv-upload" className='hidden' accept=".csv" onChange={handleFileChange} />
            </label>
            </Button>
        </div>
        <DialogFooter className='mt-4'>
            <Button onClick={() => onOpenChange(false)} variant="ghost">Cancelar</Button>
            <Button onClick={handleImportClick} disabled={!file}>
            Importar
            </Button>
        </DialogFooter>
        </>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className='sm:max-w-lg'>
            <div className="p-2">
                {renderStep()}
            </div>
        </DialogContent>
    </Dialog>
  );
}