
// Note: this file should be replaced with real API calls to Supabase
// It's only used for demo purposes

import { BuyerPerformance, ProcurementRequest, RequestItem, User, UserRole } from "@/types";

// Sample users
export const mockUsers: User[] = [
  {
    id: "admin1",
    name: "Admin User",
    email: "admin@example.com",
    role: "admin",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin"
  },
  {
    id: "buyer1",
    name: "Gabriel Procurement",
    email: "gabriel@example.com",
    role: "buyer",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=buyer1"
  },
  {
    id: "buyer2",
    name: "Sara Logistics",
    email: "sara@example.com",
    role: "buyer",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=buyer2"
  },
  {
    id: "client1",
    name: "Client Account",
    email: "client@example.com",
    role: "client",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=client1"
  }
];

// Sample procurement requests
export const mockProcurementRequests: ProcurementRequest[] = [
  {
    id: "req1",
    rfqNumber: "RFQ-2023-001",
    poNumber: "PO-001",
    entity: "MGP Investments",
    description: "Office equipment procurement",
    vendor: "OfficeMax",
    placeOfDelivery: "New York Headquarters",
    placeOfArrival: "New York Port",
    poDate: "2023-12-15",
    mgpEta: "2024-01-15",
    expDeliveryDate: "2024-01-20",
    dateDelivered: "2024-01-22",
    leadTimeDays: 30,
    daysCount: 38,
    aging: 8,
    priority: "Medium",
    buyer: "Gabriel Procurement",
    stage: "Delivered",
    actionItems: "Final inspection needed",
    responsible: "QA Team",
    dateDue: "2024-01-25",
    status: "completed",
    createdAt: "2023-12-10T10:00:00Z",
    updatedAt: "2024-01-22T15:30:00Z",
    clientId: "client1",
    buyerId: "buyer1",
    isPublic: true,
    items: [
      {
        id: "item1-1",
        itemNumber: "SKU-001",
        description: "Office desks",
        qtyRequested: 10,
        qtyDelivered: 10,
        qtyPending: 0,
        line: 1
      },
      {
        id: "item1-2",
        itemNumber: "SKU-002",
        description: "Office chairs",
        qtyRequested: 20,
        qtyDelivered: 20,
        qtyPending: 0,
        line: 2
      }
    ],
    qtyRequested: 30,
    qtyDelivered: 30,
    qtyPending: 0
  },
  {
    id: "req2",
    rfqNumber: "RFQ-2023-002",
    poNumber: "PO-002",
    entity: "MGP Investments",
    description: "IT hardware procurement",
    vendor: "TechSupplies Inc.",
    placeOfDelivery: "Los Angeles Office",
    placeOfArrival: "Los Angeles Port",
    poDate: "2023-12-20",
    mgpEta: "2024-02-10",
    expDeliveryDate: "2024-02-15",
    leadTimeDays: 45,
    daysCount: 25,
    aging: 0,
    priority: "High",
    buyer: "Sara Logistics",
    stage: "Logistics",
    actionItems: "Customs clearance in progress",
    responsible: "Logistics Team",
    dateDue: "2024-02-05",
    status: "accepted",
    createdAt: "2023-12-15T09:00:00Z",
    updatedAt: "2024-01-20T11:45:00Z",
    clientId: "client1",
    buyerId: "buyer2",
    isPublic: true,
    items: [
      {
        id: "item2-1",
        itemNumber: "IT-001",
        description: "Laptops",
        qtyRequested: 15,
        qtyDelivered: 0,
        qtyPending: 15,
        line: 1
      },
      {
        id: "item2-2",
        itemNumber: "IT-002",
        description: "Monitors",
        qtyRequested: 15,
        qtyDelivered: 0,
        qtyPending: 15,
        line: 2
      }
    ],
    qtyRequested: 30,
    qtyDelivered: 0,
    qtyPending: 30
  },
  {
    id: "req3",
    rfqNumber: "RFQ-2023-003",
    poNumber: "PO-003",
    entity: "MGP Investments",
    description: "Office supplies quarterly order",
    vendor: "SupplyCo",
    placeOfDelivery: "Chicago Office",
    placeOfArrival: "Chicago Distribution Center",
    poDate: "2023-12-25",
    mgpEta: "2024-01-25",
    expDeliveryDate: "2024-01-30",
    leadTimeDays: 25,
    daysCount: 15,
    aging: 0,
    priority: "Low",
    buyer: "Gabriel Procurement",
    stage: "Customs",
    actionItems: "Documentation review",
    responsible: "Documentation Team",
    dateDue: "2024-01-20",
    status: "accepted",
    createdAt: "2023-12-20T14:00:00Z",
    updatedAt: "2024-01-15T09:30:00Z",
    clientId: "client1",
    buyerId: "buyer1",
    isPublic: true,
    items: [
      {
        id: "item3-1",
        itemNumber: "SUP-001",
        description: "Paper supplies",
        qtyRequested: 100,
        qtyDelivered: 0,
        qtyPending: 100,
        line: 1
      }
    ],
    qtyRequested: 100,
    qtyDelivered: 0,
    qtyPending: 100
  },
  {
    id: "req4",
    rfqNumber: "RFQ-2023-004",
    poNumber: "PO-004",
    entity: "MGP Investments",
    description: "Server equipment",
    vendor: "ServerTech Solutions",
    placeOfDelivery: "Data Center",
    placeOfArrival: "Miami Port",
    poDate: "2024-01-05",
    mgpEta: "2024-02-20",
    expDeliveryDate: "2024-02-25",
    leadTimeDays: 40,
    daysCount: 10,
    aging: 0,
    priority: "Critical",
    buyer: "Sara Logistics",
    stage: "CO/CE",
    actionItems: "Technical review",
    responsible: "IT Team",
    dateDue: "2024-02-10",
    status: "accepted",
    createdAt: "2024-01-01T11:00:00Z",
    updatedAt: "2024-01-10T16:15:00Z",
    clientId: "client1",
    buyerId: "buyer2",
    isPublic: false,
    items: [
      {
        id: "item4-1",
        itemNumber: "SRV-001",
        description: "Server racks",
        qtyRequested: 5,
        qtyDelivered: 0,
        qtyPending: 5,
        line: 1
      },
      {
        id: "item4-2",
        itemNumber: "SRV-002",
        description: "Network switches",
        qtyRequested: 10,
        qtyDelivered: 0,
        qtyPending: 10,
        line: 2
      },
      {
        id: "item4-3",
        itemNumber: "SRV-003",
        description: "UPS systems",
        qtyRequested: 5,
        qtyDelivered: 0,
        qtyPending: 5,
        line: 3
      }
    ],
    qtyRequested: 20,
    qtyDelivered: 0,
    qtyPending: 20
  },
  {
    id: "req5",
    rfqNumber: "RFQ-2023-005",
    poNumber: "PO-005",
    entity: "MGP Investments",
    description: "Marketing materials for Q1 campaign",
    vendor: "PrintPro Graphics",
    placeOfDelivery: "Marketing Department",
    placeOfArrival: "Dallas Distribution Center",
    poDate: "2024-01-10",
    mgpEta: "2024-01-25",
    expDeliveryDate: "2024-01-30",
    leadTimeDays: 15,
    daysCount: 5,
    aging: 0,
    priority: "Medium",
    buyer: "Gabriel Procurement",
    stage: "Resourcing",
    actionItems: "Design approval",
    responsible: "Marketing Team",
    dateDue: "2024-01-15",
    status: "accepted",
    createdAt: "2024-01-05T13:30:00Z",
    updatedAt: "2024-01-12T10:00:00Z",
    clientId: "client1",
    buyerId: "buyer1",
    isPublic: true,
    items: [
      {
        id: "item5-1",
        itemNumber: "MKT-001",
        description: "Brochures",
        qtyRequested: 1000,
        qtyDelivered: 0,
        qtyPending: 1000,
        line: 1
      },
      {
        id: "item5-2",
        itemNumber: "MKT-002",
        description: "Posters",
        qtyRequested: 50,
        qtyDelivered: 0,
        qtyPending: 50,
        line: 2
      }
    ],
    qtyRequested: 1050,
    qtyDelivered: 0,
    qtyPending: 1050
  },
  {
    id: "req6",
    rfqNumber: "RFQ-2023-006",
    poNumber: "",
    entity: "MGP Investments",
    description: "Office furniture for new branch",
    placeOfDelivery: "Boston Branch",
    qtyRequested: 25,
    qtyDelivered: 0,
    qtyPending: 25,
    stage: "New Request",
    status: "pending",
    createdAt: "2024-01-15T15:45:00Z",
    updatedAt: "2024-01-15T15:45:00Z",
    clientId: "client1",
    isPublic: false,
    items: [
      {
        id: "item6-1",
        description: "Executive desks",
        qtyRequested: 5,
        qtyDelivered: 0,
        qtyPending: 5,
        line: 1
      },
      {
        id: "item6-2",
        description: "Conference table",
        qtyRequested: 1,
        qtyDelivered: 0,
        qtyPending: 1,
        line: 2
      },
      {
        id: "item6-3",
        description: "Office chairs",
        qtyRequested: 20,
        qtyDelivered: 0,
        qtyPending: 20,
        line: 3
      }
    ]
  }
];

export const mockBuyerPerformance: BuyerPerformance[] = [
  {
    buyerId: "buyer1",
    buyerName: "Gabriel Procurement",
    totalLines: 120,
    pendingLines: 30,
    deliveredOnTime: 80,
    deliveredLate: 10,
    deliveredTotal: 90,
    linesPartiallyDelivered: 20,
    deliveredOnTimePercentage: 88.9,
    totalDeliveredPercentage: 75,
    period: "quarterly"
  },
  {
    buyerId: "buyer2",
    buyerName: "Sara Logistics",
    totalLines: 90,
    pendingLines: 25,
    deliveredOnTime: 55,
    deliveredLate: 10,
    deliveredTotal: 65,
    linesPartiallyDelivered: 15,
    deliveredOnTimePercentage: 84.6,
    totalDeliveredPercentage: 72.2,
    period: "quarterly"
  }
];

// Sample dashboard statistics
export const mockDashboardStats = {
  totalRequests: 125,
  pendingRequests: 20,
  completedRequests: 95,
  onTimeDelivery: 85,
  lateDelivery: 10,
  priorityItems: 15
};
