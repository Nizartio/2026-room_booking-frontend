import axios from "axios";
import type {
  CreateBulkRoomBookingRequest,
  CreateRoomBookingPayload,
  BulkRoomBookingResponse
} from "../types/booking";

const api = axios.create({
  baseURL: "http://localhost:5242/api",
});

export const createBulkBooking = async (
  payload: CreateBulkRoomBookingRequest
): Promise<BulkRoomBookingResponse> => {
  const response = await api.post("/room-bookings/bulk", payload);
  return response.data;
};

export const checkConflicts = async (
  payload: CreateRoomBookingPayload[]
): Promise<CreateRoomBookingPayload[]> => {
  const response = await api.post<CreateRoomBookingPayload[]>("/room-bookings/check-conflicts", payload);

  return response.data;
};

export const cancelBooking = async (id: number) => {
  await api.delete(`/room-bookings/${id}`);
};