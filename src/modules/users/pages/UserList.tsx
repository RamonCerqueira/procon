import React, { useEffect, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Plus, Edit2, Shield, User } from 'lucide-react';
import { DataTable } from '../../../design-system/components/DataTable';
import { Button } from '../../../design-system/components/Button';
import { Badge } from '../../../design-system/components/Badge';

interface SystemUser {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  lastLogin: string;
}

const MOCK_USERS: SystemUser[] = [
  { id: 1, name: 'Admin User', email: 'admin@procon.pb.gov.br', role: 'Administrador', status: 'Ativo', lastLogin: '2024-03-05 08:30' },
  { id: 2, name: 'Fiscal João', email: 'joao.fiscal@procon.pb.gov.br', role: 'Fiscal', status: 'Ativo', lastLogin: '2024-03-04 14:15' },
  { id: 3, name: 'Maria Atendente', email: 'maria.atendimento@procon.pb.gov.br', role: 'Atendente', status: 'Ativo', lastLogin: '2024-03-05 09:00' },
  { id: 4, name: 'Pedro Conciliador', email: 'pedro.conciliacao@procon.pb.gov.br', role: 'Conciliador', status: 'Inativo', lastLogin: '2024-02-28 16:45' },
];

export function UserList() {
  const [data, setData] = useState<SystemUser[]>([]);

  useEffect(() => {
    setData(MOCK_USERS);
  }, []);

  const columns: ColumnDef<SystemUser>[] = [
    {
      accessorKey: 'name',
      header: 'Nome',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="bg-primary-100 p-1 rounded-full">
            <User className="h-4 w-4 text-primary-600" />
          </div>
          {row.getValue('name')}
        </div>
      ),
    },
    {
      accessorKey: 'email',
      header: 'Email',
    },
    {
      accessorKey: 'role',
      header: 'Perfil',
      cell: ({ row }) => <Badge variant="secondary">{row.getValue('role')}</Badge>,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        return <Badge variant={status === 'Ativo' ? 'success' : 'danger'}>{status}</Badge>;
      },
    },
    {
      accessorKey: 'lastLogin',
      header: 'Último Acesso',
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        return (
          <Button variant="ghost" size="sm">
            <Edit2 className="h-4 w-4" />
          </Button>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Usuários do Sistema</h2>
          <p className="text-gray-500">Gerenciamento de acesso e permissões.</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo Usuário
        </Button>
      </div>

      <DataTable 
        columns={columns} 
        data={data} 
        searchColumn="name" 
        searchPlaceholder="Buscar usuários..."
      />
    </div>
  );
}
