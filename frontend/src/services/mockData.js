// Realistic seed & fallback data for standalone Vercel preview & demo mode

export const mockUsers = {
  admin: {
    id: 1,
    fullName: "System Administrator",
    email: "admin@parking.com",
    phone: "+1-800-555-0100",
    role: "ADMIN",
    token: "mock-jwt-admin-smartpark-token-2026",
  },
  customer: {
    id: 2,
    fullName: "Alex Johnson",
    email: "customer@parking.com",
    phone: "+1-555-019-2834",
    role: "CUSTOMER",
    token: "mock-jwt-customer-smartpark-token-2026",
  },
};

export const mockLocations = [
  {
    id: 1,
    name: "Downtown Grand Center",
    address: "100 Financial Way, City Core",
    description: "Modern multi-level automated facility with EV charging, 24/7 CCTV, and contactless access.",
    totalFloors: 4,
    openingTime: "06:00:00",
    closingTime: "23:00:00",
    active: true,
    totalSlots: 12,
    availableSlots: 8,
    createdAt: "2026-10-01T08:00:00",
  },
  {
    id: 2,
    name: "Airport Terminal Hub",
    address: "Terminal 2 East, Airport Road",
    description: "Long-term and short-term premium parking deck with complimentary shuttle to airport departure gates.",
    totalFloors: 3,
    openingTime: "00:00:00",
    closingTime: "23:59:59",
    active: true,
    totalSlots: 8,
    availableSlots: 5,
    createdAt: "2026-10-01T08:00:00",
  },
];

export const mockSlots = [
  // Downtown Grand Center (Floor 1 - Standard & EV)
  { id: 1, locationId: 1, slotNumber: "A-101", floorNumber: 1, vehicleType: "CAR", hourlyRate: 4.50, status: "AVAILABLE" },
  { id: 2, locationId: 1, slotNumber: "A-102", floorNumber: 1, vehicleType: "CAR", hourlyRate: 4.50, status: "OCCUPIED" },
  { id: 3, locationId: 1, slotNumber: "A-103", floorNumber: 1, vehicleType: "CAR", hourlyRate: 4.50, status: "RESERVED" },
  { id: 4, locationId: 1, slotNumber: "EV-101", floorNumber: 1, vehicleType: "EV", hourlyRate: 6.00, status: "AVAILABLE" },
  { id: 5, locationId: 1, slotNumber: "EV-102", floorNumber: 1, vehicleType: "EV", hourlyRate: 6.00, status: "AVAILABLE" },
  // Downtown Grand Center (Floor 2 - SUV & Motorcycle)
  { id: 6, locationId: 1, slotNumber: "B-201", floorNumber: 2, vehicleType: "SUV", hourlyRate: 5.50, status: "AVAILABLE" },
  { id: 7, locationId: 1, slotNumber: "B-202", floorNumber: 2, vehicleType: "SUV", hourlyRate: 5.50, status: "AVAILABLE" },
  { id: 8, locationId: 1, slotNumber: "B-203", floorNumber: 2, vehicleType: "SUV", hourlyRate: 5.50, status: "OCCUPIED" },
  { id: 9, locationId: 1, slotNumber: "M-201", floorNumber: 2, vehicleType: "MOTORCYCLE", hourlyRate: 2.50, status: "AVAILABLE" },
  { id: 10, locationId: 1, slotNumber: "M-202", floorNumber: 2, vehicleType: "MOTORCYCLE", hourlyRate: 2.50, status: "AVAILABLE" },
  { id: 11, locationId: 1, slotNumber: "C-301", floorNumber: 3, vehicleType: "CAR", hourlyRate: 4.00, status: "AVAILABLE" },
  { id: 12, locationId: 1, slotNumber: "C-302", floorNumber: 3, vehicleType: "CAR", hourlyRate: 4.00, status: "AVAILABLE" },

  // Airport Terminal Hub
  { id: 13, locationId: 2, slotNumber: "AP-101", floorNumber: 1, vehicleType: "CAR", hourlyRate: 7.00, status: "AVAILABLE" },
  { id: 14, locationId: 2, slotNumber: "AP-102", floorNumber: 1, vehicleType: "CAR", hourlyRate: 7.00, status: "AVAILABLE" },
  { id: 15, locationId: 2, slotNumber: "AP-103", floorNumber: 1, vehicleType: "CAR", hourlyRate: 7.00, status: "OCCUPIED" },
  { id: 16, locationId: 2, slotNumber: "AP-104", floorNumber: 1, vehicleType: "SUV", hourlyRate: 8.50, status: "RESERVED" },
  { id: 17, locationId: 2, slotNumber: "AP-201", floorNumber: 2, vehicleType: "CAR", hourlyRate: 6.50, status: "AVAILABLE" },
  { id: 18, locationId: 2, slotNumber: "AP-202", floorNumber: 2, vehicleType: "EV", hourlyRate: 8.00, status: "AVAILABLE" },
  { id: 19, locationId: 2, slotNumber: "AP-203", floorNumber: 2, vehicleType: "MOTORCYCLE", hourlyRate: 3.50, status: "AVAILABLE" },
  { id: 20, locationId: 2, slotNumber: "AP-301", floorNumber: 3, vehicleType: "CAR", hourlyRate: 5.50, status: "OCCUPIED" },
];

