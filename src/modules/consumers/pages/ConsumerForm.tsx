import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '../../../design-system/components/Button';
import { Input } from '../../../design-system/components/Input';
import { Select } from '../../../design-system/components/Select';
import { Textarea } from '../../../design-system/components/Textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../../../design-system/components/Card';
import { consumerService } from '../services/consumerService';
import { Tab } from '@headlessui/react';
import { cn } from '../../../utils/cn';

const consumerSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  cpf: z.string().min(11, 'CPF inválido'),
  rg: z.string().optional(),
  birthDate: z.string().optional(),
  email: z.string().email('Email inválido'),
  phone: z.string().min(10, 'Telefone inválido'),
  mobile: z.string().optional(),
  address: z.string().optional(),
  number: z.string().optional(),
  complement: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  status: z.enum(['active', 'inactive', 'blocked']),
  notes: z.string().optional(),
});

type ConsumerFormData = z.infer<typeof consumerSchema>;

export function ConsumerForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const [selectedTab, setSelectedTab] = useState(0);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ConsumerFormData>({
    resolver: zodResolver(consumerSchema),
    defaultValues: {
      status: 'active',
    },
  });

  useEffect(() => {
    if (isEdit) {
      loadConsumer();
    }
  }, [id]);

  const loadConsumer = async () => {
    try {
      const consumer = await consumerService.getById(Number(id));
      reset(consumer as any);
    } catch (error) {
      console.error('Failed to load consumer', error);
      navigate('/consumers');
    }
  };

  const onSubmit = async (data: ConsumerFormData) => {
    try {
      if (isEdit) {
        await consumerService.update(Number(id), data);
      } else {
        await consumerService.create(data as any);
      }
      navigate('/consumers');
    } catch (error) {
      console.error('Failed to save consumer', error);
    }
  };

  const tabs = ['Dados Pessoais', 'Endereço', 'Observações'];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => navigate('/consumers')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            {isEdit ? 'Editar Consumidor' : 'Novo Consumidor'}
          </h2>
          <p className="text-gray-500">
            {isEdit ? 'Atualize os dados do consumidor.' : 'Cadastre um novo consumidor no sistema.'}
          </p>
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
                  <CardTitle>Identificação e Contato</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <Input
                      label="Nome Completo *"
                      error={errors.name?.message}
                      {...register('name')}
                    />
                    <Input
                      label="CPF *"
                      placeholder="000.000.000-00"
                      error={errors.cpf?.message}
                      {...register('cpf')}
                    />
                    <Input
                      label="RG"
                      {...register('rg')}
                    />
                    <Input
                      label="Data de Nascimento"
                      type="date"
                      {...register('birthDate')}
                    />
                    <Input
                      label="Email *"
                      type="email"
                      error={errors.email?.message}
                      {...register('email')}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Telefone Fixo"
                        placeholder="(00) 0000-0000"
                        error={errors.phone?.message}
                        {...register('phone')}
                      />
                      <Input
                        label="Celular / WhatsApp"
                        placeholder="(00) 90000-0000"
                        {...register('mobile')}
                      />
                    </div>
                    <Select
                      label="Status"
                      options={[
                        { value: 'active', label: 'Ativo' },
                        { value: 'inactive', label: 'Inativo' },
                        { value: 'blocked', label: 'Bloqueado' },
                      ]}
                      error={errors.status?.message}
                      {...register('status')}
                    />
                  </div>
                </CardContent>
              </Card>
            </Tab.Panel>

            <Tab.Panel>
              <Card>
                <CardHeader>
                  <CardTitle>Endereço Residencial</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-6">
                    <div className="md:col-span-2">
                      <Input
                        label="CEP"
                        placeholder="00000-000"
                        {...register('zipCode')}
                      />
                    </div>
                    <div className="md:col-span-3">
                      <Input
                        label="Logradouro"
                        {...register('address')}
                      />
                    </div>
                    <div className="md:col-span-1">
                      <Input
                        label="Número"
                        {...register('number')}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Input
                        label="Complemento"
                        placeholder="Ex: Apto 101"
                        {...register('complement')}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Input
                        label="Bairro"
                        {...register('neighborhood')}
                      />
                    </div>
                    <div className="md:col-span-1">
                      <Input
                        label="Cidade"
                        {...register('city')}
                      />
                    </div>
                    <div className="md:col-span-1">
                      <Input
                        label="Estado"
                        {...register('state')}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Tab.Panel>

            <Tab.Panel>
              <Card>
                <CardHeader>
                  <CardTitle>Informações Adicionais</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    label="Observações Internas"
                    placeholder="Informações adicionais sobre o consumidor..."
                    rows={6}
                    {...register('notes')}
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
            onClick={() => navigate('/consumers')}
          >
            Cancelar
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            <Save className="mr-2 h-4 w-4" />
            Salvar Consumidor
          </Button>
        </div>
      </form>
    </div>
  );
}
