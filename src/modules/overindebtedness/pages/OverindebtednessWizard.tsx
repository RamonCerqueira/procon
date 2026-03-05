import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save, Plus, Trash2, Calculator, CheckCircle } from 'lucide-react';
import { Button } from '../../../design-system/components/Button';
import { Input } from '../../../design-system/components/Input';
import { Select } from '../../../design-system/components/Select';
import { Textarea } from '../../../design-system/components/Textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../../../design-system/components/Card';
import { Tabs } from '../../../design-system/components/Tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

// --- Types & Schemas ---

const debtSchema = z.object({
  creditor: z.string().min(1, 'Credor obrigatório'),
  contract: z.string().min(1, 'Contrato obrigatório'),
  value: z.number().min(0, 'Valor inválido'),
  dueDate: z.string().min(1, 'Data obrigatória'),
  type: z.string().min(1, 'Tipo obrigatório'),
});

const incomeSchema = z.object({
  source: z.string().min(1, 'Fonte obrigatória'),
  value: z.number().min(0, 'Valor inválido'),
  type: z.enum(['fixed', 'variable']),
});

const wizardSchema = z.object({
  consumerId: z.string().min(1, 'Consumidor obrigatório'),
  monthlyIncome: z.array(incomeSchema),
  livingExpenses: z.number().min(0),
  debts: z.array(debtSchema),
  notes: z.string().optional(),
});

type WizardData = z.infer<typeof wizardSchema>;

// --- Components ---

