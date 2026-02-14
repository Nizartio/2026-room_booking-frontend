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
};

export type PaginatedBookingResponse = {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  data: RoomBookingResponse[];
};