import api from "./apiClient"

export const fetchPendingBookings = async () => {
  const response = await api.get(
    "/room-bookings/admin?status=Pending"
  );
  return response.data;
};

export const updateBookingStatus = async (
  id: number,
  status: "Approved" | "Rejected"
) => {
  const response = await api.put(
    `/room-bookings/${id}/status`,
    { status }
  );
  return response.data;
};
