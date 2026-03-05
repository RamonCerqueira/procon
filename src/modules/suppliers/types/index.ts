export interface Supplier {
  id: number;
  name: string;
  cnpj: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  status: 'active' | 'inactive' | 'blocked';
  category: string;
}

export interface SupplierFilters {
  name?: string;
  cnpj?: string;
  category?: string;
  page: number;
  limit: number;
}

export type CreateSupplierDTO = Omit<Supplier, 'id'>;
export type UpdateSupplierDTO = Partial<CreateSupplierDTO>;
