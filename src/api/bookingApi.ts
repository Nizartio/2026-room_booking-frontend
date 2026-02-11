import axios from "axios";
import type {
  CreateBulkRoomBookingRequest,
  BulkRoomBookingResponse
} from "../types/booking";

const api = axios.create({
  baseURL: "http://localhost:5242/api",
});

export const createBulkBooking = async (
  payload: CreateBulkRoomBookingRequest
): Promise<BulkRoomBookingResponse> => {
  const response = await api.post<BulkRoomBookingResponse>(
    "/room-bookings/bulk",
    payload
  );

  return response.data;
};
