
import { BuyerPerformance, ProcurementRequest, User } from "@/types";

// Mock users for testing
export const mockUsers: User[] = [
  {
    id: "user1",
    name: "Admin User",
    email: "admin@example.com",
    role: "admin",
    avatar: "/placeholder.svg"
  },
  {
    id: "user2",
    name: "Gabriel Zau",
    email: "gabriel@example.com",
    role: "buyer",
    avatar: "/placeholder.svg"
  },
  {
    id: "user3",
    name: "Bernado Buela",
    email: "bernado@example.com",
    role: "buyer",
    avatar: "/placeholder.svg"
  },
  {
    id: "user4",
    name: "Magreth Smith",
    email: "magreth@example.com",
    role: "buyer",
    avatar: "/placeholder.svg"
  },
  {
    id: "user5",
    name: "Client Company",
    email: "client@example.com",
    role: "client",
    avatar: "/placeholder.svg"
  }
];

// Mock procurement requests for testing
export const mockProcurementRequests: ProcurementRequest[] = [
  {
    id: "req1",
    rfqNumber: "REQ0450107",
    poNumber: "61109771",
    entity: "MGP Investments",
    description: "Industrial Equipment Components",
    vendor: "Supplier",
    placeOfDelivery: "Cabinda",
    placeOfArrival: "",
    poDate: "2024-11-26",
    mgpEta: "",
    expDeliveryDate: "2025-01-03",
    dateDelivered: "",
    qtyRequested: 1,
    qtyDelivered: 0,
    qtyPending: 1,
    leadTimeDays: 38,
    daysCount: 91,
    aging: -45660,
    priority: "Over",
    buyer: "Magreth",
    stage: "Resourcing",
    actionItems: "Supplier to send revised proforma for payment",
    responsible: "Magreth",
    dateDue: "",
    status: "accepted",
    createdAt: "2024-11-20T10:15:30Z",
    updatedAt: "2024-11-26T14:20:45Z",
    clientId: "user5",
    buyerId: "user4",
    isPublic: true
  },
  {
    id: "req2",
    rfqNumber: "",
    poNumber: "61100606",
    entity: "MGP Investments",
    description: "Manufacturing Tools",
    vendor: "Supplier",
    placeOfDelivery: "Cabinda",
    placeOfArrival: "",
    poDate: "2024-11-12",
    mgpEta: "2024-11-27",
    expDeliveryDate: "2024-12-12",
    dateDelivered: "",
    qtyRequested: 54,
    qtyDelivered: 0,
    qtyPending: 54,
    leadTimeDays: 30,
    daysCount: 113,
    aging: -45638,
    priority: "Over",
    buyer: "Muanda",
    stage: "CO/CE",
    actionItems: "Price change request",
    responsible: "Zau",
    dateDue: "",
    status: "accepted",
    createdAt: "2024-11-10T08:25:15Z",
    updatedAt: "2024-11-12T16:40:22Z",
    clientId: "user5",
    buyerId: "user2",
    isPublic: true
  },
  {
    id: "req3",
    rfqNumber: "",
    poNumber: "61104646",
    entity: "MGP Investments",
    description: "Technical Equipment",
    vendor: "Supplier",
    placeOfDelivery: "Cabinda",
    placeOfArrival: "",
    poDate: "2024-11-18",
    mgpEta: "",
    expDeliveryDate: "2024-11-27",
    dateDelivered: "2024-11-25",
    qtyRequested: 8,
    qtyDelivered: 8,
    qtyPending: 0,
    leadTimeDays: 9,
    daysCount: 128,
    aging: -2,
    priority: "Over",
    buyer: "Zau",
    stage: "Delivered",
    actionItems: "",
    responsible: "",
    dateDue: "",
    status: "completed",
    createdAt: "2024-11-15T09:12:45Z",
    updatedAt: "2024-11-25T11:30:15Z",
    clientId: "user5",
    buyerId: "user2",
    isPublic: true
  },
  {
    id: "req4",
    rfqNumber: "",
    poNumber: "61105101",
    entity: "MGP Investments",
    description: "Office Supplies",
    vendor: "Supplier",
    placeOfDelivery: "Cabinda",
    placeOfArrival: "",
    poDate: "2024-11-19",
    mgpEta: "2024-12-09",
    expDeliveryDate: "2025-02-28",
    dateDelivered: "",
    qtyRequested: 5,
    qtyDelivered: 0,
    qtyPending: 5,
    leadTimeDays: 101,
    daysCount: 35,
    aging: -45716,
    priority: "Over",
    buyer: "Selma",
    stage: "Resourcing",
    actionItems: "Requested for discount",
    responsible: "",
    dateDue: "",
    status: "accepted",
    createdAt: "2024-11-17T14:25:30Z",
    updatedAt: "2024-11-19T10:15:45Z",
    clientId: "user5",
    buyerId: "user3",
    isPublic: false
  },
  {
    id: "req5",
    rfqNumber: "",
    poNumber: "61098351",
    entity: "MGP Investments",
    description: "Electronic Components",
    vendor: "Supplier",
    placeOfDelivery: "Cabinda",
    placeOfArrival: "",
    poDate: "2024-11-07",
    mgpEta: "2024-12-09",
    expDeliveryDate: "2025-02-13",
    dateDelivered: "",
    qtyRequested: 2,
    qtyDelivered: 0,
    qtyPending: 2,
    leadTimeDays: 98,
    daysCount: 50,
    aging: -45701,
    priority: "Over",
    buyer: "Rencia",
    stage: "Customs",
    actionItems: "",
    responsible: "",
    dateDue: "",
    status: "accepted",
    createdAt: "2024-11-05T11:45:20Z",
    updatedAt: "2024-11-07T16:30:40Z",
    clientId: "user5",
    buyerId: "user4",
    isPublic: true
  },
  {
    id: "req6",
    rfqNumber: "REQ0452188",
    poNumber: "",
    entity: "MGP Investments",
    description: "New Request for Machinery Parts",
    placeOfDelivery: "Cabinda",
    qtyRequested: 12,
    qtyDelivered: 0,
    qtyPending: 12,
    stage: "New Request",
    status: "pending",
    createdAt: "2024-11-28T09:15:30Z",
    updatedAt: "2024-11-28T09:15:30Z",
    clientId: "user5",
    isPublic: false
  }
];

