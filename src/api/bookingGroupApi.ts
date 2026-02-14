import apiClient from "./apiClient";
import type { CreateBulkBookingGroupRequest } from "../types/booking";
import type { BookingGroupDetail, PaginatedBookingGroupResponse } from "../types/admin";

export const submitBulkBookingGroups = async (
  request: CreateBulkBookingGroupRequest
) => {
  const response = await apiClient.post(
    "/room-bookings/groups/bulk-submit",
    request
  );
  return response.data;
};

export const fetchCustomerBookingGroups = async (customerId: number) => {
  const response = await apiClient.get<BookingGroupDetail[]>(
    `/room-bookings/groups/customer/${customerId}`
  );
  return response.data;
};

export const fetchAdminBookingGroups = async (
  page: number = 1,
  pageSize: number = 10,
  status?: string,
  search?: string
): Promise<PaginatedBookingGroupResponse> => {
  const params = new URLSearchParams();
  params.append("page", page.toString());
  params.append("pageSize", pageSize.toString());
  if (status) params.append("status", status);
  if (search) params.append("search", search);

  const response = await apiClient.get<PaginatedBookingGroupResponse>(
    `/room-bookings/groups/admin?${params.toString()}`
  );
  return response.data;
};
