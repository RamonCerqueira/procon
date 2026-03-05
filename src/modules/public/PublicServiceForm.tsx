import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { Shield, ArrowLeft, Send, Building, MapPin, Paperclip, AlertTriangle } from 'lucide-react';
import { Tab } from '@headlessui/react';
import { Button } from '../../design-system/components/Button';
import { Input } from '../../design-system/components/Input';
import { Textarea } from '../../design-system/components/Textarea';
import { Select } from '../../design-system/components/Select';
import { Card, CardContent, CardHeader, CardTitle } from '../../design-system/components/Card';
import { cn } from '../../utils/cn';

export function PublicServiceForm() {
  const navigate = useNavigate();
  const { type } = useParams<{ type: string }>(); // 'ombudsman', 'report', 'suggestion', 'tracking'
  const { register, handleSubmit, watch } = useForm();
  const [selectedTab, setSelectedTab] = useState(0);

  const getTitle = () => {
    switch (type) {
      case 'ombudsman': return 'Ouvidoria';
      case 'report': return 'Denúncia Anônima';
      case 'suggestion': return 'Sugestões e Elogios';
      case 'tracking': return 'Consultar Processo';
      default: return 'Solicitação';
    }
  };

  const getDescription = () => {
    switch (type) {
      case 'ombudsman': return 'Registre aqui sua manifestação sobre os serviços prestados pelo PROCON.';
      case 'report': return 'Faça uma denúncia de irregularidades. Seus dados serão mantidos em sigilo.';
      case 'suggestion': return 'Ajude-nos a melhorar nossos serviços com sua sugestão.';
      case 'tracking': return 'Informe o número do protocolo para ver o andamento.';
      default: return 'Preencha os dados abaixo.';
    }
  };

  const onSubmit = (data: any) => {
    console.log(data);
    alert('Solicitação enviada com sucesso! Protocolo: 2024.03.999');
    navigate('/');
  };

  if (type === 'tracking') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center pt-20 px-4">
        <div className="text-center mb-8">
            <Shield className="h-12 w-12 text-primary-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900">Procon Digital</h1>
            <p className="text-gray-500">Consulta de Processos e Protocolos</p>
        </div>
        <Card className="w-full max-w-md shadow-lg border-t-4 border-t-primary-600">
          <CardHeader>
            <CardTitle>Consultar Processo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input label="Número do Protocolo" placeholder="Ex: 2024.03.001" />
              <Input label="CPF/CNPJ do Solicitante" placeholder="000.000.000-00" />
              <Button className="w-full h-12 text-lg" onClick={() => alert('Funcionalidade de consulta simulada.')}>
                Pesquisar
              </Button>
              <Button variant="ghost" className="w-full" onClick={() => navigate('/')}>
                Voltar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const reportTabs = ['Empresa Denunciada', 'Irregularidade', 'Evidências'];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
            <Shield className="h-8 w-8 text-primary-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">Procon Digital</span>
          </div>
          <Button variant="ghost" onClick={() => navigate('/')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900">{getTitle()}</h1>
          <p className="mt-2 text-gray-500">{getDescription()}</p>
        </div>

        {type === 'report' ? (
           <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
             <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
               <Tab.List className="flex space-x-1 rounded-xl bg-gray-200 p-1 mb-6">
                 {reportTabs.map((tab) => (
                   <Tab
                     key={tab}
                     className={({ selected }) =>
                       cn(
                         'w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-all',
                         'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                         selected
                           ? 'bg-white text-blue-700 shadow'
                           : 'text-gray-600 hover:bg-white/[0.12] hover:text-gray-800'
                       )
                     }
                   >
                     {tab}
                   </Tab>
                 ))}
               </Tab.List>
               
               <Tab.Panels>
                 <Tab.Panel>
                    <Card>
                      <CardHeader><CardTitle>Quem você quer denunciar?</CardTitle></CardHeader>
                      <CardContent className="space-y-6">
                        <Input label="Nome do Estabelecimento *" {...register('companyName')} placeholder="Ex: Supermercado XYZ" />
                        <Input label="Endereço / Localização *" {...register('address')} placeholder="Rua, Número, Bairro, Ponto de Referência" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <Input label="Cidade" {...register('city')} />
                          <Input label="Bairro" {...register('neighborhood')} />
                        </div>
                      </CardContent>
                    </Card>
                 </Tab.Panel>

                 <Tab.Panel>
                    <Card>
                      <CardHeader><CardTitle>O que está acontecendo?</CardTitle></CardHeader>
                      <CardContent className="space-y-6">
                        <Select 
                          label="Tipo de Irregularidade" 
                          options={[
                            { value: 'preco', label: 'Preços Abusivos / Ausência de Preço' },
                            { value: 'validade', label: 'Produto Vencido / Estragado' },
                            { value: 'atendimento', label: 'Mau Atendimento / Fila Excessiva' },
                            { value: 'propaganda', label: 'Propaganda Enganosa' },
                            { value: 'outro', label: 'Outros' }
                          ]}
                          {...register('category')} 
                        />
                        <Textarea 
                          label="Descrição Detalhada *" 
                          rows={6} 
                          placeholder="Descreva o que você presenciou. Quanto mais detalhes, melhor."
                          {...register('description')} 
                        />
                      </CardContent>
                    </Card>
                 </Tab.Panel>

                 <Tab.Panel>
                    <Card>
                      <CardHeader><CardTitle>Provas e Anexos</CardTitle></CardHeader>
                      <CardContent className="space-y-6">
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer">
                           <Paperclip className="h-10 w-10 mx-auto text-gray-400 mb-3" />
                           <p className="font-medium text-gray-900">Adicionar Fotos ou Vídeos</p>
                           <p className="text-sm text-gray-500">Arraste arquivos ou clique para selecionar</p>
                        </div>
                        
                        <div className="bg-blue-50 p-4 rounded-lg flex items-start gap-3">
                           <AlertTriangle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                           <p className="text-sm text-blue-800">
                             Sua denúncia é anônima. Se desejar receber retorno, informe seu e-mail abaixo (opcional).
                           </p>
                        </div>
                        <Input label="Seu Email (Opcional)" placeholder="Para receber atualizações" {...register('contactEmail')} />
                      </CardContent>
                    </Card>
                 </Tab.Panel>
               </Tab.Panels>
             </Tab.Group>

             <div className="flex justify-end pt-4">
                {selectedTab > 0 && (
                  <Button type="button" variant="outline" className="mr-4" onClick={() => setSelectedTab(selectedTab - 1)}>
                    Anterior
                  </Button>
                )}
                {selectedTab < reportTabs.length - 1 ? (
                  <Button type="button" onClick={() => setSelectedTab(selectedTab + 1)}>
                    Próximo
                  </Button>
                ) : (
                   <Button type="submit" size="lg" className="w-full md:w-auto bg-red-600 hover:bg-red-700 text-white">
                     <Send className="mr-2 h-4 w-4" /> Enviar Denúncia
                   </Button>
                )}
             </div>
           </form>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input label="Nome Completo" {...register('name')} />
                  <Input label="Email" type="email" {...register('email')} />
                  <Input label="Telefone" {...register('phone')} />
                  <Input label="Cidade" {...register('city')} />
                </div>

                <div className="pt-2">
                  <Textarea 
                    label="Mensagem" 
                    rows={8} 
                    placeholder="Digite aqui sua mensagem, sugestão ou elogio..."
                    {...register('message')} 
                  />
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex items-center justify-center gap-2 cursor-pointer hover:bg-gray-50">
                  <Paperclip className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-600">Anexar Arquivo (Opcional)</span>
                </div>

                <div className="pt-4">
                  <Button type="submit" size="lg" className="w-full">
                    <Send className="mr-2 h-4 w-4" /> Enviar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
