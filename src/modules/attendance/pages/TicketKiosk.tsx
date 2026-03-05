import React from 'react';
import { Shield, User, Users, AlertTriangle, Printer } from 'lucide-react';
import { Button } from '../../../design-system/components/Button';
import { useNavigate } from 'react-router-dom';

export function TicketKiosk() {
  const navigate = useNavigate();

  const handlePrint = (type: string) => {
    // Simulate printing
    alert(`Imprimindo senha: ${type.toUpperCase()}...`);
    // navigate('/'); // In a real kiosk, it stays on the screen
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8 select-none">
      
      {/* Header */}
      <div className="text-center mb-12">
        <div className="bg-blue-600 p-4 rounded-2xl inline-block mb-6 shadow-lg">
          <Shield className="h-16 w-16 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Bem-vindo ao PROCON</h1>
        <p className="text-xl text-gray-500">Toque na opção desejada para retirar sua senha</p>
      </div>

      {/* Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        
        <KioskButton 
          icon={User}
          title="Atendimento Normal"
          description="Abertura de reclamações e consultas"
          color="bg-blue-600 hover:bg-blue-700"
          onClick={() => handlePrint('normal')}
        />

        <KioskButton 
          icon={Users}
          title="Atendimento Preferencial"
          description="Idosos, Gestantes, PCD e Autistas"
          color="bg-green-600 hover:bg-green-700"
          onClick={() => handlePrint('preferencial')}
        />

        <KioskButton 
          icon={AlertTriangle}
          title="Superendividamento"
          description="Renegociação de dívidas (Lei 14.181)"
          color="bg-purple-600 hover:bg-purple-700"
          onClick={() => handlePrint('superendividamento')}
        />

        <KioskButton 
          icon={Shield}
          title="Fiscalização / Denúncia"
          description="Reportar irregularidades"
          color="bg-orange-600 hover:bg-orange-700"
          onClick={() => handlePrint('fiscalizacao')}
        />

      </div>

      {/* Footer */}
      <div className="mt-16 text-gray-400 text-sm flex items-center gap-2">
        <Printer className="h-4 w-4" />
        Terminal de Autoatendimento #01
      </div>

    </div>
  );
}

function KioskButton({ icon: Icon, title, description, color, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={`relative overflow-hidden group p-8 rounded-3xl shadow-xl transition-all transform active:scale-95 text-left h-48 flex flex-col justify-between ${color}`}
    >
      <div className="absolute top-0 right-0 p-8 opacity-20 transform group-hover:scale-125 transition-transform duration-500">
        <Icon className="h-32 w-32 text-white" />
      </div>
      
      <div className="relative z-10">
        <Icon className="h-10 w-10 text-white mb-4" />
        <h3 className="text-2xl font-bold text-white mb-1">{title}</h3>
        <p className="text-white/80 font-medium text-lg">{description}</p>
      </div>
    </button>
  );
}
