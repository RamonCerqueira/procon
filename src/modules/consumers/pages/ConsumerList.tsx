import React, { useEffect, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Consumer } from '../types';
import { consumerService } from '../services/consumerService';
import { DataTable } from '../../../design-system/components/DataTable';
import { Button } from '../../../design-system/components/Button';
import { Badge } from '../../../design-system/components/Badge';

export function ConsumerList() {
  const navigate = useNavigate();
  const [data, setData] = useState<Consumer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConsumers();
  }, []);

  const loadConsumers = async () => {
    try {
      setLoading(true);
      const result = await consumerService.getAll();
      setData(result.data || []);
    } catch (error) {
      console.error('Failed to load consumers', error);
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnDef<Consumer>[] = [
    {
      accessorKey: 'name',
      header: 'Nome',
    },
    {
      accessorKey: 'cpf',
      header: 'CPF',
    },
    {
      accessorKey: 'email',
      header: 'Email',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        const variant = 
          status === 'Ativo' ? 'success' : 
          status === 'Inativo' ? 'secondary' : 'danger';
        
        return <Badge variant={variant}>{status}</Badge>;
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const consumer = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate(`/consumers/${consumer.id}/edit`)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => {
                if(confirm('Tem certeza que deseja excluir?')) {
                  consumerService.delete(consumer.id).then(loadConsumers);
                }
              }}
            >
              <Trash2 className="h-4 w-4" />
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
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Consumidores</h2>
          <p className="text-gray-500">Gerencie a base de consumidores do sistema.</p>
        </div>
        <Button onClick={() => navigate('/consumers/new')}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Consumidor
        </Button>
      </div>

      <DataTable 
        columns={columns} 
        data={data} 
        searchColumn="name" 
        searchPlaceholder="Buscar por nome..."
      />
    </div>
  );
}
