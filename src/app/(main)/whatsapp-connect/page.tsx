'use client';

import { useState } from 'react';
import { PageHeader, PageHeaderHeading, PageHeaderDescription } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, QrCode } from 'lucide-react';
import Image from 'next/image';

export default function WhatsAppConnectPage() {
  const [companyName, setCompanyName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  const handleGenerateQrCode = () => {
    if (!companyName || !phoneNumber) {
      // Basic validation, can be improved with a form library
      alert('Por favor, preencha o nome da empresa e o número de celular.');
      return;
    }
    setIsGenerating(true);
    setQrCodeUrl('');

    // Simulate a delay for generating the QR code
    setTimeout(() => {
      // In a real application, you would make an API call to your backend
      // to get a QR code from the WhatsApp Business API provider.
      // We will use a placeholder QR code image for now.
      const placeholderQr = `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=WHATSAPP_CONNECT_DATA_${Date.now()}`;
      setQrCodeUrl(placeholderQr);
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <div className="container">
      <PageHeader>
        <PageHeaderHeading>Conectar WhatsApp</PageHeaderHeading>
        <PageHeaderDescription>
          Vincule sua conta do WhatsApp para automatizar suas campanhas e mensagens.
        </PageHeaderDescription>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>1. Informações da Conexão</CardTitle>
            <CardDescription>
              Preencha os dados abaixo. Eles serão usados para identificar esta conexão.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Nome da Empresa</Label>
              <Input
                id="companyName"
                placeholder="Sua Empresa LTDA"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                disabled={isGenerating || !!qrCodeUrl}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Celular com WhatsApp</Label>
              <Input
                id="phoneNumber"
                placeholder="+55 11 99999-9999"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={isGenerating || !!qrCodeUrl}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Gerar QR Code</CardTitle>
            <CardDescription>
              Clique para gerar o código e escaneie com seu celular para conectar.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center space-y-4 h-full min-h-[250px]">
            {!qrCodeUrl && !isGenerating && (
              <Button
                size="lg"
                onClick={handleGenerateQrCode}
                disabled={!companyName || !phoneNumber}
              >
                <QrCode className="mr-2" />
                Gerar QR Code
              </Button>
            )}

            {isGenerating && (
              <div className="flex flex-col items-center gap-4 text-muted-foreground">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p>Gerando QR Code, aguarde...</p>
              </div>
            )}

            {qrCodeUrl && (
              <div className="flex flex-col items-center gap-4">
                <Image
                  src={qrCodeUrl}
                  alt="WhatsApp QR Code"
                  width={256}
                  height={256}
                  className="rounded-lg border p-2"
                />
                <p className="text-sm text-center text-muted-foreground">
                  Abra seu WhatsApp, vá em Aparelhos Conectados e escaneie este código.
                </p>
                <Button variant="outline" onClick={handleGenerateQrCode}>
                  Gerar Novo Código
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
