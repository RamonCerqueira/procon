import api from '../../../services/api';
import { Supplier, SupplierFilters, CreateSupplierDTO, UpdateSupplierDTO } from '../types';

export const supplierService = {
  getAll: async (filters?: SupplierFilters) => {
    const params = new URLSearchParams();
    if (filters?.name) params.append('name', filters.name);
    if (filters?.cnpj) params.append('cnpj', filters.cnpj);
    if (filters?.page) params.append('page', filters.page.toString());
    
    const response = await api.get<{ data: Supplier[]; total: number }>(`/suppliers?${params.toString()}`);
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get<Supplier>(`/suppliers/${id}`);
    return response.data;
  },

  create: async (data: CreateSupplierDTO) => {
    const response = await api.post<Supplier>('/suppliers', data);
    return response.data;
  },

  update: async (id: number, data: UpdateSupplierDTO) => {
    const response = await api.put<Supplier>(`/suppliers/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    await api.delete(`/suppliers/${id}`);
  },
};
