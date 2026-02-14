import api from "./apiClient";
import type { RoomBookingResponse } from "../types/admin";

export type PaginatedBookingResponse = {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  data: RoomBookingResponse[];
};

export const fetchCustomerBookings = async (
  customerId: number,
  status?: string
): Promise<PaginatedBookingResponse> => {
  let query = `?customerId=${customerId}`;

  if (status && status !== "All") {
    query += `&status=${status}`;
  }

  const response = await api.get<PaginatedBookingResponse>(
    `/room-bookings${query}`
  );

  return response.data;
};

export const updateBooking = async (
  id: number,
  payload: {
    startTime: string;
    endTime: string;
  }
) => {
  return api.put(`/room-bookings/${id}`, payload);
};

export const resubmitBooking = async (
  id: number,
  startTime: string,
  endTime: string
) => {
  const response = await api.put(
    `/room-bookings/${id}/resubmit`,
    { startTime, endTime }
  );
  return response.data;
};
