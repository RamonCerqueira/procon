import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  MessageSquare, 
  AlertTriangle, 
  Lightbulb, 
  FileText, 
  Search,
  Phone,
  Sun,
  Moon,
  ChevronRight,
  Menu,
  X,
  User,
  MapPin,
  Calendar,
  FileCheck,
  BarChart3,
  HelpCircle
} from 'lucide-react';
import { Button } from '../../design-system/components/Button';
import { LGPDBanner } from '../../design-system/components/LGPDBanner';
import { cn } from '../../utils/cn';

// --- Components ---

const Navbar = ({ highContrast, toggleHighContrast, increaseFontSize, decreaseFontSize, navigate }: any) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className={cn("sticky top-0 z-50 shadow-md transition-colors duration-300", highContrast ? "bg-black border-b border-yellow-400" : "bg-white")}>
      {/* Top Accessibility Bar */}
      <div className={cn("py-1 px-4 text-xs font-medium", highContrast ? "bg-gray-900 text-yellow-400" : "bg-blue-900 text-white")}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex gap-4">
            <span className="hidden sm:inline">Prefeitura Municipal de João Pessoa</span>
            <span className="sm:hidden">PMJP</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={decreaseFontSize} className="hover:underline">A-</button>
            <button onClick={increaseFontSize} className="hover:underline">A+</button>
            <button onClick={toggleHighContrast} className="flex items-center gap-1 hover:underline">
              {highContrast ? <Sun className="h-3 w-3" /> : <Moon className="h-3 w-3" />}
              <span className="hidden sm:inline">Alto Contraste</span>
            </button>
            <a href="#conteudo" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-1/2 focus:-translate-x-1/2 focus:z-[60] focus:px-4 focus:py-2 focus:bg-yellow-400 focus:text-black focus:font-bold focus:rounded-md hover:underline">
              Ir para o conteúdo
            </a>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className={cn("p-2 rounded-lg", highContrast ? "bg-yellow-400" : "bg-blue-600")}>
            <Shield className={cn("h-8 w-8", highContrast ? "text-black" : "text-white")} />
          </div>
          <div className="flex flex-col">
            <span className={cn("text-xl font-bold leading-none tracking-tight", highContrast ? "text-yellow-400" : "text-gray-900")}>
              PROCON DIGITAL
            </span>
            <span className={cn("text-xs font-medium uppercase tracking-wider", highContrast ? "text-yellow-200" : "text-gray-500")}>
              João Pessoa
            </span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <nav className={cn("flex gap-6 text-sm font-medium", highContrast ? "text-yellow-400" : "text-gray-700")}>
            <a href="#" className="hover:text-blue-600 transition-colors">Institucional</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Legislação</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Notícias</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Fale Conosco</a>
          </nav>
          <Button 
            onClick={() => navigate('/login')}
            className={cn(
              "font-bold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5",
              highContrast ? "bg-yellow-400 text-black hover:bg-yellow-500" : "bg-blue-600 text-white hover:bg-blue-700"
            )}
          >
            <User className="h-4 w-4 mr-2" />
            Entrar
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden p-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 p-4 shadow-lg absolute w-full">
          <nav className="flex flex-col gap-4">
            <a href="#" className="text-gray-700 font-medium">Institucional</a>
            <a href="#" className="text-gray-700 font-medium">Legislação</a>
            <a href="#" className="text-gray-700 font-medium">Notícias</a>
            <Button onClick={() => navigate('/login')} className="w-full justify-center">
              Acessar Sistema
            </Button>
          </nav>
        </div>
      )}
    </div>
  );
};

