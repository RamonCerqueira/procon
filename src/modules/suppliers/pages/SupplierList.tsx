import React, { useEffect, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Supplier } from '../types';
import { supplierService } from '../services/supplierService';
import { DataTable } from '../../../design-system/components/DataTable';
import { Button } from '../../../design-system/components/Button';
import { Badge } from '../../../design-system/components/Badge';

export function SupplierList() {
  const navigate = useNavigate();
  const [data, setData] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      const result = await supplierService.getAll();
      setData(result.data || []);
    } catch (error) {
      console.error('Failed to load suppliers', error);
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnDef<Supplier>[] = [
    {
      accessorKey: 'name',
      header: 'Razão Social',
    },
    {
      accessorKey: 'cnpj',
      header: 'CNPJ',
    },
    {
      accessorKey: 'email',
      header: 'Email',
    },
    {
      accessorKey: 'category',
      header: 'Categoria',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        const variant = 
          status === 'active' ? 'success' : 
          status === 'inactive' ? 'secondary' : 'danger';
        
        const label = 
          status === 'active' ? 'Ativo' : 
          status === 'inactive' ? 'Inativo' : 'Bloqueado';

        return <Badge variant={variant}>{label}</Badge>;
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const supplier = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate(`/suppliers/${supplier.id}/edit`)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => {
                if(confirm('Tem certeza que deseja excluir?')) {
                  supplierService.delete(supplier.id).then(loadSuppliers);
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
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Fornecedores</h2>
          <p className="text-gray-500">Gerencie a base de fornecedores cadastrados.</p>
        </div>
        <Button onClick={() => navigate('/suppliers/new')}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Fornecedor
        </Button>
      </div>

      <DataTable 
        columns={columns} 
        data={data} 
        searchColumn="name" 
        searchPlaceholder="Buscar por razão social..."
      />
    </div>
  );
}
