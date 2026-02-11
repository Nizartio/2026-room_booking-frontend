export type BookingError = {
  roomId: number;
  startTime: string;
  endTime: string;
  message: string;
};

export type BookingGroupStatus =
  | "draft"
  | "submitting"
  | "pending"
  | "partial-error";

export type BookingGroup = {
  id: string;

  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;

  roomIds: number[];

  status: BookingGroupStatus;

  errors?: BookingError[];
};
export type CreateRoomBookingPayload = {
  roomId: number;
  customerId: number;
  startTime: string;
  endTime: string;
};

export type CreateBulkRoomBookingRequest = {
  bookings: CreateRoomBookingPayload[];
};

export type BulkBookingResult = {
  roomId: number;
  startTime: string;
  endTime: string;
  success: boolean;
  errorMessage?: string;
};

export type BulkRoomBookingResponse = {
  totalRequested: number;
  successCount: number;
  failedCount: number;
  results: BulkBookingResult[];
};