import { useEffect, useState } from "react";
import { fetchCustomerBookings } from "../api/customerBookingApi";
import type { RoomBookingResponse } from "../types/admin";

import EditBookingModal from "../components/common/EditBookingModal";


const STATUS_FILTERS = ["All", "Pending", "Approved", "Rejected"] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

function MyBookingsPage() {
  const [bookings, setBookings] =
    useState<RoomBookingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("All");
    const [editingBooking, setEditingBooking] =
  useState<RoomBookingResponse | null>(null);

  const customerId = 1; // simulate login

  const loadBookings = async () => {
  try {
    setLoading(true);
    const result = await fetchCustomerBookings(
      customerId,
      statusFilter
    );
    setBookings(result.data ?? []);
  } catch (error) {
    console.error(error);
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  loadBookings();
}, [statusFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-700";
      case "Rejected":
        return "bg-red-100 text-red-700";
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">
        My Bookings
      </h1>

      {/* FILTER */}
      <div className="flex gap-3 mb-6">
        {STATUS_FILTERS.map(status => (
          <button
            key={status}
            onClick={() =>
              setStatusFilter(status)
            }
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${
              statusFilter === status
                ? "bg-blue-600 text-white"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {loading && <p>Loading bookings...</p>}

      {!loading && bookings.length === 0 && (
        <div className="text-center py-10 text-gray-500">
          <p className="text-lg font-medium">
            No bookings found
          </p>
        </div>
      )}

      {!loading && bookings.length > 0 && (
        <div className="space-y-4">
          {bookings.map(booking => (
            <div
              key={booking.id}
              className="border rounded-lg p-4 shadow-sm"
            >
              <div className="flex justify-between items-center">
                <h2 className="font-semibold">
                  {booking.roomName}
                </h2>

                <span
                  className={`px-2 py-1 text-xs rounded ${getStatusColor(
                    booking.status
                  )}`}
                >
                  {booking.status}
                </span>
              </div>

              <p className="text-sm text-gray-500 mt-2">

                {new Date(
                  booking.startTime
                ).toLocaleString()} —{" "}
                {new Date(
                  booking.endTime
                ).toLocaleString()}
              </p>
              {booking.status === "Rejected" && (
                <button
                  onClick={() => setEditingBooking(booking)}
                  className="mt-3 text-sm text-blue-600 hover:underline"
                >
                  Edit
                </button>
              )}
            </div>
          ))}
        </div>
      )}
      <EditBookingModal
        booking={editingBooking as RoomBookingResponse}
        isOpen={!!editingBooking}
        bookingId={editingBooking?.id ?? 0}
        initialStartTime={editingBooking?.startTime ?? ""}
        initialEndTime={editingBooking?.endTime ?? ""}
        onClose={() => setEditingBooking(null)}
        onSuccess={() => {
          setEditingBooking(null);
          loadBookings();
        }}
      />
    </div>
  );
}

export default MyBookingsPage;
