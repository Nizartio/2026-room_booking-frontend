export type RoomBookingResponse = {
  id: number;
  roomId: number;
  roomName: string;

  customerId: number;
  customerName: string;
  customerEmail: string;

  startTime: string;
  endTime: string;

  status: string;
  description?: string;
};

export type BookingGroupDetail = {
  id: number;
  customerId: number;
  customerName: string;
  customerEmail: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  description?: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
  totalRooms: number;
  approvedCount: number;
  pendingCount: number;
  rejectedCount: number;
  roomBookings: RoomBookingResponse[];
};

export type PaginatedBookingGroupResponse = {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  data: BookingGroupDetail[];
};