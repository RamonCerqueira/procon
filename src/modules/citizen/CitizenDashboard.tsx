import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  FileText, 
  Clock, 
  MessageSquare, 
  LogOut,
  Bell,
  User,
  Settings,
  HelpCircle,
  ChevronRight
} from 'lucide-react';
import { Button } from '../../design-system/components/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../design-system/components/Card';
import { useAuthStore } from '../../store/authStore';

export function CitizenDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Official Government Header */}
      <header className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-30">
        {/* Top Bar */}
        <div className="bg-blue-900 text-white text-xs py-1 px-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <span>Governo Municipal de João Pessoa</span>
            <div className="flex gap-4 items-center">
              <a href="#citizen-content" className="hover:text-blue-200 focus:outline-none focus:ring-2 focus:ring-white rounded px-1">
                Ir para o conteúdo
              </a>
              <button className="hover:text-blue-200">Alto Contraste</button>
              <button className="hover:text-blue-200">Mapa do Site</button>
            </div>
          </div>
        </div>

        {/* Main Navbar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 leading-none">PROCON DIGITAL</h1>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mt-1">Portal do Cidadão</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="hidden md:flex items-center space-x-4 border-r border-gray-200 pr-6">
              <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors relative">
                <Bell className="h-6 w-6" />
                <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
              <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                <Settings className="h-6 w-6" />
              </button>
              <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                <HelpCircle className="h-6 w-6" />
              </button>
            </div>
            
            <div className="flex items-center space-x-3 pl-2">
              <div className="hidden md:block text-right">
                <p className="text-sm font-bold text-gray-900">{user?.name || 'Cidadão'}</p>
                <p className="text-xs text-gray-500">{user?.email || 'cidadao@example.com'}</p>
              </div>
              <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200 text-gray-600">
                <User className="h-6 w-6" />
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="text-red-600 hover:bg-red-50 hover:text-red-700">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        
        {/* Welcome Banner with Pattern */}
        <div className="relative bg-blue-700 rounded-2xl p-8 text-white mb-8 shadow-lg overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <h2 className="text-3xl font-bold mb-2">Bem-vindo(a) ao seu Painel</h2>
              <p className="text-blue-100 max-w-xl text-lg">
                Aqui você tem controle total sobre suas demandas. Acompanhe processos, receba notificações e exerça seus direitos de forma simples e rápida.
              </p>
            </div>
            <div className="flex gap-3">
              <Button className="bg-white text-blue-700 hover:bg-blue-50 border-none">
                Nova Reclamação
              </Button>
              <Button variant="outline" className="border-white text-white hover:bg-blue-600 bg-transparent">
                Ver Tutoriais
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Processos Ativos', value: '2', color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Mensagens Não Lidas', value: '5', color: 'text-purple-600', bg: 'bg-purple-50' },
            { label: 'Audiências', value: '0', color: 'text-orange-600', bg: 'bg-orange-50' },
            { label: 'Concluídos', value: '12', color: 'text-green-600', bg: 'bg-green-50' },
          ].map((stat, idx) => (
            <div key={idx} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold">{stat.label}</p>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
              <div className={`h-10 w-10 rounded-full ${stat.bg} flex items-center justify-center`}>
                <div className={`h-2 w-2 rounded-full ${stat.color.replace('text', 'bg')}`}></div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Actions Column */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Services Grid */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-blue-600" />
                Serviços Disponíveis
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ServiceCard 
                  icon={FileText} 
                  title="Registrar Reclamação" 
                  desc="Inicie um processo contra uma empresa."
                  color="bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white"
                  onClick={() => navigate('/portal/consumer')}
                />
                <ServiceCard 
                  icon={MessageSquare} 
                  title="Ouvidoria" 
                  desc="Elogios, sugestões ou denúncias anônimas."
                  color="bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white"
                  onClick={() => navigate('/portal/ombudsman')}
                />
                <ServiceCard 
                  icon={Clock} 
                  title="Consultar Andamento" 
                  desc="Verifique o status detalhado dos seus processos."
                  color="bg-green-50 text-green-600 group-hover:bg-green-600 group-hover:text-white"
                  onClick={() => navigate('/portal/tracking')}
                />
                <ServiceCard 
                  icon={Shield} 
                  title="Denúncia de Fiscalização" 
                  desc="Reporte irregularidades em estabelecimentos."
                  color="bg-red-50 text-red-600 group-hover:bg-red-600 group-hover:text-white"
                  onClick={() => navigate('/portal/report')}
                />
              </div>
            </div>

            {/* Recent Activity Feed */}
            <Card>
              <CardHeader className="border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-bold text-gray-900">Últimas Movimentações</CardTitle>
                  <Button variant="ghost" size="sm" className="text-blue-600">Ver tudo</Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-100">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="p-4 hover:bg-gray-50 transition-colors flex gap-4">
                      <div className="mt-1">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                          {i === 1 ? 'DEC' : i === 2 ? 'MOV' : 'MSG'}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h4 className="text-sm font-bold text-gray-900">Processo #2024.000{i}58</h4>
                          <span className="text-xs text-gray-500">Há {i * 2} horas</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {i === 1 ? 'Decisão administrativa favorável emitida.' : 
                           i === 2 ? 'Processo encaminhado para análise jurídica.' : 
                           'Nova mensagem recebida do fornecedor.'}
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-300" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            
            {/* Notifications Card */}
            <Card className="border-l-4 border-l-yellow-400">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Bell className="h-5 w-5 text-yellow-600" />
                  Avisos Importantes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                    <h4 className="text-sm font-bold text-yellow-800 mb-1">Mutirão de Renegociação</h4>
                    <p className="text-xs text-yellow-700">
                      De 10 a 15 de março. Aproveite para quitar suas dívidas com até 90% de desconto.
                    </p>
                    <Button size="sm" variant="ghost" className="text-yellow-700 hover:text-yellow-800 hover:bg-yellow-100 p-0 h-auto mt-2 text-xs font-bold uppercase">
                      Saiba mais →
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Access */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Acesso Rápido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <QuickAccessLink label="Meus Dados Cadastrais" />
                <QuickAccessLink label="Alterar Senha" />
                <QuickAccessLink label="Certidões Negativas" />
                <QuickAccessLink label="Agendamento Presencial" />
              </CardContent>
            </Card>

            {/* Support Banner */}
            <div className="bg-gradient-to-br from-blue-800 to-blue-900 rounded-xl p-6 text-white text-center">
              <HelpCircle className="h-10 w-10 mx-auto mb-3 opacity-80" />
              <h4 className="font-bold mb-2">Precisa de Ajuda?</h4>
              <p className="text-sm text-blue-200 mb-4">
                Nossa equipe está disponível pelo chat ou telefone 156.
              </p>
              <Button size="sm" className="w-full bg-white text-blue-900 hover:bg-blue-50">
                Falar com Atendente
              </Button>
            </div>

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm text-gray-500">© 2024 PROCON Municipal de João Pessoa. Todos os direitos reservados.</p>
          <div className="flex justify-center gap-4 mt-4 text-xs text-gray-400">
            <a href="#" className="hover:text-gray-600">Política de Privacidade</a>
            <span>•</span>
            <a href="#" className="hover:text-gray-600">Termos de Uso</a>
            <span>•</span>
            <a href="#" className="hover:text-gray-600">Ouvidoria</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function ServiceCard({ icon: Icon, title, desc, color, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className="group flex items-start p-4 bg-white border border-gray-100 rounded-xl hover:shadow-md transition-all text-left w-full"
    >
      <div className={`p-3 rounded-lg transition-colors mr-4 ${color}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{title}</h4>
        <p className="text-xs text-gray-500 mt-1">{desc}</p>
      </div>
    </button>
  );
}

function QuickAccessLink({ label }: { label: string }) {
  return (
    <a href="#" className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 text-sm text-gray-600 hover:text-blue-600 transition-colors group">
      {label}
      <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-blue-600" />
    </a>
  );
}
