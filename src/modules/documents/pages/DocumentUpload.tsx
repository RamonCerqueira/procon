import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Upload, FileText, CheckCircle, X } from 'lucide-react';
import { Button } from '../../../design-system/components/Button';
import { Input } from '../../../design-system/components/Input';
import { Select } from '../../../design-system/components/Select';
import { Textarea } from '../../../design-system/components/Textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../../../design-system/components/Card';
import { useNavigate } from 'react-router-dom';

export function DocumentUpload() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const { register, handleSubmit } = useForm();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const onSubmit = (data: any) => {
    console.log({ ...data, file });
    alert('Documento enviado com sucesso!');
    navigate('/documents');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">Upload de Documento</h2>
        <p className="text-gray-500">Adicione novos arquivos ao sistema GED.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalhes do Documento</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="Título do Documento *" {...register('title')} />
              <Select
                label="Categoria *"
                options={[
                  { value: 'Contrato', label: 'Contrato' },
                  { value: 'Fatura', label: 'Fatura' },
                  { value: 'Identidade', label: 'Identidade' },
                  { value: 'Procuração', label: 'Procuração' },
                  { value: 'Outros', label: 'Outros' },
                ]}
                {...register('category')}
              />
              <Input label="Número do Processo (Opcional)" {...register('processId')} />
              <Input label="Tags (separadas por vírgula)" {...register('tags')} />
            </div>

            <Textarea 
              label="Descrição / Observações" 
              placeholder="Adicione detalhes sobre o conteúdo do documento..."
              rows={3}
              {...register('description')}
            />

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:bg-gray-50 transition-colors">
              {!file ? (
                <>
                  <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-sm text-gray-600 mb-4">
                    Arraste e solte seu arquivo aqui, ou clique para selecionar.
                  </p>
                  <label htmlFor="file-upload">
                    <Button type="button" onClick={() => document.getElementById('file-upload')?.click()}>
                      Selecionar Arquivo
                    </Button>
                    <input
                      id="file-upload"
                      type="file"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </label>
                </>
              ) : (
                <div className="flex flex-col items-center">
                  <FileText className="h-12 w-12 text-primary-600 mb-2" />
                  <p className="font-medium text-gray-900">{file.name}</p>
                  <p className="text-sm text-gray-500 mb-4">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  <Button type="button" variant="outline" size="sm" onClick={() => setFile(null)}>
                    <X className="mr-2 h-4 w-4" /> Remover
                  </Button>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={() => navigate('/documents')}>
                Cancelar
              </Button>
              <Button type="submit" disabled={!file}>
                <CheckCircle className="mr-2 h-4 w-4" /> Enviar Documento
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
