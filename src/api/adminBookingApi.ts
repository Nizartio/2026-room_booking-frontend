import api from "./apiClient"
import type { PaginatedBookingResponse } from "../types/admin";

export const fetchPendingBookings = async () => {
  const response = await api.get(
    "/room-bookings/admin?status=Pending"
  );
  return response.data;
};


export const fetchAdminBookings = async (
  page: number,
  status?: string,
  search?: string
): Promise<PaginatedBookingResponse> => {

  let query = `?page=${page}&pageSize=10`;

  if (status) {
    query += `&status=${status}`;
  }

  if (search && search.trim() !== "") {
    query += `&search=${encodeURIComponent(search)}`;
  }

  const response = await api.get<PaginatedBookingResponse>(`/room-bookings${query}`);

  return response.data;
};

export const updateBookingStatus = async (
  id: number,
  status: "Approved" | "Rejected"
) => {
  return api.put(`/room-bookings/${id}/status`, {
    status
  });
};