const Hero = ({ highContrast }: any) => {
  return (
    <div className="relative bg-blue-900 text-white overflow-hidden">
      {/* Background Image & Gradient */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1577412647305-991150c7d163?q=80&w=2070&auto=format&fit=crop")' }}
      ></div>
      <div className={cn("absolute inset-0 opacity-90", highContrast ? "bg-black" : "bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900")}></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 flex flex-col items-center text-center">
        <h1 className={cn("text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 animate-fade-in-up", highContrast ? "text-yellow-400" : "text-white")}>
          Como podemos ajudar você hoje?
        </h1>
        <p className={cn("text-lg md:text-xl max-w-2xl mb-10 animate-fade-in-up delay-100", highContrast ? "text-yellow-200" : "text-blue-100")}>
          Acesse serviços, registre reclamações e acompanhe seus processos de forma 100% digital, rápida e transparente.
        </p>

        {/* Search Bar */}
        <div className="w-full max-w-2xl relative animate-fade-in-up delay-200">
          <input 
            type="text" 
            placeholder="Digite o serviço que procura (ex: Denúncia, Audiência, Pesquisa de Preço)..." 
            className={cn(
              "w-full pl-6 pr-14 py-4 rounded-full text-gray-900 shadow-2xl focus:outline-none focus:ring-4 transition-all text-base",
              highContrast 
                ? "bg-gray-900 border-2 border-yellow-400 text-yellow-400 placeholder-yellow-700 focus:ring-yellow-400/50" 
                : "bg-white focus:ring-blue-400/50 border-transparent"
            )}
          />
          <button className={cn(
            "absolute right-2 top-2 p-2 rounded-full transition-colors",
            highContrast ? "bg-yellow-400 text-black hover:bg-yellow-500" : "bg-blue-600 text-white hover:bg-blue-700"
          )}>
            <Search className="h-6 w-6" />
          </button>
        </div>

        {/* Quick Tags */}
        <div className="mt-8 flex flex-wrap justify-center gap-3 animate-fade-in-up delay-300">
          {['Registrar Reclamação', 'Consultar Processo', 'Pesquisa de Preços', 'Agendamento'].map((tag) => (
            <button 
              key={tag}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium transition-colors border",
                highContrast 
                  ? "border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black" 
                  : "border-blue-400/30 bg-blue-800/50 text-blue-100 hover:bg-white hover:text-blue-900"
              )}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const ServiceCard = ({ icon: Icon, title, description, onClick, highContrast, delay }: any) => (
  <button 
    onClick={onClick}
    className={cn(
      "flex flex-col items-start p-6 rounded-2xl transition-all duration-300 group text-left h-full border",
      highContrast 
        ? "bg-gray-900 border-yellow-400 hover:bg-yellow-400 hover:text-black" 
        : "bg-white border-gray-100 shadow-lg shadow-gray-200/50 hover:shadow-xl hover:-translate-y-1 hover:border-blue-200"
    )}
  >
    <div className={cn(
      "p-3 rounded-xl mb-4 transition-colors",
      highContrast ? "bg-yellow-400 text-black group-hover:bg-black group-hover:text-yellow-400" : "bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white"
    )}>
      <Icon className="h-8 w-8" />
    </div>
    <h3 className={cn("text-lg font-bold mb-2", highContrast ? "text-yellow-400 group-hover:text-black" : "text-gray-900")}>
      {title}
    </h3>
    <p className={cn("text-sm leading-relaxed", highContrast ? "text-yellow-200 group-hover:text-black" : "text-gray-500")}>
      {description}
    </p>
    <div className={cn("mt-auto pt-4 flex items-center text-sm font-bold", highContrast ? "text-yellow-400 group-hover:text-black" : "text-blue-600 group-hover:text-blue-700")}>
      Acessar <ChevronRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
    </div>
  </button>
);

const NewsCard = ({ date, category, title, highContrast }: any) => (
  <div className={cn(
    "flex gap-4 p-4 rounded-xl border transition-all cursor-pointer",
    highContrast 
      ? "bg-gray-900 border-gray-800 hover:border-yellow-400" 
      : "bg-white border-gray-100 hover:border-blue-200 hover:shadow-md"
  )}>
    <div className={cn(
      "flex flex-col items-center justify-center p-3 rounded-lg w-16 h-16 shrink-0",
      highContrast ? "bg-yellow-400 text-black" : "bg-blue-50 text-blue-700"
    )}>
      <span className="text-xl font-bold">{date.split('/')[0]}</span>
      <span className="text-xs uppercase font-bold">{['Jan','Fev','Mar','Abr','Mai','Jun'][parseInt(date.split('/')[1])-1]}</span>
    </div>
    <div>
      <span className={cn("text-xs font-bold uppercase tracking-wider mb-1 block", highContrast ? "text-yellow-400" : "text-blue-600")}>
        {category}
      </span>
      <h4 className={cn("font-bold text-sm leading-snug hover:underline", highContrast ? "text-white" : "text-gray-900")}>
        {title}
      </h4>
    </div>
  </div>
);

export function LandingPage() {
  const navigate = useNavigate();
  const [highContrast, setHighContrast] = useState(false);
  const [fontSize, setFontSize] = useState(16);

  const toggleHighContrast = () => setHighContrast(!highContrast);
  const increaseFontSize = () => setFontSize(Math.min(fontSize + 2, 24));
  const decreaseFontSize = () => setFontSize(Math.max(fontSize - 2, 14));

  return (
    <div 
      id="conteudo"
      className={cn(
        "min-h-screen font-sans transition-colors duration-300 selection:bg-blue-200 selection:text-blue-900",
        highContrast ? "bg-black text-yellow-400" : "bg-gray-50 text-gray-900"
      )}
      style={{ fontSize: `${fontSize}px` }}
    >
      <Navbar 
        highContrast={highContrast} 
        toggleHighContrast={toggleHighContrast}
        increaseFontSize={increaseFontSize}
        decreaseFontSize={decreaseFontSize}
        navigate={navigate}
      />
      
      <Hero highContrast={highContrast} />

      {/* Main Services Section - Floating Offset */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10 mb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ServiceCard 
            icon={FileText}
            title="Abrir Reclamação"
            description="Registre sua reclamação contra fornecedores de produtos ou serviços de forma rápida."
            onClick={() => navigate('/portal/consumer')}
            highContrast={highContrast}
          />
          <ServiceCard 
            icon={Search}
            title="Consultar Processo"
            description="Acompanhe o andamento das suas solicitações e veja as últimas movimentações."
            onClick={() => navigate('/portal/tracking')}
            highContrast={highContrast}
          />
          <ServiceCard 
            icon={MessageSquare}
            title="Ouvidoria"
            description="Envie sugestões, elogios ou denúncias para melhorar nossos serviços."
            onClick={() => navigate('/portal/ombudsman')}
            highContrast={highContrast}
          />
          <ServiceCard 
            icon={AlertTriangle}
            title="Denúncia Anônima"
            description="Reporte irregularidades e fiscalize o cumprimento das leis do consumidor."
            onClick={() => navigate('/portal/report')}
            highContrast={highContrast}
          />
        </div>
      </div>

      {/* Stats Section */}
      <div className={cn("py-16 border-y", highContrast ? "bg-gray-900 border-gray-800" : "bg-white border-gray-100")}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className={cn("text-3xl font-bold mb-4", highContrast ? "text-yellow-400" : "text-gray-900")}>Transparência em Números</h2>
            <p className={cn("max-w-2xl mx-auto", highContrast ? "text-yellow-200" : "text-gray-500")}>
              Acompanhe em tempo real os indicadores de atendimento do PROCON Municipal.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { label: 'Atendimentos Realizados', value: '15.420', icon: User },
              { label: 'Processos Concluídos', value: '12.850', icon: FileCheck },
              { label: 'Audiências Realizadas', value: '3.200', icon: Calendar },
              { label: 'Índice de Resolução', value: '92%', icon: BarChart3 },
            ].map((stat, idx) => (
              <div key={idx} className="flex flex-col items-center group">
                <div className={cn(
                  "mb-4 p-4 rounded-full transition-transform group-hover:scale-110",
                  highContrast ? "bg-yellow-400 text-black" : "bg-blue-50 text-blue-600"
                )}>
                  <stat.icon className="h-8 w-8" />
                </div>
                <div className={cn("text-3xl md:text-4xl font-extrabold mb-2", highContrast ? "text-white" : "text-gray-900")}>
                  {stat.value}
                </div>
                <div className={cn("text-sm font-medium uppercase tracking-wide", highContrast ? "text-yellow-200" : "text-gray-500")}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* News & Info Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* News Column */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-8">
              <h2 className={cn("text-2xl font-bold", highContrast ? "text-yellow-400" : "text-gray-900")}>
                Últimas Notícias
              </h2>
              <Button variant="ghost" className="text-blue-600">Ver todas</Button>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <NewsCard 
                date="05/03" 
                category="Superendividamento" 
                title="Mutirão de Renegociação de Dívidas começa nesta segunda-feira com descontos de até 90%"
                highContrast={highContrast}
              />
              <NewsCard 
                date="04/03" 
                category="Fiscalização" 
                title="Operação 'Preço Justo' autua 15 estabelecimentos por preços abusivos"
                highContrast={highContrast}
              />
              <NewsCard 
                date="03/03" 
                category="Educação" 
                title="PROCON nas Escolas: projeto leva conscientização para alunos da rede municipal"
                highContrast={highContrast}
              />
              <NewsCard 
                date="01/03" 
                category="Serviços" 
                title="Novo sistema de agendamento online reduz tempo de espera em 50%"
                highContrast={highContrast}
              />
            </div>
          </div>

          {/* Map Column */}
          <div className="lg:col-span-1">
             <h2 className={cn("text-2xl font-bold mb-8", highContrast ? "text-yellow-400" : "text-gray-900")}>
                Onde Estamos
              </h2>
            <div className={cn(
              "rounded-2xl overflow-hidden shadow-lg h-[400px] relative",
              highContrast ? "border-2 border-yellow-400" : "border border-gray-200"
            )}>
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3959.096333906376!2d-34.87373052417755!3d-7.114798671923769!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x7ace80387531985%3A0x66ee27ee85d3c6e9!2sPrefeitura%20Municipal%20de%20Jo%C3%A3o%20Pessoa!5e0!3m2!1spt-BR!2sbr!4v1709664123456!5m2!1spt-BR!2sbr" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="Mapa de Atendimento"
              ></iframe>
              <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur p-4 rounded-xl shadow-lg">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-red-600 mt-1" />
                  <div>
                    <p className="font-bold text-gray-900">Sede Principal</p>
                    <p className="text-sm text-gray-600">Av. Pedro I, 456 - Centro</p>
                    <p className="text-sm text-gray-600">João Pessoa - PB</p>
                    <p className="text-sm font-medium text-blue-600 mt-1">08:00 às 17:00</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className={cn(
        "pt-16 pb-8",
        highContrast ? "bg-gray-900 border-t-4 border-yellow-400 text-yellow-400" : "bg-blue-900 text-white"
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <Shield className="h-8 w-8" />
                <span className="text-xl font-bold">PROCON JP</span>
              </div>
              <p className={cn("text-sm leading-relaxed mb-6", highContrast ? "text-yellow-200" : "text-blue-100")}>
                Órgão de Proteção e Defesa do Consumidor da Prefeitura Municipal de João Pessoa. Trabalhando para garantir seus direitos.
              </p>
              <div className="flex gap-4">
                {/* Social Icons Placeholder */}
                <div className="w-8 h-8 rounded bg-white/10 hover:bg-white/20 cursor-pointer transition-colors"></div>
                <div className="w-8 h-8 rounded bg-white/10 hover:bg-white/20 cursor-pointer transition-colors"></div>
                <div className="w-8 h-8 rounded bg-white/10 hover:bg-white/20 cursor-pointer transition-colors"></div>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold text-lg mb-6">Serviços Rápidos</h4>
              <ul className={cn("space-y-3 text-sm", highContrast ? "text-yellow-200" : "text-blue-100")}>
                <li><a href="#" className="hover:underline">Denúncia Online</a></li>
                <li><a href="#" className="hover:underline">Consultar Processo</a></li>
                <li><a href="#" className="hover:underline">Pesquisa de Preços</a></li>
                <li><a href="#" className="hover:underline">Ranking de Reclamações</a></li>
                <li><a href="#" className="hover:underline">Legislação</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-6">Institucional</h4>
              <ul className={cn("space-y-3 text-sm", highContrast ? "text-yellow-200" : "text-blue-100")}>
                <li><a href="#" className="hover:underline">Sobre o PROCON</a></li>
                <li><a href="#" className="hover:underline">Organograma</a></li>
                <li><a href="#" className="hover:underline">Portal da Transparência</a></li>
                <li><a href="#" className="hover:underline">Perguntas Frequentes</a></li>
                <li><a href="#" className="hover:underline">Notícias</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-6">Atendimento</h4>
              <ul className={cn("space-y-3 text-sm", highContrast ? "text-yellow-200" : "text-blue-100")}>
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>156 (Disque PROCON)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>(83) 3218-1234</span>
                </li>
                <li className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-1" />
                  <span>Av. Pedro I, 456 - Centro<br/>João Pessoa - PB</span>
                </li>
                <li className="flex items-center gap-2">
                  <HelpCircle className="h-4 w-4" />
                  <span>atendimento@procon.jp.gov.br</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className={cn(
            "pt-8 border-t text-center text-sm",
            highContrast ? "border-yellow-400/30 text-yellow-200" : "border-blue-800 text-blue-200"
          )}>
            <p>&copy; 2024 Prefeitura Municipal de João Pessoa. Todos os direitos reservados.</p>
            <p className="mt-2 text-xs opacity-70">Desenvolvido com tecnologia de ponta para o cidadão.</p>
          </div>
        </div>
      </footer>

      {/* LGPD Banner */}
      <LGPDBanner />
    </div>
  );
}
