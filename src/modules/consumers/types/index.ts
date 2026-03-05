export interface Consumer {
  id: number;
  name: string;
  cpf: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  status: 'active' | 'inactive' | 'blocked';
  createdAt: string;
}

export interface ConsumerFilters {
  name?: string;
  cpf?: string;
  email?: string;
  status?: string;
  page: number;
  limit: number;
}

export type CreateConsumerDTO = Omit<Consumer, 'id' | 'createdAt'>;
export type UpdateConsumerDTO = Partial<CreateConsumerDTO>;
