import React, { useState, useEffect } from 'react';
import { cn } from '../../../utils/cn';
import { Shield, Clock, Volume2 } from 'lucide-react';

export function QueuePanel() {
  const [currentCall, setCurrentCall] = useState({
    ticket: 'A042',
    counter: '03',
    name: 'MARIA DA SILVA',
    service: 'ATENDIMENTO PREFERENCIAL'
  });

  const [history, setHistory] = useState([
    { ticket: 'N105', counter: '01' },
    { ticket: 'A041', counter: '03' },
    { ticket: 'N104', counter: '02' },
    { ticket: 'N103', counter: '05' },
  ]);

  // Simulate calling new tickets
  useEffect(() => {
    const interval = setInterval(() => {
      // Logic to rotate calls would go here
      // For demo, we just blink the current call occasionally
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white overflow-hidden flex flex-col">
      {/* Top Bar */}
      <header className="bg-blue-900 py-4 px-8 flex justify-between items-center shadow-lg z-10">
        <div className="flex items-center gap-4">
          <div className="bg-white p-2 rounded-lg">
            <Shield className="h-10 w-10 text-blue-900" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-wider">PROCON DIGITAL</h1>
            <p className="text-blue-200 font-medium">PREFEITURA DE JOÃO PESSOA</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-4xl font-bold font-mono">14:35</p>
          <p className="text-blue-200 text-lg">Quarta-feira, 05 de Março de 2026</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex p-6 gap-6">
        
        {/* Left: Current Call (Big) */}
        <div className="w-2/3 bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col">
          <div className="bg-blue-600 py-6 text-center">
            <h2 className="text-4xl font-bold text-white uppercase tracking-widest flex items-center justify-center gap-4">
              <Volume2 className="h-10 w-10 animate-pulse" />
              Chamada Atual
            </h2>
          </div>
          
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-12">
            <div>
              <p className="text-gray-500 text-3xl font-medium uppercase mb-2">Senha</p>
              <p className="text-[180px] leading-none font-bold text-blue-900 font-mono tracking-tighter animate-bounce-subtle">
                {currentCall.ticket}
              </p>
            </div>
            
            <div className="w-full h-px bg-gray-200"></div>

            <div className="grid grid-cols-2 w-full gap-8">
              <div>
                <p className="text-gray-500 text-2xl font-medium uppercase mb-1">Guichê</p>
                <p className="text-8xl font-bold text-red-600 font-mono">{currentCall.counter}</p>
              </div>
              <div>
                <p className="text-gray-500 text-2xl font-medium uppercase mb-1">Nome</p>
                <p className="text-4xl font-bold text-gray-800 line-clamp-2 mt-4">{currentCall.name}</p>
              </div>
            </div>
            
            <div className="bg-blue-50 px-8 py-4 rounded-full">
              <p className="text-2xl font-bold text-blue-800">{currentCall.service}</p>
            </div>
          </div>
        </div>

        {/* Right: Sidebar (History & News) */}
        <div className="w-1/3 flex flex-col gap-6">
          
          {/* History */}
          <div className="bg-gray-800 rounded-3xl p-6 shadow-xl flex-1">
            <h3 className="text-2xl font-bold text-blue-400 mb-6 flex items-center gap-2 border-b border-gray-700 pb-4">
              <Clock className="h-6 w-6" />
              Últimas Chamadas
            </h3>
            <div className="space-y-4">
              {history.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center bg-gray-700/50 p-4 rounded-xl border border-gray-600">
                  <div>
                    <span className="text-gray-400 text-sm uppercase block mb-1">Senha</span>
                    <span className="text-4xl font-bold text-white font-mono">{item.ticket}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-gray-400 text-sm uppercase block mb-1">Guichê</span>
                    <span className="text-4xl font-bold text-yellow-400 font-mono">{item.counter}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* News / Institutional Video Placeholder */}
          <div className="bg-black rounded-3xl overflow-hidden h-1/3 relative border border-gray-700 shadow-xl">
             <div className="absolute inset-0 flex items-center justify-center">
               <div className="text-center">
                 <Shield className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                 <p className="text-gray-500 font-medium">Espaço para Vídeo Institucional</p>
               </div>
             </div>
             {/* Overlay Text */}
             <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6">
               <p className="text-white font-bold text-lg">Mutirão de Renegociação: Aproveite descontos de até 90%</p>
             </div>
          </div>

        </div>
      </main>
      
      {/* Scrolling Ticker */}
      <div className="bg-yellow-400 text-black py-3 overflow-hidden whitespace-nowrap">
        <div className="inline-block animate-marquee text-2xl font-bold">
          BEM-VINDO AO PROCON MUNICIPAL DE JOÃO PESSOA  •  ATENDIMENTO DAS 08H ÀS 17H  •  DOCUMENTOS NECESSÁRIOS: RG, CPF, COMPROVANTE DE RESIDÊNCIA E DOCUMENTOS DA RECLAMAÇÃO  •  RESPEITE O SILÊNCIO  •  
        </div>
      </div>
    </div>
  );
}