// Mock buyer performance data for testing
export const mockBuyerPerformance: BuyerPerformance[] = [
  {
    buyerId: "user2",
    buyerName: "Gabriel Zau",
    totalLines: 26,
    pendingLines: 6,
    deliveredOnTime: 19,
    deliveredLate: 1,
    deliveredTotal: 20,
    linesPartiallyDelivered: 0,
    deliveredOnTimePercentage: 95,
    totalDeliveredPercentage: 77,
    period: "Quarter 4"
  },
  {
    buyerId: "user3",
    buyerName: "Bernado Buela",
    totalLines: 46,
    pendingLines: 23,
    deliveredOnTime: 23,
    deliveredLate: 0,
    deliveredTotal: 23,
    linesPartiallyDelivered: 1,
    deliveredOnTimePercentage: 100,
    totalDeliveredPercentage: 50,
    period: "Quarter 4"
  }
];

// Mock dashboard statistics
export const getMockDashboardStats = (userId?: string): any => {
  if (userId) {
    const userRequests = mockProcurementRequests.filter(r => r.buyerId === userId || r.clientId === userId);
    return {
      totalRequests: userRequests.length,
      pendingRequests: userRequests.filter(r => r.status === 'pending' || (r.status === 'accepted' && r.stage !== 'Delivered')).length,
      completedRequests: userRequests.filter(r => r.stage === 'Delivered').length,
      onTimeDelivery: userRequests.filter(r => r.stage === 'Delivered' && new Date(r.dateDelivered!) <= new Date(r.expDeliveryDate!)).length,
      lateDelivery: userRequests.filter(r => r.stage === 'Delivered' && new Date(r.dateDelivered!) > new Date(r.expDeliveryDate!)).length,
      priorityItems: userRequests.filter(r => r.priority === 'Over').length,
      stageDistribution: {
        "New Request": userRequests.filter(r => r.stage === 'New Request').length,
        "Resourcing": userRequests.filter(r => r.stage === 'Resourcing').length,
        "CO/CE": userRequests.filter(r => r.stage === 'CO/CE').length,
        "Customs": userRequests.filter(r => r.stage === 'Customs').length,
        "Logistics": userRequests.filter(r => r.stage === 'Logistics').length,
        "Delivered": userRequests.filter(r => r.stage === 'Delivered').length,
      },
      byPriority: {
        "Over": userRequests.filter(r => r.priority === 'Over').length,
        "Normal": userRequests.filter(r => r.priority !== 'Over').length,
      }
    };
  }

  return {
    totalRequests: mockProcurementRequests.length,
    pendingRequests: mockProcurementRequests.filter(r => r.status === 'pending' || (r.status === 'accepted' && r.stage !== 'Delivered')).length,
    completedRequests: mockProcurementRequests.filter(r => r.stage === 'Delivered').length,
    onTimeDelivery: mockProcurementRequests.filter(r => r.stage === 'Delivered' && new Date(r.dateDelivered!) <= new Date(r.expDeliveryDate!)).length,
    lateDelivery: mockProcurementRequests.filter(r => r.stage === 'Delivered' && new Date(r.dateDelivered!) > new Date(r.expDeliveryDate!)).length,
    priorityItems: mockProcurementRequests.filter(r => r.priority === 'Over').length,
    stageDistribution: {
      "New Request": mockProcurementRequests.filter(r => r.stage === 'New Request').length,
      "Resourcing": mockProcurementRequests.filter(r => r.stage === 'Resourcing').length,
      "CO/CE": mockProcurementRequests.filter(r => r.stage === 'CO/CE').length,
      "Customs": mockProcurementRequests.filter(r => r.stage === 'Customs').length,
      "Logistics": mockProcurementRequests.filter(r => r.stage === 'Logistics').length,
      "Delivered": mockProcurementRequests.filter(r => r.stage === 'Delivered').length,
    },
    byPriority: {
      "Over": mockProcurementRequests.filter(r => r.priority === 'Over').length,
      "Normal": mockProcurementRequests.filter(r => r.priority !== 'Over').length,
    }
  };
};