export const mockVehicles = [
  {
    id: 1,
    userId: 2,
    registrationNumber: "KA-01-MJ-5021",
    vehicleType: "CAR",
    make: "Tesla",
    model: "Model 3",
    color: "Midnight Silver",
    createdAt: "2026-10-02T10:15:00",
  },
  {
    id: 2,
    userId: 2,
    registrationNumber: "DL-04-AB-9921",
    vehicleType: "SUV",
    make: "Toyota",
    model: "RAV4 Hybrid",
    color: "Pearl White",
    createdAt: "2026-10-05T14:30:00",
  },
  {
    id: 3,
    userId: 2,
    registrationNumber: "MH-02-XY-1234",
    vehicleType: "MOTORCYCLE",
    make: "Yamaha",
    model: "MT-07",
    color: "Matte Black",
    createdAt: "2026-10-08T11:00:00",
  },
];

export const mockReservations = [
  {
    id: 1,
    bookingReference: "SP-2026-8812",
    userId: 2,
    userName: "Alex Johnson",
    userEmail: "customer@parking.com",
    vehicleId: 1,
    vehicleRegistration: "KA-01-MJ-5021",
    vehicleType: "CAR",
    slotId: 3,
    slotNumber: "A-103",
    locationId: 1,
    locationName: "Downtown Grand Center",
    startTime: new Date(Date.now() - 3600000).toISOString(),
    endTime: new Date(Date.now() + 7200000).toISOString(),
    status: "ACTIVE",
    estimatedAmount: 13.50,
    finalAmount: 13.50,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 2,
    bookingReference: "SP-2026-4419",
    userId: 2,
    userName: "Alex Johnson",
    userEmail: "customer@parking.com",
    vehicleId: 2,
    vehicleRegistration: "DL-04-AB-9921",
    vehicleType: "SUV",
    slotId: 16,
    slotNumber: "AP-104",
    locationId: 2,
    locationName: "Airport Terminal Hub",
    startTime: new Date(Date.now() + 86400000).toISOString(),
    endTime: new Date(Date.now() + 97200000).toISOString(),
    status: "CONFIRMED",
    estimatedAmount: 25.50,
    finalAmount: 25.50,
    createdAt: new Date(Date.now() - 14400000).toISOString(),
  },
];

export const mockActiveSessions = [
  {
    id: 1,
    reservationId: 1,
    bookingReference: "SP-2026-8812",
    slotNumber: "A-103",
    locationName: "Downtown Grand Center",
    vehicleRegistration: "KA-01-MJ-5021",
    checkInTime: new Date(Date.now() - 2700000).toISOString(), // 45 min ago
    checkOutTime: null,
    durationMinutes: 45,
    hourlyRate: 4.50,
    totalAmount: 4.50,
    paymentStatus: "PENDING",
  },
];

export const mockPayments = [
  {
    id: 1,
    reservationId: 1,
    bookingReference: "SP-2026-3100",
    userName: "Alex Johnson",
    amount: 18.00,
    paymentMethod: "CREDIT_CARD",
    paymentStatus: "COMPLETED",
    transactionReference: "TXN-8841-A99B",
    paidAt: "2026-10-10T16:45:00",
  },
  {
    id: 2,
    reservationId: 2,
    bookingReference: "SP-2026-1192",
    userName: "Jane Smith",
    amount: 22.50,
    paymentMethod: "UPI",
    paymentStatus: "COMPLETED",
    transactionReference: "TXN-2210-C41D",
    paidAt: "2026-10-11T12:30:00",
  },
];

export const mockNotifications = [
  {
    id: 1,
    userId: 2,
    title: "Reservation Confirmed",
    message: "Your reservation SP-2026-8812 for slot A-103 is confirmed.",
    notificationType: "RESERVATION_CONFIRMED",
    isRead: false,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 2,
    userId: 2,
    title: "Vehicle Checked In",
    message: "Vehicle KA-01-MJ-5021 checked into Downtown Grand Center.",
    notificationType: "CHECK_IN",
    isRead: true,
    createdAt: new Date(Date.now() - 2700000).toISOString(),
  },
];

export const mockAdminStats = {
  totalSlots: 20,
  availableSlots: 13,
  occupiedSlots: 4,
  reservedSlots: 3,
  activeReservations: 3,
  totalRevenue: 14850.50,
  todayRevenue: 720.00,
  totalCustomers: 52,
  activeSessionsCount: 4,
};

export const mockCustomerStats = {
  activeReservations: 1,
  activeSessions: 1,
  registeredVehicles: 3,
  totalSpent: 168.00,
};

export const mockRevenueReport = [
  { date: "Oct 07", amount: 620 },
  { date: "Oct 08", amount: 780 },
  { date: "Oct 09", amount: 910 },
  { date: "Oct 10", amount: 840 },
  { date: "Oct 11", amount: 1050 },
  { date: "Oct 12", amount: 890 },
  { date: "Oct 13", amount: 720 },
];

export const mockOccupancyReport = [
  { hour: "06:00", occupied: 2, reserved: 1, available: 17 },
  { hour: "09:00", occupied: 12, reserved: 4, available: 4 },
  { hour: "12:00", occupied: 16, reserved: 3, available: 1 },
  { hour: "15:00", occupied: 14, reserved: 4, available: 2 },
  { hour: "18:00", occupied: 10, reserved: 5, available: 5 },
  { hour: "21:00", occupied: 5, reserved: 2, available: 13 },
];

export const mockAuditLogs = [
  {
    id: 1,
    adminEmail: "admin@parking.com",
    action: "CREATE",
    entityType: "PARKING_SLOT",
    entityId: 20,
    description: "Added new EV charging slot EV-102 at Downtown Grand Center",
    createdAt: "2026-10-12T09:30:00",
  },
  {
    id: 2,
    adminEmail: "admin@parking.com",
    action: "UPDATE",
    entityType: "PARKING_LOCATION",
    entityId: 1,
    description: "Updated operating hours for Downtown Grand Center",
    createdAt: "2026-10-12T14:15:00",
  },
];
