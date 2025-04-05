
import { BuyerPerformance, ProcurementRequest, User } from "@/types";

// Mock users for testing with proper UUIDs
export const mockUsers: User[] = [
  {
    id: "17c41064-d414-45cc-afed-33ec430d9485",
    name: "Admin User",
    email: "admin@example.com",
    role: "admin",
    avatar: "/placeholder.svg"
  },
  {
    id: "e8fd159b-57c4-4d36-9bd7-a59ca13057ef",
    name: "Gabriel Zau",
    email: "gabriel@example.com",
    role: "buyer",
    avatar: "/placeholder.svg"
  },
  {
    id: "1d23342a-82a3-4ac8-a73f-4c800d22b2ac",
    name: "Bernado Buela",
    email: "bernado@example.com",
    role: "buyer",
    avatar: "/placeholder.svg"
  },
  {
    id: "c4e125c3-4964-4a8b-b903-18f764b22rte",
    name: "Magreth Smith",
    email: "magreth@example.com",
    role: "buyer",
    avatar: "/placeholder.svg"
  },
  {
    id: "754e86c9-afed-45e6-bcae-f2799beb9060",
    name: "Client Company",
    email: "client@example.com",
    role: "client",
    avatar: "/placeholder.svg"
  }
];

// Mock procurement requests for testing with proper UUIDs
export const mockProcurementRequests: ProcurementRequest[] = [
  {
    id: "65a5f792-0542-4c25-a082-6d3e1ed2faa3",
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
    clientId: "754e86c9-afed-45e6-bcae-f2799beb9060",
    buyerId: "c4e125c3-4964-4a8b-b903-18f764b22rte",
    isPublic: true
  },
  {
    id: "93deec65-4f02-4d90-b815-3e9462ae73a4",
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
    clientId: "754e86c9-afed-45e6-bcae-f2799beb9060",
    buyerId: "e8fd159b-57c4-4d36-9bd7-a59ca13057ef",
    isPublic: true
  },
  {
    id: "b29a2674-89c1-4f18-b8e9-f6c0cd9b5542",
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
    clientId: "754e86c9-afed-45e6-bcae-f2799beb9060",
    buyerId: "e8fd159b-57c4-4d36-9bd7-a59ca13057ef",
    isPublic: true
  },
  {
    id: "8cf5e7da-31ab-4caa-9fc6-05e3a7be1dd9",
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
    clientId: "754e86c9-afed-45e6-bcae-f2799beb9060",
    buyerId: "1d23342a-82a3-4ac8-a73f-4c800d22b2ac",
    isPublic: false
  },
  {
    id: "42a1c93e-edfa-44f7-be6f-4b3544fd471a",
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
    clientId: "754e86c9-afed-45e6-bcae-f2799beb9060",
    buyerId: "c4e125c3-4964-4a8b-b903-18f764b22rte",
    isPublic: true
  },
  {
    id: "7f32c091-fc68-4651-8e39-c72b9df7836c",
    rfqNumber: "REQ0452188",
    poNumber: "",
    entity: "MGP Investments",
    description: "New Request for Machinery Parts",
    placeOfDelivery: "Cabinda",
    vendor: "",
    placeOfArrival: "",
    poDate: "",
    mgpEta: "",
    expDeliveryDate: "",
    dateDelivered: "",
    qtyRequested: 12,
    qtyDelivered: 0,
    qtyPending: 12,
    leadTimeDays: 0,
    daysCount: 0,
    aging: 0,
    priority: "",
    buyer: "",
    stage: "New Request",
    actionItems: "",
    responsible: "",
    dateDue: "",
    status: "pending",
    createdAt: "2024-11-28T09:15:30Z",
    updatedAt: "2024-11-28T09:15:30Z",
    clientId: "754e86c9-afed-45e6-bcae-f2799beb9060",
    isPublic: false
  }
];

// Mock buyer performance data for testing
export const mockBuyerPerformance: BuyerPerformance[] = [
  {
    buyerId: "e8fd159b-57c4-4d36-9bd7-a59ca13057ef",
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
    buyerId: "1d23342a-82a3-4ac8-a73f-4c800d22b2ac",
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
