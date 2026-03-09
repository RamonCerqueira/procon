import React from 'react';
import { Bell, Menu } from 'lucide-react';

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      <div className="flex items-center">
        <button 
          onClick={onMenuClick}
          className="mr-4 text-gray-500 hover:text-gray-700 lg:hidden"
          aria-label="Abrir menu lateral"
        >
          <Menu className="h-6 w-6" aria-hidden="true" />
        </button>
        <h2 className="text-lg font-semibold text-gray-800">Painel Administrativo</h2>
      </div>

      <div className="flex items-center space-x-4">
        <button 
          className="relative text-gray-500 hover:text-gray-700"
          aria-label="Ver notificações"
        >
          <Bell className="h-6 w-6" aria-hidden="true" />
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
            3
          </span>
        </button>
        
        <div className="flex items-center space-x-3 border-l border-gray-200 pl-4" role="region" aria-label="Informações do usuário">
          <div className="flex flex-col text-right">
            <span className="text-sm font-medium text-gray-900">Admin User</span>
            <span className="text-xs text-gray-500">Administrador</span>
          </div>
          <div 
            className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold"
            aria-label="Avatar de Admin User"
            role="img"
          >
            AU
          </div>
        </div>
      </div>
    </header>
  );
}
