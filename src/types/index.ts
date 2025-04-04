
export type UserRole = 'admin' | 'buyer' | 'client';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export type RequestStatus = 'pending' | 'accepted' | 'declined' | 'completed';

export type ProcurementStage = 
  | 'New Request' 
  | 'Resourcing' 
  | 'CO/CE' 
  | 'Customs' 
  | 'Logistics' 
  | 'Delivered';

export interface RequestFile {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: string;
  isPublic: boolean;
}

export interface RequestItem {
  id: string;
  itemNumber?: string;
  description: string;
  qtyRequested: number;
  qtyDelivered: number;
  qtyPending: number;
  line: number;
}

export interface ProcurementRequest {
  id: string;
  rfqNumber: string;
  poNumber: string;
  entity: string;
  description: string;
  vendor?: string;
  placeOfDelivery: string;
  placeOfArrival?: string;
  poDate?: string;
  mgpEta?: string;
  expDeliveryDate?: string;
  dateDelivered?: string;
  leadTimeDays?: number;
  daysCount?: number;
  aging?: number;
  priority?: string;
  buyer?: string;
  stage: ProcurementStage;
  actionItems?: string;
  responsible?: string;
  dateDue?: string;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
  clientId: string;
  buyerId?: string;
  isPublic: boolean;
  files?: RequestFile[];
  items: RequestItem[];
  // These fields are calculated from items but we need them in the type
  qtyRequested?: number;
  qtyDelivered?: number;
  qtyPending?: number;
}

export type PerformancePeriod = 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export interface BuyerPerformance {
  buyerId: string;
  buyerName: string;
  totalLines: number;
  pendingLines: number;
  deliveredOnTime: number;
  deliveredLate: number;
  deliveredTotal: number;
  linesPartiallyDelivered: number;
  deliveredOnTimePercentage: number;
  totalDeliveredPercentage: number;
  period: PerformancePeriod;
}

export interface DashboardStats {
  totalRequests: number;
  pendingRequests: number;
  completedRequests: number;
  onTimeDelivery: number;
  lateDelivery: number;
  priorityItems: number;
}
