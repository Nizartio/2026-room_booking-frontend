import api from "./apiClient";
import type {
  CreateBulkRoomBookingRequest,
  CreateRoomBookingPayload,
  BulkRoomBookingResponse,
  BookingConflict
} from "../types/booking";

export const createBulkBooking = async (
  payload: CreateBulkRoomBookingRequest
): Promise<BulkRoomBookingResponse> => {
  const response = await api.post("/room-bookings/bulk", payload);
  return response.data;
};

export const checkConflicts = async (
  payload: CreateRoomBookingPayload[]
): Promise<BookingConflict[]> => {
  const response = await api.post<BookingConflict[]>(
    "/room-bookings/check-conflicts",
    payload
  );

  return response.data;
};

export const cancelBooking = async (id: number) => {
  await api.delete(`/room-bookings/${id}`);
};