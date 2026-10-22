import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../../../design-system/components/Card';
import { StatCard } from '../../../design-system/components/StatCard';
import { Users, Store, FileText, CheckCircle } from 'lucide-react';

const dataMonthly = [
  { name: 'Jan', atendimentos: 400, finalizados: 240 },
  { name: 'Fev', atendimentos: 300, finalizados: 139 },
  { name: 'Mar', atendimentos: 200, finalizados: 980 },
  { name: 'Abr', atendimentos: 278, finalizados: 390 },
  { name: 'Mai', atendimentos: 189, finalizados: 480 },
  { name: 'Jun', atendimentos: 239, finalizados: 380 },
];

const dataStatus = [
  { name: 'Em Aberto', value: 400 },
  { name: 'Em Análise', value: 300 },
  { name: 'Concluído', value: 300 },
  { name: 'Cancelado', value: 200 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export function Analytics() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">Indicadores de Desempenho</h2>
        <p className="text-gray-500">Dashboard analítico com métricas do sistema.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Atendimentos" value="2,350" icon={FileText} trend={{ value: 12, label: 'vs. período anterior' }} />
        <StatCard title="Consumidores" value="1,203" icon={Users} trend={{ value: 5, label: 'vs. período anterior' }} />
        <StatCard title="Fornecedores" value="450" icon={Store} trend={{ value: 2, label: 'vs. período anterior' }} />
        <StatCard title="Taxa de Resolução" value="87%" icon={CheckCircle} trend={{ value: 4, label: 'vs. período anterior' }} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Evolução Mensal</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dataMonthly}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="atendimentos" stroke="#8884d8" activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="finalizados" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status dos Processos</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dataStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {dataStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
