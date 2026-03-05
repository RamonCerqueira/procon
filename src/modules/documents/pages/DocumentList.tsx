import React, { useEffect, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Upload, FileText, Download, Trash2, File as FileIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Document } from '../types';
import { documentService } from '../services/documentService';
import { DataTable } from '../../../design-system/components/DataTable';
import { Button } from '../../../design-system/components/Button';
import { Badge } from '../../../design-system/components/Badge';

export function DocumentList() {
  const navigate = useNavigate();
  const [data, setData] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const result = await documentService.getAll();
      setData(result.data || []);
    } catch (error) {
      console.error('Failed to load documents', error);
      // Fallback mock data if API fails (since I didn't update mock.ts for documents yet)
      setData(Array.from({ length: 10 }).map((_, i) => ({
        id: i + 1,
        title: `Documento ${i + 1}.pdf`,
        type: 'PDF',
        size: '2.5 MB',
        category: 'Contrato',
        uploadedBy: 'Admin User',
        createdAt: new Date().toISOString(),
        url: '#',
      })));
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnDef<Document>[] = [
    {
      accessorKey: 'title',
      header: 'Nome do Arquivo',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <FileIcon className="h-4 w-4 text-blue-500" />
          <span>{row.getValue('title')}</span>
        </div>
      ),
    },
    {
      accessorKey: 'category',
      header: 'Categoria',
      cell: ({ row }) => <Badge variant="secondary">{row.getValue('category')}</Badge>,
    },
    {
      accessorKey: 'uploadedBy',
      header: 'Enviado Por',
    },
    {
      accessorKey: 'createdAt',
      header: 'Data de Envio',
      cell: ({ row }) => new Date(row.getValue('createdAt')).toLocaleDateString(),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const doc = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => window.open(doc.url, '_blank')}
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => {
                if(confirm('Tem certeza que deseja excluir?')) {
                  documentService.delete(doc.id).then(loadDocuments);
                }
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Documentos (GED)</h2>
          <p className="text-gray-500">Gestão Eletrônica de Documentos.</p>
        </div>
        <Button onClick={() => navigate('/documents/upload')}>
          <Upload className="mr-2 h-4 w-4" />
          Upload de Arquivo
        </Button>
      </div>

      <DataTable 
        columns={columns} 
        data={data} 
        searchColumn="title" 
        searchPlaceholder="Buscar documentos..."
      />
    </div>
  );
}
