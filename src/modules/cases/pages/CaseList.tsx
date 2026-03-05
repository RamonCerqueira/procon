import React, { useEffect, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Plus, Eye, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Case } from '../types';
import { caseService } from '../services/caseService';
import { DataTable } from '../../../design-system/components/DataTable';
import { Button } from '../../../design-system/components/Button';
import { Badge } from '../../../design-system/components/Badge';

export function CaseList() {
  const navigate = useNavigate();
  const [data, setData] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
    try {
      setLoading(true);
      const result = await caseService.getAll();
      setData(result.data || []);
    } catch (error) {
      console.error('Failed to load cases', error);
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnDef<Case>[] = [
    {
      accessorKey: 'protocol',
      header: 'Protocolo',
    },
    {
      accessorKey: 'subject',
      header: 'Assunto',
    },
    {
      accessorKey: 'consumerName',
      header: 'Consumidor',
    },
    {
      accessorKey: 'supplierName',
      header: 'Fornecedor',
    },
    {
      accessorKey: 'priority',
      header: 'Prioridade',
      cell: ({ row }) => {
        const priority = row.getValue('priority') as string;
        const variant = 
          priority === 'Urgente' ? 'danger' : 
          priority === 'Alta' ? 'warning' : 'secondary';
        
        return <Badge variant={variant}>{priority.toUpperCase()}</Badge>;
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        // Map status to badge variants
        return <Badge variant="primary">{status}</Badge>;
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const caseItem = row.original;
        return (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate(`/cases/${caseItem.id}`)}
          >
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
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Atendimentos</h2>
          <p className="text-gray-500">Gestão de processos e reclamações.</p>
        </div>
        <Button onClick={() => navigate('/cases/new')}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Atendimento
        </Button>
      </div>

      <DataTable 
        columns={columns} 
        data={data} 
        searchColumn="protocol" 
        searchPlaceholder="Buscar por protocolo..."
      />
    </div>
  );
}
