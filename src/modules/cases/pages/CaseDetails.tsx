import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Tab } from '@headlessui/react';
import { ArrowLeft, Send, Paperclip, FileText, Gavel, CheckSquare, Clock } from 'lucide-react';
import { Button } from '../../../design-system/components/Button';
import { Input } from '../../../design-system/components/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../../../design-system/components/Card';
import { Badge } from '../../../design-system/components/Badge';
import { Steps, Step } from '../../../design-system/components/Steps';
import { caseService } from '../services/caseService';
import { Case, CaseMessage } from '../types';
import { useAuthStore } from '../../../store/authStore';
import { cn } from '../../../utils/cn';

export function CaseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [messages, setMessages] = useState<CaseMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (id) {
      loadCase(Number(id));
      loadMessages(Number(id));
    }
  }, [id]);

  const loadCase = async (caseId: number) => {
    try {
      const data = await caseService.getById(caseId);
      setCaseData(data);
    } catch (error) {
      console.error('Failed to load case', error);
    }
  };

  const loadMessages = async (caseId: number) => {
    try {
      const data = await caseService.getMessages(caseId);
      setMessages(data || []);
    } catch (error) {
      console.error('Failed to load messages', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !id) return;

    try {
      await caseService.sendMessage(Number(id), newMessage, true);
      setNewMessage('');
      loadMessages(Number(id));
    } catch (error) {
      console.error('Failed to send message', error);
    }
  };

  const workflowSteps: Step[] = [
    { id: '1', name: 'Abertura', description: 'Reclamação registrada', status: 'completed', date: '01/03/2024' },
    { id: '2', name: 'Triagem', description: 'Análise inicial', status: 'completed', date: '02/03/2024' },
    { id: '3', name: 'Notificação', description: 'Fornecedor notificado (CIP)', status: 'current', date: '03/03/2024' },
    { id: '4', name: 'Resposta', description: 'Aguardando fornecedor', status: 'upcoming' },
    { id: '5', name: 'Audiência', description: 'Conciliação', status: 'upcoming' },
    { id: '6', name: 'Decisão', description: 'Finalização do processo', status: 'upcoming' },
  ];

  if (!caseData) return <div>Carregando...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => navigate('/cases')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">
              Protocolo #{caseData.protocol}
            </h2>
            <Badge variant="primary">{caseData.status}</Badge>
            <Badge variant={caseData.priority === 'urgent' ? 'danger' : 'secondary'}>
              {caseData.priority}
            </Badge>
          </div>
          <p className="text-gray-500">
            Aberto em {new Date(caseData.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Workflow & Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Fluxo do Processo</CardTitle>
            </CardHeader>
            <CardContent>
              <Steps steps={workflowSteps} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="mr-2 h-4 w-4" /> Gerar CIP
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Gavel className="mr-2 h-4 w-4" /> Agendar Audiência
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <CheckSquare className="mr-2 h-4 w-4" /> Registrar Decisão
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Clock className="mr-2 h-4 w-4" /> Solicitar Prazo
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Details & Tabs */}
        <div className="lg:col-span-2">
          <Tab.Group>
            <Tab.List className="flex space-x-1 rounded-xl bg-gray-100 p-1">
              {['Detalhes', 'Mensagens', 'Documentos', 'Histórico'].map((category) => (
                <Tab
                  key={category}
                  className={({ selected }) =>
                    cn(
                      'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                      'ring-white ring-opacity-60 ring-offset-2 ring-offset-primary-400 focus:outline-none focus:ring-2',
                      selected
                        ? 'bg-white text-primary-700 shadow'
                        : 'text-gray-500 hover:bg-white/[0.12] hover:text-gray-700'
                    )
                  }
                >
                  {category}
                </Tab>
              ))}
            </Tab.List>
            <Tab.Panels className="mt-4">
              <Tab.Panel>
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Informações do Atendimento</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <span className="text-sm font-medium text-gray-500">Assunto</span>
                        <p className="text-gray-900 font-medium text-lg">{caseData.subject}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Descrição do Problema</span>
                        <div className="mt-1 p-4 bg-gray-50 rounded-md text-gray-900 whitespace-pre-wrap">
                          {caseData.description}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Dados do Consumidor</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-lg font-medium">{caseData.consumerName}</p>
                        <p className="text-sm text-gray-500">CPF: 123.456.789-00</p>
                        <p className="text-sm text-gray-500">Email: consumidor@email.com</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>Dados do Fornecedor</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-lg font-medium">{caseData.supplierName}</p>
                        <p className="text-sm text-gray-500">CNPJ: 12.345.678/0001-00</p>
                        <p className="text-sm text-gray-500">Status: Regular</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </Tab.Panel>
              
              <Tab.Panel>
                <Card className="h-[600px] flex flex-col">
                  <CardHeader className="border-b bg-gray-50/50">
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Chat e Notificações
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={cn(
                          'flex w-full',
                          msg.senderId === user?.id ? 'justify-end' : 'justify-start'
                        )}
                      >
                        <div
                          className={cn(
                            'max-w-[80%] rounded-2xl p-4 shadow-sm',
                            msg.senderId === user?.id
                              ? 'bg-primary-600 text-white rounded-br-none'
                              : 'bg-gray-100 text-gray-900 rounded-bl-none'
                          )}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold opacity-90">{msg.senderName}</span>
                            <span className="text-[10px] opacity-70">
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-sm leading-relaxed">{msg.content}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                  <div className="p-4 border-t bg-gray-50">
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                      <Button type="button" variant="ghost" className="p-2">
                        <Paperclip className="h-5 w-5 text-gray-500" />
                      </Button>
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Digite sua mensagem ou despacho..."
                        className="flex-1 bg-white"
                      />
                      <Button type="submit" disabled={!newMessage.trim()}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </form>
                  </div>
                </Card>
              </Tab.Panel>
              
              <Tab.Panel>
                <Card>
                  <CardHeader>
                    <CardTitle>Documentos do Processo (GED)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                      <FileText className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                      <p>Nenhum documento anexado ainda.</p>
                      <Button variant="outline">Clique para fazer upload</Button>
                    </div>
                  </CardContent>
                </Card>
              </Tab.Panel>
              
              <Tab.Panel>
                <Card>
                  <CardHeader>
                    <CardTitle>Trilha de Auditoria</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex gap-4 items-start pb-4 border-b last:border-0">
                          <div className="mt-1 bg-gray-100 p-2 rounded-full">
                            <Clock className="h-4 w-4 text-gray-500" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">Alteração de Status</p>
                            <p className="text-xs text-gray-500">Usuário Admin alterou de "Triagem" para "Notificação"</p>
                            <p className="text-xs text-gray-400 mt-1">{new Date().toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        </div>
      </div>
    </div>
  );
}