export function OverindebtednessWizard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [simulationResult, setSimulationResult] = useState<any>(null);

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<WizardData>({
    resolver: zodResolver(wizardSchema),
    defaultValues: {
      monthlyIncome: [{ source: 'Salário', value: 0, type: 'fixed' }],
      debts: [{ creditor: '', contract: '', value: 0, dueDate: '', type: 'Consumo' }],
      livingExpenses: 0,
      notes: '',
    },
  });

  const { fields: incomeFields, append: appendIncome, remove: removeIncome } = useFieldArray({
    control,
    name: 'monthlyIncome',
  });

  const { fields: debtFields, append: appendDebt, remove: removeDebt } = useFieldArray({
    control,
    name: 'debts',
  });

  const incomes = watch('monthlyIncome');
  const debts = watch('debts');
  const livingExpenses = watch('livingExpenses');

  const calculateTotalIncome = () => incomes.reduce((acc, curr) => acc + (Number(curr.value) || 0), 0);
  const calculateTotalDebt = () => debts.reduce((acc, curr) => acc + (Number(curr.value) || 0), 0);

  const simulatePlan = () => {
    const totalIncome = calculateTotalIncome();
    const availableIncome = totalIncome - (Number(livingExpenses) || 0);
    const totalDebt = calculateTotalDebt();
    
    // Simple simulation logic (Law allows retaining "Minimo Existencial")
    // Assuming 30% to 50% commitment of net income for debts
    const maxInstallment = availableIncome * 0.35;
    const minMonths = Math.ceil(totalDebt / maxInstallment);
    
    // Generate Installment Schedule
    const schedule = Array.from({ length: Math.min(minMonths, 60) }).map((_, i) => ({
      month: i + 1,
      value: maxInstallment,
      balance: Math.max(0, totalDebt - (maxInstallment * (i + 1))),
    }));

    setSimulationResult({
      totalIncome,
      livingExpenses,
      availableForDebt: maxInstallment,
      totalDebt,
      minMonths,
      schedule,
    });
    
    setActiveTab(2); // Go to results
  };

  const onSubmit = (data: WizardData) => {
    console.log('Submitting Process:', data);
    // Call API here
    navigate('/overindebtedness');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => navigate('/overindebtedness')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Novo Processo de Repactuação</h2>
          <p className="text-gray-500">Lei do Superendividamento (14.181/2021)</p>
        </div>
      </div>

      <div className="flex space-x-2 mb-6">
        {['1. Renda e Mínimo Existencial', '2. Dívidas e Credores', '3. Simulação e Plano'].map((step, idx) => (
          <div 
            key={step}
            onClick={() => setActiveTab(idx)}
            className={`flex-1 p-3 text-sm font-medium rounded-lg cursor-pointer transition-colors ${
              activeTab === idx 
                ? 'bg-primary-600 text-white' 
                : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {step}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {activeTab === 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Análise Financeira</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Select
                  label="Consumidor"
                  options={[
                    { value: '1', label: 'Consumidor 1' },
                    { value: '2', label: 'Consumidor 2' },
                  ]}
                  {...register('consumerId')}
                />
                <Input
                  label="Despesas Básicas Mensais (Mínimo Existencial)"
                  type="number"
                  {...register('livingExpenses', { valueAsNumber: true })}
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Fontes de Renda</h3>
                  <Button type="button" size="sm" onClick={() => appendIncome({ source: '', value: 0, type: 'fixed' })}>
                    <Plus className="h-4 w-4 mr-2" /> Adicionar Renda
                  </Button>
                </div>
                {incomeFields.map((field, index) => (
                  <div key={field.id} className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                      <div className="md:col-span-5">
                        <Input
                          label="Fonte"
                          {...register(`monthlyIncome.${index}.source` as const)}
                          className="bg-white"
                        />
                      </div>
                      <div className="md:col-span-3">
                        <Input
                          label="Valor (R$)"
                          type="number"
                          {...register(`monthlyIncome.${index}.value` as const, { valueAsNumber: true })}
                          className="bg-white"
                        />
                      </div>
                      <div className="md:col-span-3">
                        <Select
                          label="Tipo"
                          options={[
                            { value: 'fixed', label: 'Fixa' },
                            { value: 'variable', label: 'Variável' },
                          ]}
                          {...register(`monthlyIncome.${index}.type` as const)}
                          className="bg-white"
                        />
                      </div>
                      <div className="md:col-span-1 flex items-end justify-end md:justify-center pb-1">
                        <Button 
                          type="button" 
                          variant="ghost" 
                          className="text-red-500 hover:bg-red-50 hover:text-red-700"
                          onClick={() => removeIncome(index)}
                          title="Remover renda"
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="text-right font-bold text-lg text-green-600">
                  Total Renda: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(calculateTotalIncome())}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <Textarea 
                  label="Relato da Causa do Superendividamento" 
                  placeholder="Descreva os motivos que levaram ao superendividamento (desemprego, doença, redução de renda, etc.)"
                  rows={4}
                  {...register('notes')}
                />
              </div>

              <div className="flex justify-end pt-4">
                <Button type="button" onClick={() => setActiveTab(1)}>
                  Próximo: Dívidas
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Relação de Dívidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Credores e Contratos</h3>
                  <Button type="button" size="sm" onClick={() => appendDebt({ creditor: '', contract: '', value: 0, dueDate: '', type: 'Consumo' })}>
                    <Plus className="h-4 w-4 mr-2" /> Adicionar Dívida
                  </Button>
                </div>
                {debtFields.map((field, index) => (
                  <div key={field.id} className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-200 relative group">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                      <div className="md:col-span-4">
                        <Input
                          label="Credor"
                          {...register(`debts.${index}.creditor` as const)}
                          className="bg-white"
                        />
                      </div>
                      <div className="md:col-span-3">
                        <Input
                          label="Contrato"
                          {...register(`debts.${index}.contract` as const)}
                          className="bg-white"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Input
                          label="Valor (R$)"
                          type="number"
                          {...register(`debts.${index}.value` as const, { valueAsNumber: true })}
                          className="bg-white"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Input
                          label="Vencimento"
                          type="date"
                          {...register(`debts.${index}.dueDate` as const)}
                          className="bg-white"
                        />
                      </div>
                      <div className="md:col-span-1 flex items-end justify-end md:justify-center pb-1">
                        <Button 
                          type="button" 
                          variant="ghost" 
                          className="text-red-500 hover:bg-red-50 hover:text-red-700"
                          onClick={() => removeDebt(index)}
                          title="Remover dívida"
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="text-right font-bold text-lg text-red-600">
                  Total Dívida: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(calculateTotalDebt())}
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button type="button" variant="outline" onClick={() => setActiveTab(0)}>
                  Voltar
                </Button>
                <Button type="button" onClick={simulatePlan}>
                  <Calculator className="mr-2 h-4 w-4" />
                  Gerar Simulação
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 2 && simulationResult && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-gray-500">Renda Mensal</p>
                  <p className="text-2xl font-bold text-green-600">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(simulationResult.totalIncome)}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-gray-500">Mínimo Existencial (Preservado)</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(simulationResult.livingExpenses)}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-gray-500">Disponível para Pagamento</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(simulationResult.availableForDebt)}
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Plano de Pagamento Sugerido (Máx. 5 anos)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full mb-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={simulationResult.schedule}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="month" label={{ value: 'Mês', position: 'insideBottom', offset: -5 }} />
                      <YAxis label={{ value: 'Saldo Devedor (R$)', angle: -90, position: 'insideLeft' }} />
                      <Tooltip formatter={(value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value))} />
                      <Bar dataKey="balance" fill="#8884d8" name="Saldo Devedor" />
                      <ReferenceLine y={0} stroke="#000" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-6">
                  <h4 className="font-semibold text-blue-800 mb-2">Proposta de Repactuação</h4>
                  <p className="text-blue-700">
                    Com base na Lei 14.181/2021, sugere-se um plano de pagamento em <strong>{simulationResult.minMonths} parcelas</strong> de 
                    <strong> {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(simulationResult.availableForDebt)}</strong>, 
                    preservando o mínimo existencial do consumidor.
                  </p>
                </div>

                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={() => setActiveTab(1)}>
                    Revisar Dívidas
                  </Button>
                  <Button type="submit" className="bg-green-600 hover:bg-green-700">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Confirmar e Gerar Processo
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </form>
    </div>
  );
}
