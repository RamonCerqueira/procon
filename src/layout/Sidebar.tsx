import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Store, 
  Briefcase, 
  ClipboardCheck, 
  AlertCircle, 
  FileText, 
  Gavel, 
  BarChart3, 
  Settings, 
  LogOut,
  Search,
  FileSearch,
  Wallet,
  Scale,
  Monitor,
  Smartphone,
  Video
} from 'lucide-react';
import { cn } from '../utils/cn';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';

interface NavSection {
  title: string;
  items: {
    name: string;
    path: string;
    icon: any;
    target?: string;
  }[];
}

const navSections: NavSection[] = [
  {
    title: 'Visão Geral',
    items: [
      { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { name: 'Indicadores', path: '/analytics', icon: BarChart3 },
    ]
  },
  {
    title: 'PROCON Digital',
    items: [
      { name: 'Atendimentos', path: '/cases', icon: Briefcase },
      { name: 'Consumidores', path: '/consumers', icon: Users },
      { name: 'Fornecedores', path: '/suppliers', icon: Store },
      { name: 'Fiscalizações', path: '/inspections', icon: ClipboardCheck },
      { name: 'Audiências', path: '/hearings', icon: Gavel },
    ]
  },
  {
    title: 'Superendividamento',
    items: [
      { name: 'Gestão de Casos', path: '/overindebtedness', icon: AlertCircle },
      { name: 'Negociação de Dívidas', path: '/overindebtedness/negotiation', icon: Wallet },
    ]
  },
  {
    title: 'GED & Jurídico',
    items: [
      { name: 'Gestão de Documentos', path: '/documents', icon: FileText },
    ]
  },
  {
    title: 'Pesquisa de Mercado',
    items: [
      { name: 'Pesquisa de Preços', path: '/price-research', icon: Search },
    ]
  },
  {
    title: 'Módulos Externos (Demo)',
    items: [
      { name: 'Painel de Senhas (TV)', path: '/queue/panel', icon: Monitor, target: '_blank' },
      { name: 'Totem de Senhas', path: '/queue/kiosk', icon: Monitor, target: '_blank' },
      { name: 'Sala de Audiência', path: '/hearings/live/1', icon: Video },
      { name: 'App do Fiscal', path: '/inspections/mobile', icon: Smartphone },
    ]
  },
  {
    title: 'Administração',
    items: [
      { name: 'Usuários e Permissões', path: '/users', icon: Users },
      { name: 'Configurações', path: '/settings', icon: Settings },
    ]
  }
];

export function Sidebar() {
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-gray-200 bg-white">
      <div className="flex h-16 items-center justify-center border-b border-gray-200 px-6 bg-primary-600">
        <h1 className="text-lg font-bold text-white">PROCON System</h1>
      </div>
      
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="space-y-6">
          {navSections.map((section) => (
            <div key={section.title}>
              <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                {section.title}
              </h3>
              <ul className="space-y-1">
                {section.items.map((item) => (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      target={item.target}
                      rel={item.target === '_blank' ? 'noopener noreferrer' : undefined}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
                          isActive && !item.target // Only highlight if not opening in new tab
                            ? 'bg-primary-50 text-primary-700'
                            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                        )
                      }
                    >
                      <item.icon className="mr-3 h-4 w-4" />
                      {item.name}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </nav>

      <div className="border-t border-gray-200 p-4">
        <button 
          onClick={handleLogout}
          className="flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
        >
          <LogOut className="mr-3 h-4 w-4" />
          Sair do Sistema
        </button>
      </div>
    </aside>
  );
}
