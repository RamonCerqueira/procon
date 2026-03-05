import React from 'react';
import { FileText, Download, Filter, Printer } from 'lucide-react';
import { Button } from '../../../design-system/components/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../design-system/components/Card';

export function ReportList() {
  const reports = [
    { title: 'Relatório Geral de Atendimentos', description: 'Visão completa de todos os atendimentos por período.', category: 'Atendimentos' },
    { title: 'Ranking de Fornecedores Reclamados', description: 'Lista das empresas com maior número de reclamações fundamentadas.', category: 'Fornecedores' },
    { title: 'Fiscalizações por Região', description: 'Mapa de calor das fiscalizações realizadas.', category: 'Fiscalização' },
    { title: 'Tempo Médio de Resolução', description: 'Indicadores de eficiência no tratamento das demandas.', category: 'Gestão' },
    { title: 'Pesquisas de Preços', description: 'Histórico de variações de preços de cesta básica e combustíveis.', category: 'Pesquisa' },
    { title: 'Superendividamento', description: 'Estatísticas de acordos e audiências de repactuação.', category: 'Superendividamento' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Relatórios Gerenciais</h2>
          <p className="text-gray-500">Exportação de dados e relatórios oficiais do sistema.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report, idx) => (
          <Card key={idx} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="bg-primary-50 p-2 rounded-lg">
                  <FileText className="h-6 w-6 text-primary-600" />
                </div>
                <span className="text-xs font-medium bg-gray-100 px-2 py-1 rounded text-gray-600">
                  {report.category}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="text-lg mb-2">{report.title}</CardTitle>
              <p className="text-sm text-gray-500 mb-4 h-10">
                {report.description}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="w-full">
                  <Filter className="mr-2 h-3 w-3" /> Filtrar
                </Button>
                <Button variant="ghost" size="sm" className="w-full text-primary-600">
                  <Download className="mr-2 h-3 w-3" /> PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
