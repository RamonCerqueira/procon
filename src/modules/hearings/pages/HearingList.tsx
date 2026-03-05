import React, { useEffect, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Plus, Eye, Gavel, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from '../../../design-system/components/DataTable';
import { Button } from '../../../design-system/components/Button';
import { Badge } from '../../../design-system/components/Badge';
import api from '../../../services/api';

interface Hearing {
  id: number;
  caseProtocol: string;
  date: string;
  room: string;
  mediator: string;
  status: string;
}

export function HearingList() {
  const navigate = useNavigate();
  const [data, setData] = useState<Hearing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHearings();
  }, []);

  const loadHearings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/hearings');
      setData(response.data.data || []);
    } catch (error) {
      console.error('Failed to load hearings', error);
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnDef<Hearing>[] = [
    {
      accessorKey: 'caseProtocol',
      header: 'Protocolo',
    },
    {
      accessorKey: 'date',
      header: 'Data e Hora',
      cell: ({ row }) => new Date(row.getValue('date')).toLocaleString(),
    },
    {
      accessorKey: 'room',
      header: 'Sala',
    },
    {
      accessorKey: 'mediator',
      header: 'Conciliador',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        const variant = status === 'Agendada' ? 'primary' : status === 'Realizada' ? 'success' : 'danger';
        return <Badge variant={variant}>{status}</Badge>;
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        return (
          <Button variant="ghost" size="sm">
            <Eye className="h-4 w-4" />
          </Button>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Audiências</h2>
          <p className="text-gray-500">Agenda de conciliações e audiências do PROCON.</p>
        </div>
        <Button onClick={() => navigate('/hearings/new')}>
          <Plus className="mr-2 h-4 w-4" />
          Agendar Audiência
        </Button>
      </div>

      <DataTable 
        columns={columns} 
        data={data} 
        searchColumn="caseProtocol" 
        searchPlaceholder="Buscar por protocolo..."
      />
    </div>
  );
}
