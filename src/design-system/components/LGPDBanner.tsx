import React, { useState, useEffect } from 'react';
import { Shield, X } from 'lucide-react';
import { Button } from './Button';

export function LGPDBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('lgpd-consent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('lgpd-consent', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg p-4 md:p-6 animate-in slide-in-from-bottom duration-500">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="bg-blue-100 p-2 rounded-full hidden md:block">
            <Shield className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Sua privacidade é nossa prioridade</h3>
            <p className="text-sm text-gray-600 leading-relaxed max-w-3xl">
              Nós utilizamos cookies e tecnologias similares para melhorar a sua experiência, analisar o tráfego e personalizar o conteúdo. 
              Ao continuar navegando, você concorda com a nossa <a href="#" className="text-blue-600 underline hover:text-blue-800">Política de Privacidade</a> e o tratamento dos seus dados conforme a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).
            </p>
          </div>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <Button variant="outline" className="flex-1 md:flex-none" onClick={() => setIsVisible(false)}>
            Configurar
          </Button>
          <Button className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white" onClick={handleAccept}>
            Aceitar e Continuar
          </Button>
        </div>
      </div>
    </div>
  );
}
