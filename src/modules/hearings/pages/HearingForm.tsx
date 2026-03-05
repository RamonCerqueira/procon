import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Tab } from '@headlessui/react';
import { Button } from '../../../design-system/components/Button';
import { Input } from '../../../design-system/components/Input';
import { Select } from '../../../design-system/components/Select';
import { Textarea } from '../../../design-system/components/Textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../../../design-system/components/Card';
import { cn } from '../../../utils/cn';

const hearingSchema = z.object({
  protocol: z.string().min(1, 'Protocolo é obrigatório'),
  type: z.string().min(1, 'Tipo de audiência é obrigatório'),
  date: z.string().min(1, 'Data é obrigatória'),
  time: z.string().min(1, 'Horário é obrigatório'),
  room: z.string().min(1, 'Sala é obrigatória'),
  mediator: z.string().min(1, 'Conciliador é obrigatório'),
  status: z.string(),
  notes: z.string().optional(),
});

type HearingFormData = z.infer<typeof hearingSchema>;

export function HearingForm() {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState(0);
  
  const { 
    register, 
    handleSubmit,
    formState: { errors, isSubmitting } 
  } = useForm<HearingFormData>({
    resolver: zodResolver(hearingSchema),
    defaultValues: {
      status: 'agendada'
    }
  });

  const onSubmit = (data: HearingFormData) => {
    console.log(data);
    alert('Audiência agendada com sucesso!');
    navigate('/hearings');
  };

  const tabs = ['Dados do Agendamento', 'Local e Responsável', 'Observações'];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => navigate('/hearings')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Agendar Audiência</h2>
          <p className="text-gray-500">Registre uma nova audiência de conciliação.</p>
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
                  <CardTitle>Dados Gerais</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input 
                      label="Protocolo do Processo *" 
                      placeholder="Ex: 2024.03.001"
                      error={errors.protocol?.message}
                      {...register('protocol')} 
                    />
                    <Select
                      label="Tipo de Audiência *"
                      options={[
                        { value: 'conciliacao', label: 'Conciliação' },
                        { value: 'instrucao', label: 'Instrução e Julgamento' },
                        { value: 'mediacao', label: 'Mediação' },
                      ]}
                      error={errors.type?.message}
                      {...register('type')}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input 
                      label="Data *" 
                      type="date" 
                      error={errors.date?.message}
                      {...register('date')} 
                    />
                    <Input 
                      label="Horário *" 
                      type="time" 
                      error={errors.time?.message}
                      {...register('time')} 
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <Select
                      label="Status Inicial"
                      options={[
                        { value: 'agendada', label: 'Agendada' },
                        { value: 'confirmada', label: 'Confirmada' },
                        { value: 'aguardando', label: 'Aguardando Confirmação' },
                      ]}
                      {...register('status')}
                    />
                  </div>
                </CardContent>
              </Card>
            </Tab.Panel>

            <Tab.Panel>
              <Card>
                <CardHeader>
                  <CardTitle>Local e Responsável</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Select
                      label="Sala / Modalidade *"
                      options={[
                        { value: 'virtual', label: 'Virtual (Videoconferência)' },
                        { value: 'sala1', label: 'Sala 01 - Térreo' },
                        { value: 'sala2', label: 'Sala 02 - Térreo' },
                        { value: 'sala3', label: 'Sala 03 - 1º Andar' },
                      ]}
                      error={errors.room?.message}
                      {...register('room')}
                    />
                    <Input 
                      label="Conciliador(a) Responsável *" 
                      placeholder="Nome do servidor"
                      error={errors.mediator?.message}
                      {...register('mediator')} 
                    />
                  </div>
                </CardContent>
              </Card>
            </Tab.Panel>

            <Tab.Panel>
              <Card>
                <CardHeader>
                  <CardTitle>Observações</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea 
                    label="Anotações Internas" 
                    placeholder="Detalhes adicionais sobre a audiência..."
                    rows={6}
                    {...register('notes')} 
                  />
                </CardContent>
              </Card>
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>

        <div className="flex justify-end pt-4 border-t">
          <Button type="button" variant="outline" className="mr-4" onClick={() => navigate('/hearings')}>
             Cancelar
          </Button>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700" isLoading={isSubmitting}>
            <Save className="mr-2 h-4 w-4" />
            Confirmar Agendamento
          </Button>
        </div>
      </form>
    </div>
  );
}
