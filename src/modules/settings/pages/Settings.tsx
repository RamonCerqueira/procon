import React from 'react';
import { useForm } from 'react-hook-form';
import { Save, Bell, Lock, Globe } from 'lucide-react';
import { Button } from '../../../design-system/components/Button';
import { Input } from '../../../design-system/components/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../../../design-system/components/Card';
import { Checkbox } from '../../../design-system/components/Checkbox';

export function Settings() {
  const { register, handleSubmit } = useForm();

  const onSubmit = (data: any) => {
    console.log(data);
    alert('Configurações salvas com sucesso!');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">Configurações do Sistema</h2>
        <p className="text-gray-500">Personalize o comportamento da plataforma.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Geral
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="Nome da Instituição" defaultValue="PROCON João Pessoa" {...register('orgName')} />
              <Input label="Email de Contato" defaultValue="contato@procon.pb.gov.br" {...register('contactEmail')} />
              <Input label="Horário de Atendimento" defaultValue="08:00 às 17:00" {...register('workingHours')} />
              <Input label="Telefone de Suporte" defaultValue="156" {...register('supportPhone')} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notificações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Checkbox label="Enviar email ao abrir novo processo" defaultChecked {...register('notifyNewCase')} />
              <Checkbox label="Notificar fiscais sobre novas denúncias" defaultChecked {...register('notifyInspections')} />
              <Checkbox label="Alerta de prazos vencidos" defaultChecked {...register('notifyDeadlines')} />
              <Checkbox label="Relatório diário automático" {...register('dailyReport')} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Segurança
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="Expiração de Sessão (minutos)" type="number" defaultValue="30" {...register('sessionTimeout')} />
              <Input label="Tentativas de Login Máximas" type="number" defaultValue="5" {...register('maxLoginAttempts')} />
            </div>
            <Checkbox label="Exigir autenticação de dois fatores (2FA) para admins" {...register('require2FA')} />
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" size="lg">
            <Save className="mr-2 h-4 w-4" />
            Salvar Alterações
          </Button>
        </div>
      </form>
    </div>
  );
}
