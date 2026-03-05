import React, { useState } from 'react';
import { FileText, Gavel, Scale, Search, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '../../../design-system/components/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../design-system/components/Card';
import { Badge } from '../../../design-system/components/Badge';

export function LegalOpinions() {
  const [opinions, setOpinions] = useState([
    { id: 1, protocol: '2024.03.00158', type: 'Decisão Administrativa', subject: 'Vício do Produto', status: 'concluido', date: '05/03/2026', author: 'Dr. Silva' },
    { id: 2, protocol: '2024.03.00162', type: 'Parecer Técnico', subject: 'Cobrança Indevida', status: 'em_analise', date: '04/03/2026', author: 'Dra. Ana' },
    { id: 3, protocol: '2024.03.00175', type: 'Notificação', subject: 'Publicidade Enganosa', status: 'pendente', date: '03/03/2026', author: 'Dr. Carlos' },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Pareceres Jurídicos</h2>
          <p className="text-gray-500">Gestão de decisões e análises jurídicas do PROCON.</p>
        </div>
        <Button onClick={() => alert('Módulo de criação de pareceres em desenvolvimento.')}>
          <Gavel className="mr-2 h-4 w-4" />
          Novo Parecer
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
              <Scale className="h-8 w-8" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Em Análise</p>
              <h3 className="text-2xl font-bold text-gray-900">12</h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
              <CheckCircle className="h-8 w-8" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Concluídos (Mês)</p>
              <h3 className="text-2xl font-bold text-gray-900">45</h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
              <Clock className="h-8 w-8" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Pendentes</p>
              <h3 className="text-2xl font-bold text-gray-900">5</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Últimos Pareceres Emitidos</CardTitle>
            <div className="relative w-64">
              <input
                type="text"
                placeholder="Buscar por protocolo..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600 font-medium border-b">
                <tr>
                  <th className="px-4 py-3">Protocolo</th>
                  <th className="px-4 py-3">Tipo</th>
                  <th className="px-4 py-3">Assunto</th>
                  <th className="px-4 py-3">Autor</th>
                  <th className="px-4 py-3">Data</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {opinions.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-blue-600">{item.protocol}</td>
                    <td className="px-4 py-3">{item.type}</td>
                    <td className="px-4 py-3">{item.subject}</td>
                    <td className="px-4 py-3">{item.author}</td>
                    <td className="px-4 py-3">{item.date}</td>
                    <td className="px-4 py-3">
                      <Badge variant={
                        item.status === 'concluido' ? 'success' : 
                        item.status === 'em_analise' ? 'primary' : 'warning'
                      }>
                        {item.status === 'concluido' ? 'Concluído' : 
                         item.status === 'em_analise' ? 'Em Análise' : 'Pendente'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="sm" onClick={() => alert(`Visualizar parecer ${item.protocol}`)}>
                        <FileText className="h-4 w-4 text-gray-500" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
