


export enum LinkStatus {
  PENDING = 'PENDING',
  DONE = 'DONE',
}

export interface Link {
  id: string;
  url: string;
  title: string;
  summary: string;
  category: string;
  status: LinkStatus;
  createdAt: number;
  dueDate?: number;
  sources?: {
    uri: string;
    title: string;
  }[];
}

export type SortKey = 'createdAt' | 'title' | 'status' | 'dueDate';
export type SortDirection = 'ASC' | 'DESC';

export interface SortConfig {
  key: SortKey;
  direction: SortDirection;
}