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
import { supplierService } from '../services/supplierService';
import { Tab } from '@headlessui/react';
import { cn } from '../../../utils/cn';

const supplierSchema = z.object({
  name: z.string().min(3, 'Razão social deve ter no mínimo 3 caracteres'),
  tradeName: z.string().optional(),
  cnpj: z.string().min(14, 'CNPJ inválido'),
  stateRegistration: z.string().optional(),
  email: z.string().email('Email inválido'),
  phone: z.string().min(10, 'Telefone inválido'),
  website: z.string().url().optional().or(z.literal('')),
  category: z.string().min(1, 'Categoria é obrigatória'),
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

type SupplierFormData = z.infer<typeof supplierSchema>;

export function SupplierForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const [selectedTab, setSelectedTab] = useState(0);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SupplierFormData>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      status: 'active',
    },
  });

  useEffect(() => {
    if (isEdit) {
      loadSupplier();
    }
  }, [id]);

  const loadSupplier = async () => {
    try {
      const supplier = await supplierService.getById(Number(id));
      reset(supplier as any);
    } catch (error) {
      console.error('Failed to load supplier', error);
      navigate('/suppliers');
    }
  };

  const onSubmit = async (data: SupplierFormData) => {
    try {
      if (isEdit) {
        await supplierService.update(Number(id), data);
      } else {
        await supplierService.create(data as any);
      }
      navigate('/suppliers');
    } catch (error) {
      console.error('Failed to save supplier', error);
    }
  };

  const tabs = ['Dados Empresariais', 'Endereço & Contato', 'Observações'];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => navigate('/suppliers')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            {isEdit ? 'Editar Fornecedor' : 'Novo Fornecedor'}
          </h2>
          <p className="text-gray-500">
            {isEdit ? 'Atualize os dados do fornecedor.' : 'Cadastre um novo fornecedor no sistema.'}
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
                  <CardTitle>Identificação da Empresa</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <Input
                      label="Razão Social *"
                      error={errors.name?.message}
                      {...register('name')}
                    />
                    <Input
                      label="Nome Fantasia"
                      {...register('tradeName')}
                    />
                    <Input
                      label="CNPJ *"
                      placeholder="00.000.000/0000-00"
                      error={errors.cnpj?.message}
                      {...register('cnpj')}
                    />
                    <Input
                      label="Inscrição Estadual"
                      {...register('stateRegistration')}
                    />
                    <Select
                      label="Categoria *"
                      options={[
                        { value: 'Varejo', label: 'Varejo' },
                        { value: 'Serviços', label: 'Serviços' },
                        { value: 'Telecom', label: 'Telecom' },
                        { value: 'Bancos', label: 'Bancos' },
                        { value: 'Saúde', label: 'Saúde' },
                        { value: 'Educação', label: 'Educação' },
                        { value: 'Transporte', label: 'Transporte' },
                      ]}
                      error={errors.category?.message}
                      {...register('category')}
                    />
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
                  <CardTitle>Localização e Contato</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-6 mb-6">
                    <div className="md:col-span-3">
                      <Input
                        label="Email *"
                        type="email"
                        error={errors.email?.message}
                        {...register('email')}
                      />
                    </div>
                    <div className="md:col-span-3">
                      <Input
                        label="Telefone *"
                        placeholder="(00) 0000-0000"
                        error={errors.phone?.message}
                        {...register('phone')}
                      />
                    </div>
                    <div className="md:col-span-6">
                      <Input
                        label="Website"
                        placeholder="https://..."
                        error={errors.website?.message}
                        {...register('website')}
                      />
                    </div>
                  </div>

                  <div className="h-px bg-gray-200 my-6" />

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
                  <CardTitle>Notas e Observações</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    label="Observações Internas"
                    placeholder="Histórico, restrições ou anotações importantes sobre o fornecedor..."
                    rows={8}
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
            onClick={() => navigate('/suppliers')}
          >
            Cancelar
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            <Save className="mr-2 h-4 w-4" />
            Salvar Fornecedor
          </Button>
        </div>
      </form>
    </div>
  );
}
