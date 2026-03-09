import React, { useState } from 'react';
import { Mail, Send, Eye, Clock, CheckCircle, FileText, Plus } from 'lucide-react';
import { Button } from '../../../design-system/components/Button';
import { DataTable } from '../../../design-system/components/DataTable';
import { Badge } from '../../../design-system/components/Badge';

// Mock data for Official Letters (Ofícios)
const MOCK_LETTERS = [
  {
    id: '1',
    number: '045/2026',
    subject: 'Notificação de Infração',
    recipient: 'contato@lojaexemplo.com.br',
    sentAt: '2026-03-08T10:30:00Z',
    status: 'Lido',
    readAt: '2026-03-08T11:45:00Z',
    caseProtocol: '2026.03.001',
  },
  {
    id: '2',
    number: '046/2026',
    subject: 'Convite para Audiência',
    recipient: 'financeiro@bancoexemplo.com.br',
    sentAt: '2026-03-09T09:15:00Z',
    status: 'Enviado',
    readAt: null,
    caseProtocol: '2026.03.002',
  },
];

export function OfficialLetters() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const columns = [
    {
      accessorKey: 'number',
      header: 'Ofício N°',
    },
    {
      accessorKey: 'subject',
      header: 'Assunto',
    },
    {
      accessorKey: 'recipient',
      header: 'Destinatário',
    },
    {
      accessorKey: 'caseProtocol',
      header: 'F.A. Vinculada',
    },
    {
      accessorKey: 'sentAt',
      header: 'Enviado Em',
      cell: ({ row }: any) => new Date(row.original.sentAt).toLocaleString('pt-BR'),
    },
    {
      accessorKey: 'status',
      header: 'Status (Tracking)',
      cell: ({ row }: any) => {
        const isRead = row.original.status === 'Lido';
        return (
          <div className="flex items-center gap-2">
            <Badge variant={isRead ? 'success' : 'secondary'}>
              {row.original.status}
            </Badge>
            {isRead && <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full border border-blue-200" title={`Lido em: ${new Date(row.original.readAt).toLocaleString('pt-BR')}`}>👁️ Validado</span>}
          </div>
        );
      },
    },
    {
      id: 'actions',
      cell: () => (
        <Button variant="ghost" size="sm">
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Ofícios e Notificações (Tracking)</h2>
          <p className="text-gray-500">
            Envio independente e rastreio de leitura (tracking de pixel) de e-mails de ofícios em cumprimento ao Edital.
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Ofício Eletrônico
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <Send className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Enviados (Mês)</p>
            <p className="text-2xl font-bold text-gray-900">124</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-lg">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Lidos (Confirmados)</p>
            <p className="text-2xl font-bold text-gray-900">98</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-yellow-50 text-yellow-600 rounded-lg">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Aguardando Leitura</p>
            <p className="text-2xl font-bold text-gray-900">26</p>
          </div>
        </div>
      </div>

      <DataTable 
        columns={columns} 
        data={MOCK_LETTERS} 
        searchColumn="number" 
        searchPlaceholder="Buscar por número do ofício..."
      />
    </div>
  );
}
