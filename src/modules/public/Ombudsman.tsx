import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scale, MessageSquare, AlertTriangle, ArrowRight, Shield, CheckCircle2 } from 'lucide-react';

export function Ombudsman() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    type: 'complaint', // complaint, compliment, suggestion, denunciation
    isAnonymous: false,
    name: '',
    email: '',
    phone: '',
    subject: '',
    description: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // API mock logic for saving ombudsman entry
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Manifestação Registrada</h2>
          <p className="text-gray-600 mb-6">
            Sua manifestação foi recebida com sucesso pela Ouvidoria do PROCON. 
            {!formData.isAnonymous && " O número do protocolo foi enviado para o seu e-mail."}
          </p>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-primary-600 text-white rounded-lg py-3 hover:bg-primary-700 transition"
          >
            Voltar para a Página Inicial
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <header className="bg-primary-900 text-white text-center py-16 px-4">
        <Scale className="w-16 h-16 mx-auto mb-6 text-primary-400" />
        <h1 className="text-4xl md:text-5xl font-bold mb-4 font-outfit">Ouvidoria do PROCON</h1>
        <p className="text-xl text-primary-100 max-w-2xl mx-auto font-inter">
          Um canal direto para registrar elogios, sugestões, reclamações ou denúncias sobre os nossos serviços.
        </p>
      </header>

      {/* Form Section */}
      <main className="max-w-3xl mx-auto -mt-8 px-4 relative z-10">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Manifestação</label>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { id: 'complaint', label: 'Reclamação', icon: AlertTriangle },
                  { id: 'compliment', label: 'Elogio', icon: MessageSquare },
                  { id: 'suggestion', label: 'Sugestão', icon: ArrowRight },
                  { id: 'denunciation', label: 'Denúncia', icon: Shield },
                ].map((type) => {
                  const Icon = type.icon;
                  return (
                    <label
                      key={type.id}
                      className={`flex flex-col items-center p-4 border rounded-xl cursor-pointer transition-all ${
                        formData.type === type.id
                          ? 'border-primary-600 bg-primary-50 text-primary-700'
                          : 'border-gray-200 hover:border-primary-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="type"
                        value={type.id}
                        checked={formData.type === type.id}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="sr-only"
                      />
                      <Icon className="w-6 h-6 mb-2" />
                      <span className="text-sm font-medium">{type.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Anonymous Toggle */}
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
              <input
                type="checkbox"
                id="isAnonymous"
                checked={formData.isAnonymous}
                onChange={(e) => setFormData({ ...formData, isAnonymous: e.target.checked })}
                className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <label htmlFor="isAnonymous" className="text-sm font-medium text-gray-700">
                Desejo que esta manifestação seja sigilosa/anônima.
              </label>
            </div>

            {/* Personal Data (if not anonymous) */}
            {!formData.isAnonymous && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
            )}

            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assunto</label>
              <input
                type="text"
                required
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                placeholder="Ex e: Atendimento demorado na unidade central"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
              <textarea
                required
                rows={5}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 resize-none"
                placeholder="Descreva detalhadamente o ocorrido..."
              />
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t">
              <button
                type="submit"
                className="w-full bg-primary-600 text-white rounded-lg py-3 font-medium hover:bg-primary-700 transition shadow-lg shadow-primary-600/20"
              >
                Enviar Manifestação
              </button>
            </div>

          </form>
        </div>
      </main>
    </div>
  );
}
