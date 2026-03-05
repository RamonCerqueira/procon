import React, { useEffect, useState } from 'react';
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
  AreaChart,
  Area
} from 'recharts';
import { 
  Users, 
  Store, 
  Briefcase, 
  AlertCircle, 
  Activity,
  CheckCircle2,
  Clock,
  MessageSquare,
  Gavel,
  FileText,
  Search,
  MapPin,
  TrendingUp,
  ArrowRight,
  Shield,
  Smartphone,
  Wifi,
  Database
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { StatCard } from '../../design-system/components/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '../../design-system/components/Card';
import { Button } from '../../design-system/components/Button';
import { Badge } from '../../design-system/components/Badge';
import api from '../../services/api';

const COLORS = ['#0ea5e9', '#22c55e', '#eab308', '#ef4444'];

export function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalCases: 0,
    openCases: 0,
    consumers: 0,
    suppliers: 0,
    documents: 0,
  });

  useEffect(() => {
    // Fetch stats
    api.get('/dashboard/stats').then((res) => {
      setStats(res.data);
    });
  }, []);

  // Mock data for charts
  const monthlyData = [
    { name: 'Jan', cases: 165, resolved: 120 },
    { name: 'Fev', cases: 159, resolved: 130 },
    { name: 'Mar', cases: 180, resolved: 150 },
    { name: 'Abr', cases: 181, resolved: 160 },
    { name: 'Mai', cases: 156, resolved: 140 },
    { name: 'Jun', cases: 155, resolved: 145 },
    { name: 'Jul', cases: 190, resolved: 170 },
  ];

  const statusData = [
    { name: 'Aberto', value: 45 },
    { name: 'Em Andamento', value: 30 },
    { name: 'Concluído', value: 25 },
    { name: 'Cancelado', value: 10 },
  ];

  const recentActivity = [
    { id: 1, type: 'new_case', text: 'Novo processo aberto: Maria Silva vs. Loja X', time: '10 min atrás', icon: FileText, color: 'text-blue-600', bg: 'bg-blue-100' },
    { id: 2, type: 'hearing', text: 'Audiência iniciada: Processo #2024.158', time: '25 min atrás', icon: Gavel, color: 'text-purple-600', bg: 'bg-purple-100' },
    { id: 3, type: 'inspection', text: 'Fiscalização concluída: Supermercado Y', time: '1h atrás', icon: Shield, color: 'text-orange-600', bg: 'bg-orange-100' },
    { id: 4, type: 'msg', text: 'Nova mensagem do Cidadão no Portal', time: '2h atrás', icon: MessageSquare, color: 'text-green-600', bg: 'bg-green-100' },
  ];

  return (
    <div className="space-y-8">
      
      {/* Header & System Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
            <Activity className="h-8 w-8 text-blue-600" />
            Centro de Controle Operacional
          </h2>
          <p className="text-gray-500 mt-1">Visão geral em tempo real das operações do PROCON Municipal.</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <SystemStatus label="SINDEC" status="online" />
          <SystemStatus label="Receita Federal" status="online" />
          <SystemStatus label="TJ-PB" status="online" />
          <SystemStatus label="WhatsApp API" status="warning" />
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total de Atendimentos"
          value={stats.totalCases}
          icon={Briefcase}
          trend={{ value: 12, label: 'vs. mês anterior' }}
          className="border-l-4 border-l-blue-500 shadow-md"
        />
        <StatCard
          title="Em Andamento"
          value={stats.openCases}
          icon={Clock}
          className="border-l-4 border-l-yellow-500 shadow-md"
        />
        <StatCard
          title="Resolvidos (Mês)"
          value={Math.round(stats.totalCases * 0.7)}
          icon={CheckCircle2}
          trend={{ value: 8, label: 'aumento de eficiência' }}
          className="border-l-4 border-l-green-500 shadow-md"
        />
        <StatCard
          title="Tempo Médio de Espera"
          value="12 min"
          icon={Users}
          trend={{ value: -2, label: 'mais rápido' }}
          className="border-l-4 border-l-purple-500 shadow-md"
        />
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Quick Actions & Charts */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Quick Actions */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-gray-500" />
                Ações Rápidas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <QuickActionButton 
                  icon={FileText} 
                  label="Novo Atendimento" 
                  onClick={() => navigate('/cases/new')} 
                  color="bg-blue-600 hover:bg-blue-700" 
                />
                <QuickActionButton 
                  icon={Gavel} 
                  label="Agendar Audiência" 
                  onClick={() => navigate('/hearings/new')} 
                  color="bg-purple-600 hover:bg-purple-700" 
                />
                <QuickActionButton 
                  icon={Shield} 
                  label="Nova Fiscalização" 
                  onClick={() => navigate('/inspections')} 
                  color="bg-orange-600 hover:bg-orange-700" 
                />
                <QuickActionButton 
                  icon={Search} 
                  label="Pesquisa de Preço" 
                  onClick={() => navigate('/price-research')} 
                  color="bg-green-600 hover:bg-green-700" 
                />
              </div>
            </CardContent>
          </Card>

          {/* Charts Area */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="text-sm font-medium uppercase text-gray-500">Volume de Atendimentos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyData}>
                      <defs>
                        <linearGradient id="colorCases" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="cases" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorCases)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="text-sm font-medium uppercase text-gray-500">Eficiência de Resolução</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="cases" fill="#cbd5e1" radius={[4, 4, 0, 0]} name="Abertos" />
                      <Bar dataKey="resolved" fill="#22c55e" radius={[4, 4, 0, 0]} name="Resolvidos" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>

        {/* Right Column: Activity & Map */}
        <div className="space-y-8">
          
          {/* Recent Activity */}
          <Card className="shadow-md h-full max-h-[500px] flex flex-col">
            <CardHeader className="border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold text-gray-900">Atividade Recente</CardTitle>
                <Button variant="ghost" size="sm" className="text-xs text-blue-600 h-8">Ver tudo</Button>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-y-auto">
              <div className="divide-y divide-gray-100">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="p-4 hover:bg-gray-50 transition-colors flex gap-3">
                    <div className={`mt-1 p-2 rounded-lg ${activity.bg} ${activity.color}`}>
                      <activity.icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.text}</p>
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {activity.time}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-300 mt-2" />
                  </div>
                ))}
                {/* Repeat for scroll effect */}
                {recentActivity.map((activity) => (
                  <div key={`${activity.id}-dup`} className="p-4 hover:bg-gray-50 transition-colors flex gap-3">
                    <div className={`mt-1 p-2 rounded-lg ${activity.bg} ${activity.color}`}>
                      <activity.icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.text}</p>
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {activity.time}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-300 mt-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Operations Map Placeholder */}
          <Card className="shadow-md overflow-hidden bg-gray-900 text-white relative h-[250px] group cursor-pointer">
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-40 group-hover:opacity-30 transition-opacity group-hover:scale-105 duration-700"
              style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2074&auto=format&fit=crop")' }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
            
            <div className="relative z-10 p-6 flex flex-col h-full justify-between">
              <div className="flex justify-between items-start">
                <Badge variant="warning" className="animate-pulse bg-yellow-500 text-black border-none">
                  AO VIVO
                </Badge>
                <MapPin className="h-5 w-5 text-gray-400" />
              </div>
              
              <div>
                <h3 className="text-xl font-bold mb-1">Fiscalização em Tempo Real</h3>
                <p className="text-sm text-gray-300">3 equipes em campo | 12 ocorrências</p>
                <Button size="sm" className="mt-4 w-full bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm">
                  Abrir Mapa Operacional
                </Button>
              </div>
            </div>
          </Card>

        </div>
      </div>
    </div>
  );
}

function SystemStatus({ label, status }: { label: string, status: 'online' | 'offline' | 'warning' }) {
  const colors = {
    online: 'bg-green-100 text-green-700 border-green-200',
    offline: 'bg-red-100 text-red-700 border-red-200',
    warning: 'bg-yellow-100 text-yellow-700 border-yellow-200'
  };

  const dots = {
    online: 'bg-green-500',
    offline: 'bg-red-500',
    warning: 'bg-yellow-500'
  };

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium ${colors[status]}`}>
      <div className={`h-2 w-2 rounded-full ${dots[status]} animate-pulse`} />
      {label}
    </div>
  );
}

function QuickActionButton({ icon: Icon, label, onClick, color }: any) {
  return (
    <button 
      onClick={onClick}
      className={`${color} text-white p-4 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 flex flex-col items-center justify-center gap-2 h-24`}
    >
      <Icon className="h-6 w-6" />
      <span className="text-xs font-bold text-center leading-tight">{label}</span>
    </button>
  );
}
