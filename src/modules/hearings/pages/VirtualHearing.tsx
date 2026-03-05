import React, { useState } from 'react';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  PhoneOff, 
  MessageSquare, 
  FileText, 
  Users, 
  Share2,
  MoreVertical,
  Send,
  Paperclip,
  CheckCircle2
} from 'lucide-react';
import { Button } from '../../../design-system/components/Button';
import { Input } from '../../../design-system/components/Input';
import { Avatar } from '../../../design-system/components/Avatar';

export function VirtualHearing() {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'ata' | 'participants'>('ata');
  
  const [ataContent, setAtaContent] = useState(`ATA DE AUDIÊNCIA DE CONCILIAÇÃO

PROCESSO Nº: 2024.03.00158
DATA: 05/03/2026
HORÁRIO: 14:00

PARTES:
Consumidor: JOÃO DA SILVA
Fornecedor: EMPRESA X LTDA

RELATO:
Aberta a audiência, as partes foram apregoadas e compareceram devidamente representadas.
O consumidor relata que adquiriu um produto com defeito e não obteve a troca.
A empresa propõe a devolução do valor pago corrigido.

ACORDO:
As partes compuseram acordo nos seguintes termos:
1. A empresa pagará a quantia de R$ 1.500,00 em 5 dias úteis.
2. O consumidor dará quitação plena após o pagamento.

Nada mais havendo, encerra-se o termo.`);

  return (
    <div className="h-[calc(100vh-64px)] bg-gray-900 flex flex-col md:flex-row overflow-hidden">
      
      {/* Main Video Area */}
      <div className="flex-1 flex flex-col p-4 gap-4 relative">
        
        {/* Header Overlay */}
        <div className="absolute top-6 left-6 z-10 bg-black/50 backdrop-blur-md px-4 py-2 rounded-lg text-white flex items-center gap-3">
          <div className="h-3 w-3 bg-red-500 rounded-full animate-pulse"></div>
          <span className="font-medium text-sm">Gravando • 00:15:32</span>
          <div className="w-px h-4 bg-white/20 mx-1"></div>
          <span className="text-gray-300 text-sm">Audiência #2024.03.00158</span>
        </div>

        {/* Video Grid */}
        <div className="flex-1 grid grid-cols-2 gap-4">
          {/* Participant 1 (Mediator) */}
          <div className="bg-gray-800 rounded-2xl overflow-hidden relative border-2 border-blue-500 shadow-lg shadow-blue-500/20">
            <img 
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=2069&auto=format&fit=crop" 
              className="w-full h-full object-cover"
              alt="Conciliador" 
            />
            <div className="absolute bottom-4 left-4 bg-black/60 px-3 py-1 rounded text-white text-sm font-medium flex items-center gap-2">
              <ShieldIcon className="h-4 w-4 text-blue-400" />
              Dra. Maria (Conciliadora PROCON)
            </div>
            <div className="absolute top-4 right-4 bg-blue-600 p-1.5 rounded-full">
              <Mic className="h-4 w-4 text-white" />
            </div>
          </div>

          {/* Participant 2 (Consumer) */}
          <div className="bg-gray-800 rounded-2xl overflow-hidden relative">
            <img 
              src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1974&auto=format&fit=crop" 
              className="w-full h-full object-cover"
              alt="Consumidor" 
            />
            <div className="absolute bottom-4 left-4 bg-black/60 px-3 py-1 rounded text-white text-sm font-medium">
              João da Silva (Consumidor)
            </div>
          </div>

          {/* Participant 3 (Supplier) */}
          <div className="bg-gray-800 rounded-2xl overflow-hidden relative">
            <img 
              src="https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1974&auto=format&fit=crop" 
              className="w-full h-full object-cover"
              alt="Fornecedor" 
            />
            <div className="absolute bottom-4 left-4 bg-black/60 px-3 py-1 rounded text-white text-sm font-medium">
              Rep. Empresa X Ltda
            </div>
            <div className="absolute top-4 right-4 bg-red-500/80 p-1.5 rounded-full">
              <MicOff className="h-4 w-4 text-white" />
            </div>
          </div>

          {/* Participant 4 (You) */}
          <div className="bg-gray-800 rounded-2xl overflow-hidden relative group">
            <div className="w-full h-full flex items-center justify-center bg-gray-700 text-gray-400">
              <div className="text-center">
                <div className="bg-gray-600 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-white">EU</span>
                </div>
                <p>Você (Câmera Desligada)</p>
              </div>
            </div>
            <div className="absolute bottom-4 left-4 bg-black/60 px-3 py-1 rounded text-white text-sm font-medium">
              Você
            </div>
          </div>
        </div>

        {/* Control Bar */}
        <div className="h-20 bg-gray-800 rounded-2xl flex items-center justify-center gap-4 px-8 shadow-2xl">
          <ControlButton 
            isActive={!isMuted} 
            onClick={() => setIsMuted(!isMuted)} 
            onIcon={Mic} 
            offIcon={MicOff} 
            color="bg-gray-700 hover:bg-gray-600"
          />
          <ControlButton 
            isActive={!isVideoOff} 
            onClick={() => setIsVideoOff(!isVideoOff)} 
            onIcon={Video} 
            offIcon={VideoOff} 
            color="bg-gray-700 hover:bg-gray-600"
          />
          <ControlButton 
            isActive={true} 
            onClick={() => {}} 
            onIcon={Share2} 
            offIcon={Share2} 
            color="bg-gray-700 hover:bg-gray-600 text-blue-400"
          />
          <ControlButton 
            isActive={true} 
            onClick={() => {}} 
            onIcon={Users} 
            offIcon={Users} 
            color="bg-gray-700 hover:bg-gray-600 md:hidden"
          />
          
          <div className="w-px h-8 bg-gray-600 mx-2"></div>
          
          <button className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-colors">
            <PhoneOff className="h-5 w-5" />
            Encerrar
          </button>
        </div>
      </div>

      {/* Sidebar (Chat/Ata) */}
      <div className="w-full md:w-96 bg-white border-l border-gray-200 flex flex-col">
        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button 
            onClick={() => setActiveTab('ata')}
            className={`flex-1 py-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'ata' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            Ata / Termo
          </button>
          <button 
            onClick={() => setActiveTab('chat')}
            className={`flex-1 py-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'chat' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            Chat
          </button>
          <button 
            onClick={() => setActiveTab('participants')}
            className={`flex-1 py-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'participants' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            Pessoas (4)
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden flex flex-col bg-gray-50">
          
          {activeTab === 'ata' && (
            <div className="flex-1 flex flex-col p-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 text-xs text-yellow-800 flex gap-2">
                <AlertCircleIcon className="h-4 w-4 shrink-0" />
                A ata é editada em tempo real pelo conciliador.
              </div>
              <textarea 
                className="flex-1 w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm resize-none shadow-inner"
                value={ataContent}
                onChange={(e) => setAtaContent(e.target.value)}
              />
              <div className="mt-4 flex gap-2">
                <Button className="flex-1" variant="outline">Pré-visualizar PDF</Button>
                <Button className="flex-1">
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Assinar e Finalizar
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'chat' && (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <ChatMessage 
                  sender="Sistema" 
                  time="14:00" 
                  text="Audiência iniciada. A gravação foi ativada." 
                  isSystem 
                />
                <ChatMessage 
                  sender="Conciliadora" 
                  time="14:02" 
                  text="Boa tarde a todos. Vamos iniciar a tentativa de conciliação." 
                />
                <ChatMessage 
                  sender="Adv. Empresa" 
                  time="14:05" 
                  text="Doutora, já enviamos a proposta de acordo nos autos." 
                />
                <ChatMessage 
                  sender="Consumidor" 
                  time="14:06" 
                  text="Eu aceito a proposta se o pagamento for à vista." 
                  isSelf
                />
              </div>
              <div className="p-4 bg-white border-t border-gray-200">
                <div className="flex gap-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <Paperclip className="h-5 w-5" />
                  </button>
                  <input 
                    type="text" 
                    placeholder="Digite sua mensagem..." 
                    className="flex-1 bg-gray-100 border-0 rounded-full px-4 focus:ring-2 focus:ring-blue-500"
                  />
                  <button className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700">
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </>
          )}

        </div>
      </div>

    </div>
  );
}

function ControlButton({ isActive, onClick, onIcon: OnIcon, offIcon: OffIcon, color }: any) {
  return (
    <button 
      onClick={onClick}
      className={`p-4 rounded-full transition-all ${isActive ? color : 'bg-red-500 hover:bg-red-600 text-white'}`}
    >
      {isActive ? <OnIcon className="h-6 w-6" /> : <OffIcon className="h-6 w-6" />}
    </button>
  );
}

function ChatMessage({ sender, time, text, isSystem, isSelf }: any) {
  if (isSystem) {
    return (
      <div className="text-center text-xs text-gray-400 my-2">
        {text}
      </div>
    );
  }
  
  return (
    <div className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'}`}>
      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-xs font-bold text-gray-700">{sender}</span>
        <span className="text-[10px] text-gray-400">{time}</span>
      </div>
      <div className={`px-4 py-2 rounded-2xl max-w-[85%] text-sm ${isSelf ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-200 text-gray-800 rounded-bl-none'}`}>
        {text}
      </div>
    </div>
  );
}

const ShieldIcon = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const AlertCircleIcon = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
