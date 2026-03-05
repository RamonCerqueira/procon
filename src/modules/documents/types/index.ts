export interface Document {
  id: number;
  title: string;
  type: string;
  size: string;
  category: string;
  uploadedBy: string;
  createdAt: string;
  url: string;
}

export interface DocumentFilters {
  title?: string;
  category?: string;
  page: number;
  limit: number;
}
