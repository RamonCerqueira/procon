import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '../../../design-system/components/Button';
import { Input } from '../../../design-system/components/Input';
import { Select } from '../../../design-system/components/Select';
import { Textarea } from '../../../design-system/components/Textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../../../design-system/components/Card';
import { caseService } from '../services/caseService';
import { Tab } from '@headlessui/react';
import { cn } from '../../../utils/cn';

const caseSchema = z.object({
  consumerId: z.string().min(1, 'Consumidor é obrigatório'),
  supplierId: z.string().min(1, 'Fornecedor é obrigatório'),
  subject: z.string().min(5, 'Assunto deve ter no mínimo 5 caracteres'),
  description: z.string().min(10, 'Descrição deve ter no mínimo 10 caracteres'),
  request: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  internalNotes: z.string().optional(),
});

type CaseFormData = z.infer<typeof caseSchema>;

export function CaseForm() {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CaseFormData>({
    resolver: zodResolver(caseSchema),
    defaultValues: {
      priority: 'medium',
    },
  });

  const onSubmit = async (data: CaseFormData) => {
    try {
      await caseService.create({
        ...data,
        consumerId: Number(data.consumerId),
        supplierId: Number(data.supplierId),
        status: 'open',
      } as any);
      navigate('/cases');
    } catch (error) {
      console.error('Failed to create case', error);
    }
  };

  const tabs = ['Partes Envolvidas', 'Relato e Pedido', 'Observações'];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => navigate('/cases')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Novo Atendimento</h2>
          <p className="text-gray-500">Registre uma nova reclamação ou processo.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
          <Tab.List className="flex space-x-1 rounded-xl bg-gray-100 p-1 mb-6">
            {tabs.map((tab) => (
              <Tab
                key={tab}
                className={({ selected }) =>
                  cn(
                    'w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-all',
                    'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                    selected
                      ? 'bg-white text-blue-700 shadow'
                      : 'text-gray-500 hover:bg-white/[0.12] hover:text-gray-700'
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
                  <CardTitle>Identificação das Partes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <Select
                      label="Consumidor *"
                      options={[
                        { value: '1', label: 'Ana Maria Silva (123.456.789-00)' },
                        { value: '2', label: 'João Pedro Santos (234.567.890-11)' },
                      ]}
                      error={errors.consumerId?.message}
                      {...register('consumerId')}
                    />
                    <Select
                      label="Fornecedor *"
                      options={[
                        { value: '1', label: 'Magazine Luiza S/A' },
                        { value: '2', label: 'Casas Bahia Ltda' },
                      ]}
                      error={errors.supplierId?.message}
                      {...register('supplierId')}
                    />
                    <Select
                      label="Prioridade"
                      options={[
                        { value: 'low', label: 'Baixa' },
                        { value: 'medium', label: 'Média' },
                        { value: 'high', label: 'Alta' },
                        { value: 'urgent', label: 'Urgente' },
                      ]}
                      error={errors.priority?.message}
                      {...register('priority')}
                    />
                  </div>
                </CardContent>
              </Card>
            </Tab.Panel>

            <Tab.Panel>
              <Card>
                <CardHeader>
                  <CardTitle>Detalhes da Reclamação</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <Input
                      label="Assunto Principal *"
                      placeholder="Ex: Produto com defeito, Cobrança indevida..."
                      error={errors.subject?.message}
                      {...register('subject')}
                    />
                    <Textarea
                      label="Descrição do Problema *"
                      placeholder="Relate detalhadamente os fatos..."
                      rows={8}
                      error={errors.description?.message}
                      {...register('description')}
                    />
                    <Textarea
                      label="Pedido do Consumidor"
                      placeholder="O que o consumidor solicita? (Ex: Troca do produto, Devolução do valor...)"
                      rows={4}
                      {...register('request')}
                    />
                  </div>
                </CardContent>
              </Card>
            </Tab.Panel>

            <Tab.Panel>
              <Card>
                <CardHeader>
                  <CardTitle>Controle Interno</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    label="Observações Internas"
                    placeholder="Anotações visíveis apenas para os servidores..."
                    rows={6}
                    {...register('internalNotes')}
                  />
                </CardContent>
              </Card>
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>

        <div className="flex justify-end space-x-4 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/cases')}
          >
            Cancelar
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            <Save className="mr-2 h-4 w-4" />
            Registrar Atendimento
          </Button>
        </div>
      </form>
    </div>
  );
}
