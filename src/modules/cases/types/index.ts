export interface Case {
  id: number;
  protocol: string;
  consumerId: number;
  consumerName: string;
  supplierId: number;
  supplierName: string;
  status: 'open' | 'in_progress' | 'waiting_supplier' | 'waiting_consumer' | 'closed' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  subject: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  assignedTo?: number; // User ID
}

export interface CaseFilters {
  protocol?: string;
  consumer?: string;
  supplier?: string;
  status?: string;
  priority?: string;
  page: number;
  limit: number;
}

export type CreateCaseDTO = Omit<Case, 'id' | 'protocol' | 'createdAt' | 'updatedAt' | 'consumerName' | 'supplierName'>;
export type UpdateCaseDTO = Partial<CreateCaseDTO>;

export interface CaseMessage {
  id: number;
  caseId: number;
  senderId: number;
  senderName: string;
  content: string;
  createdAt: string;
  isInternal: boolean;
  attachments?: string[];
}
