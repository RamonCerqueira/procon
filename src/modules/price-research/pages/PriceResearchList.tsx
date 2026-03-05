import React, { useEffect, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Plus, Eye, BarChart2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from '../../../design-system/components/DataTable';
import { Button } from '../../../design-system/components/Button';
import { Badge } from '../../../design-system/components/Badge';

interface PriceSurvey {
  id: number;
  title: string;
  category: string;
  productsCount: number;
  establishmentsCount: number;
  date: string;
  status: string;
}

// Mock Data for Price Surveys
const MOCK_SURVEYS: PriceSurvey[] = [
  { id: 1, title: 'Cesta Básica - Março 2024', category: 'Alimentos', productsCount: 35, establishmentsCount: 12, date: '2024-03-01', status: 'Concluída' },
  { id: 2, title: 'Combustíveis - Semana 10', category: 'Combustíveis', productsCount: 4, establishmentsCount: 45, date: '2024-03-05', status: 'Em Andamento' },
  { id: 3, title: 'Material Escolar 2024', category: 'Papelaria', productsCount: 50, establishmentsCount: 20, date: '2024-01-15', status: 'Publicada' },
  { id: 4, title: 'Ovos de Páscoa 2024', category: 'Sazonal', productsCount: 25, establishmentsCount: 15, date: '2024-03-10', status: 'Agendada' },
];

export function PriceResearchList() {
  const navigate = useNavigate();
  const [data, setData] = useState<PriceSurvey[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setData(MOCK_SURVEYS);
      setLoading(false);
    }, 500);
  }, []);

  const columns: ColumnDef<PriceSurvey>[] = [
    {
      accessorKey: 'title',
      header: 'Título da Pesquisa',
    },
    {
      accessorKey: 'category',
      header: 'Categoria',
    },
    {
      accessorKey: 'productsCount',
      header: 'Produtos',
    },
    {
      accessorKey: 'establishmentsCount',
      header: 'Estabelecimentos',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        let variant: 'primary' | 'secondary' | 'success' | 'warning' = 'secondary';
        
        if (status === 'Publicada') variant = 'success';
        if (status === 'Em Andamento') variant = 'warning';
        if (status === 'Concluída') variant = 'primary';

        return <Badge variant={variant}>{status}</Badge>;
      },
    },
    {
      accessorKey: 'date',
      header: 'Data',
      cell: ({ row }) => new Date(row.getValue('date')).toLocaleDateString(),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        return (
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" title="Ver Detalhes">
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" title="Relatório">
              <BarChart2 className="h-4 w-4" />
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
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Pesquisa de Preços</h2>
          <p className="text-gray-500">Monitoramento de mercado e coleta de preços.</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nova Pesquisa
        </Button>
      </div>

      <DataTable 
        columns={columns} 
        data={data} 
        searchColumn="title" 
        searchPlaceholder="Buscar pesquisas..."
      />
    </div>
  );
}
