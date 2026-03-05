import React, { useEffect, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Plus, Eye, AlertCircle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from '../../../design-system/components/DataTable';
import { Button } from '../../../design-system/components/Button';
import { Badge } from '../../../design-system/components/Badge';
import api from '../../../services/api';

interface Inspection {
  id: number;
  supplierName: string;
  address: string;
  date: string;
  status: string;
  result: string;
  inspector: string;
}

export function InspectionList() {
  const navigate = useNavigate();
  const [data, setData] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInspections();
  }, []);

  const loadInspections = async () => {
    try {
      setLoading(true);
      const response = await api.get('/inspections');
      setData(response.data.data || []);
    } catch (error) {
      console.error('Failed to load inspections', error);
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnDef<Inspection>[] = [
    {
      accessorKey: 'supplierName',
      header: 'Estabelecimento',
    },
    {
      accessorKey: 'address',
      header: 'Endereço',
    },
    {
      accessorKey: 'date',
      header: 'Data',
      cell: ({ row }) => new Date(row.getValue('date')).toLocaleDateString(),
    },
    {
      accessorKey: 'inspector',
      header: 'Fiscal Responsável',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        const variant = status === 'Realizada' ? 'success' : status === 'Agendada' ? 'primary' : 'secondary';
        return <Badge variant={variant}>{status}</Badge>;
      },
    },
    {
      accessorKey: 'result',
      header: 'Resultado',
      cell: ({ row }) => {
        const result = row.getValue('result') as string;
        let variant: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' = 'secondary';
        
        if (result === 'Regular') variant = 'success';
        if (result === 'Irregular') variant = 'danger';
        if (result === 'Pendente') variant = 'warning';

        return <Badge variant={variant}>{result}</Badge>;
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
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Fiscalizações</h2>
          <p className="text-gray-500">Gestão e agendamento de fiscalizações em estabelecimentos.</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nova Fiscalização
        </Button>
      </div>

      <DataTable 
        columns={columns} 
        data={data} 
        searchColumn="supplierName" 
        searchPlaceholder="Buscar por estabelecimento..."
      />
    </div>
  );
}
