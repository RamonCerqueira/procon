import React, { useState } from 'react';
import { MessageCircle, X, Send, Minimize2, Maximize2 } from 'lucide-react';
import { Button } from '../design-system/components/Button';
import { Avatar } from '../design-system/components/Avatar';

export function InternalChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  
  const [messages, setMessages] = useState([
    { id: 1, sender: 'Ana (Jurídico)', text: 'O processo #2024.158 precisa de revisão.', time: '14:30', isSelf: false },
    { id: 2, sender: 'Você', text: 'Vou verificar agora mesmo.', time: '14:32', isSelf: true },
    { id: 3, sender: 'Carlos (Triagem)', text: 'A fila do guichê 3 está parada.', time: '14:35', isSelf: false },
  ]);

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 bg-blue-600 rounded-full shadow-lg shadow-blue-600/30 flex items-center justify-center text-white hover:bg-blue-700 transition-all transform hover:scale-105 z-50 group"
      >
        <MessageCircle className="h-7 w-7" />
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold h-5 w-5 rounded-full flex items-center justify-center border-2 border-white">
          2
        </span>
        <span className="absolute right-16 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Chat Interno
        </span>
      </button>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 flex flex-col transition-all duration-300 ${isMinimized ? 'h-14 overflow-hidden' : 'h-[500px]'}`}>
      {/* Header */}
      <div 
        className="bg-blue-600 p-4 flex items-center justify-between text-white cursor-pointer rounded-t-2xl"
        onClick={() => setIsMinimized(!isMinimized)}
      >
        <div className="flex items-center gap-2">
          <div className="relative">
            <MessageCircle className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 bg-green-400 h-2.5 w-2.5 rounded-full border-2 border-blue-600"></span>
          </div>
          <span className="font-bold">Chat Interno</span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}
            className="hover:bg-white/20 p-1 rounded"
          >
            {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
            className="hover:bg-white/20 p-1 rounded"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      {!isMinimized && (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex flex-col ${msg.isSelf ? 'items-end' : 'items-start'}`}>
                <div className="flex items-baseline gap-2 mb-1 px-1">
                  <span className="text-xs font-bold text-gray-600">{msg.sender}</span>
                  <span className="text-[10px] text-gray-400">{msg.time}</span>
                </div>
                <div className={`px-3 py-2 rounded-xl max-w-[85%] text-sm shadow-sm ${msg.isSelf ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-3 border-t border-gray-100 bg-white">
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Digite sua mensagem..." 
                className="flex-1 bg-gray-100 border-0 rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
              />
              <button className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 shadow-sm transition-colors">
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
