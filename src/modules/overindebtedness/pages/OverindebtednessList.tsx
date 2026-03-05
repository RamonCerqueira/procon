import React, { useEffect, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Plus, Eye, Calculator } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from '../../../design-system/components/DataTable';
import { Button } from '../../../design-system/components/Button';
import { Badge } from '../../../design-system/components/Badge';
import api from '../../../services/api';

interface OverindebtednessCase {
  id: number;
  consumerName: string;
  totalDebt: string;
  creditorsCount: number;
  status: string;
  requestDate: string;
}

export function OverindebtednessList() {
  const navigate = useNavigate();
  const [data, setData] = useState<OverindebtednessCase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
    try {
      setLoading(true);
      const response = await api.get('/overindebtedness');
      setData(response.data.data || []);
    } catch (error) {
      console.error('Failed to load cases', error);
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnDef<OverindebtednessCase>[] = [
    {
      accessorKey: 'consumerName',
      header: 'Consumidor',
    },
    {
      accessorKey: 'totalDebt',
      header: 'Dívida Total (R$)',
      cell: ({ row }) => {
        const value = parseFloat(row.getValue('totalDebt'));
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
      },
    },
    {
      accessorKey: 'creditorsCount',
      header: 'Credores',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        let variant: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' = 'primary';
        
        if (status === 'Acordo Realizado') variant = 'success';
        if (status === 'Em Análise') variant = 'warning';
        if (status === 'Audiência Agendada') variant = 'primary';

        return <Badge variant={variant}>{status}</Badge>;
      },
    },
    {
      accessorKey: 'requestDate',
      header: 'Data Solicitação',
      cell: ({ row }) => new Date(row.getValue('requestDate')).toLocaleDateString(),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const caseItem = row.original;
        return (
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate(`/overindebtedness/${caseItem.id}`)}
              title="Ver Detalhes"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              className="text-primary-600 hover:bg-primary-50"
              onClick={() => navigate(`/overindebtedness/${caseItem.id}/negotiation`)}
              title="Simular Acordo"
            >
              <Calculator className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Superendividamento</h2>
          <p className="text-gray-500">Gestão de processos de repactuação de dívidas (Lei 14.181/2021).</p>
        </div>
        <Button onClick={() => navigate('/overindebtedness/new')}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Processo
        </Button>
      </div>

      <DataTable 
        columns={columns} 
        data={data} 
        searchColumn="consumerName" 
        searchPlaceholder="Buscar por consumidor..."
      />
    </div>
  );
}
