import api from "axios";

export const fetchCustomerBookings = async (
  customerId: number,
  status?: string
) => {
  let query = `?customerId=${customerId}`;

  if (status && status !== "All") {
    query += `&status=${status}`;
  }

  const response = await api.get(
    `/room-bookings${query}`
  );

  return response.data;
};
