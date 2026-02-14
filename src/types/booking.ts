export type BookingError = {
  roomId: number;
  startTime: string;
  endTime: string;
  message: string;
};

export type BookingConflict = {
  roomId: number;
  date?: string;
  startTime?: string;
  endTime?: string;
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
  description?: string;

  status: BookingGroupStatus;

  errors?: BookingError[];
  conflicts?: BookingConflict[];
};

export type CreateBookingGroupItemPayload = {
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  roomIds: number[];
  description?: string;
};

export type CreateBulkBookingGroupRequest = {
  customerId: number;
  groups: CreateBookingGroupItemPayload[];
};

export type CreateRoomBookingPayload = {
  roomId: number;
  customerId: number;
  startTime: string;
  endTime: string;
  description?: string;
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