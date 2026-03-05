import api from '../../../services/api';
import { Document, DocumentFilters } from '../types';

export const documentService = {
  getAll: async (filters?: DocumentFilters) => {
    const params = new URLSearchParams();
    if (filters?.title) params.append('title', filters.title);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.page) params.append('page', filters.page.toString());
    
    // Using mock data directly here for now as mock.ts needs update for this endpoint
    // But better to use api.get and update mock.ts
    const response = await api.get<{ data: Document[]; total: number }>(`/documents?${params.toString()}`);
    return response.data;
  },

  upload: async (file: File, metadata: any) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('metadata', JSON.stringify(metadata));
    
    const response = await api.post<Document>('/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  delete: async (id: number) => {
    await api.delete(`/documents/${id}`);
  },
};
