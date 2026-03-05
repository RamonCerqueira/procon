import api from '../../../services/api';
import { Consumer, ConsumerFilters, CreateConsumerDTO, UpdateConsumerDTO } from '../types';

export const consumerService = {
  getAll: async (filters?: ConsumerFilters) => {
    const params = new URLSearchParams();
    if (filters?.name) params.append('name', filters.name);
    if (filters?.cpf) params.append('cpf', filters.cpf);
    if (filters?.page) params.append('page', filters.page.toString());
    
    const response = await api.get<{ data: Consumer[]; total: number }>(`/consumers?${params.toString()}`);
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get<Consumer>(`/consumers/${id}`);
    return response.data;
  },

  create: async (data: CreateConsumerDTO) => {
    const response = await api.post<Consumer>('/consumers', data);
    return response.data;
  },

  update: async (id: number, data: UpdateConsumerDTO) => {
    const response = await api.put<Consumer>(`/consumers/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    await api.delete(`/consumers/${id}`);
  },
};
