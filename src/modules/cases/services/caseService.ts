import api from '../../../services/api';
import { Case, CaseFilters, CreateCaseDTO, UpdateCaseDTO, CaseMessage } from '../types';

export const caseService = {
  getAll: async (filters?: CaseFilters) => {
    const params = new URLSearchParams();
    if (filters?.protocol) params.append('protocol', filters.protocol);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.page) params.append('page', filters.page.toString());
    
    const response = await api.get<{ data: Case[]; total: number }>(`/cases?${params.toString()}`);
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get<Case>(`/cases/${id}`);
    return response.data;
  },

  create: async (data: CreateCaseDTO) => {
    const response = await api.post<Case>('/cases', data);
    return response.data;
  },

  update: async (id: number, data: UpdateCaseDTO) => {
    const response = await api.put<Case>(`/cases/${id}`, data);
    return response.data;
  },

  getMessages: async (id: number) => {
    const response = await api.get<CaseMessage[]>(`/cases/${id}/messages`);
    return response.data;
  },

  sendMessage: async (id: number, content: string, isInternal: boolean) => {
    const response = await api.post<CaseMessage>(`/cases/${id}/messages`, { content, isInternal });
    return response.data;
  },
};
