import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowLeft, Send, Paperclip } from 'lucide-react';
import { Tab } from '@headlessui/react';
import { Button } from '../../design-system/components/Button';
import { Input } from '../../design-system/components/Input';
import { Textarea } from '../../design-system/components/Textarea';
import { Select } from '../../design-system/components/Select';
import { Card, CardContent, CardHeader, CardTitle } from '../../design-system/components/Card';
import { cn } from '../../utils/cn';

export function ConsumerComplaint() {
  const navigate = useNavigate();
  const { register, handleSubmit } = useForm();
  const [selectedTab, setSelectedTab] = useState(0);

  const onSubmit = (data: any) => {
    console.log(data);
    alert('Reclamação registrada com sucesso! Protocolo: 20240305001');
    navigate('/');
  };

  const tabs = ['Seus Dados', 'Dados da Empresa', 'Relato e Pedido'];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center">
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
          <h1 className="text-3xl font-bold text-gray-900">Registrar Reclamação</h1>
          <p className="mt-2 text-gray-500">Preencha os dados abaixo para iniciar seu atendimento.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
            <Tab.List className="flex space-x-1 rounded-xl bg-gray-200 p-1 mb-6">
              {tabs.map((tab) => (
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
                  <CardHeader>
                    <CardTitle>Identificação do Consumidor</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input label="Nome Completo *" {...register('name')} />
                      <Input label="CPF *" placeholder="000.000.000-00" {...register('cpf')} />
                      <Input label="Email *" type="email" {...register('email')} />
                      <Input label="Telefone / WhatsApp *" placeholder="(00) 00000-0000" {...register('phone')} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="md:col-span-2">
                         <Input label="Endereço Completo" {...register('address')} />
                      </div>
                      <Input label="CEP" {...register('zipCode')} />
                    </div>
                  </CardContent>
                </Card>
              </Tab.Panel>

              <Tab.Panel>
                <Card>
                  <CardHeader>
                    <CardTitle>Dados da Empresa (Fornecedor)</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input label="Nome Fantasia ou Razão Social *" className="md:col-span-2" {...register('companyName')} />
                      <Input label="CNPJ (se souber)" placeholder="00.000.000/0000-00" {...register('companyCnpj')} />
                      <Input label="Telefone da Empresa" {...register('companyPhone')} />
                    </div>
                    <div className="pt-4 border-t border-gray-100">
                      <p className="text-sm text-gray-500 mb-4">Se a compra foi online:</p>
                      <Input label="Site / URL da Loja" placeholder="https://..." {...register('companyWebsite')} />
                    </div>
                  </CardContent>
                </Card>
              </Tab.Panel>

              <Tab.Panel>
                <Card>
                  <CardHeader>
                    <CardTitle>Detalhes do Problema</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                       <Input label="Data da Compra/Contrato" type="date" {...register('purchaseDate')} />
                       <Input label="Valor (R$)" placeholder="0,00" {...register('amount')} />
                       <Select 
                          label="Forma de Pagamento"
                          options={[
                            { value: 'credit_card', label: 'Cartão de Crédito' },
                            { value: 'debit_card', label: 'Cartão de Débito' },
                            { value: 'pix', label: 'PIX' },
                            { value: 'boleto', label: 'Boleto' },
                            { value: 'money', label: 'Dinheiro' },
                          ]}
                          {...register('paymentMethod')}
                       />
                    </div>

                    <Textarea 
                      label="Relato do Ocorrido *" 
                      rows={6} 
                      placeholder="Descreva detalhadamente o que aconteceu, as datas, quem atendeu, protocolos anteriores, etc."
                      {...register('description')} 
                    />

                    <Textarea 
                      label="O que você solicita? (Pedido) *" 
                      rows={3} 
                      placeholder="Ex: Devolução do dinheiro, Troca do produto, Cancelamento da cobrança..."
                      {...register('request')} 
                    />

                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer">
                      <Paperclip className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm font-medium text-gray-900">Anexar Documentos (Fotos, Nota Fiscal, Prints)</p>
                      <p className="text-xs text-gray-500">Clique para selecionar arquivos</p>
                    </div>
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
             {selectedTab < tabs.length - 1 ? (
               <Button type="button" onClick={() => setSelectedTab(selectedTab + 1)}>
                 Próximo
               </Button>
             ) : (
                <Button type="submit" size="lg" className="w-full md:w-auto bg-green-600 hover:bg-green-700">
                  <Send className="mr-2 h-4 w-4" /> Registrar Reclamação
                </Button>
             )}
          </div>
        </form>
      </main>
    </div>
  );
}
