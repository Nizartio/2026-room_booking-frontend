import { useEffect, useState } from "react";
import {
  fetchPendingBookings,
  updateBookingStatus
} from "../api/adminBookingApi";
import type { RoomBookingResponse } from "../types/admin";
import toast from "react-hot-toast";

function AdminBookingsPage() {
  const [bookings, setBookings] =
    useState<RoomBookingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] =
    useState<number | null>(null);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const result = await fetchPendingBookings();
      setBookings(result.data || []);
    } catch (error) {
      console.error(error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleUpdateStatus = async (
    id: number,
    status: "Approved" | "Rejected"
  ) => {
    try {
      setActionLoadingId(id);

      await toast.promise(
        updateBookingStatus(id, status),
        {
          loading: `${status === "Approved" ? "Approving" : "Rejecting"} booking...`,
          success: `Booking ${status} successfully`,
          error: "Failed to update booking"
        }
      );

      // Remove from list after action
      setBookings(prev => prev.filter(b => b.id !== id));

    } catch (error) {
      console.error(error);
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">
        Admin Approval Panel
      </h1>

      {loading && <p>Loading pending bookings...</p>}

      {!loading && bookings.length === 0 && (
        <div className="text-center py-10 text-gray-500">
          <p className="text-lg font-medium">No pending bookings 🎉</p>
          <p className="text-sm">You're all caught up.</p>
        </div>
      )}

      {!loading && bookings.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Room</th>
                <th className="p-3 text-left">Customer</th>
                <th className="p-3 text-left">Start</th>
                <th className="p-3 text-left">End</th>
                <th className="p-3 text-left">Action</th>
              </tr>
            </thead>

            <tbody>
              {bookings.map(booking => (
                <tr
                  key={booking.id}
                  className={`border-t transition ${
                    actionLoadingId === booking.id
                      ? "opacity-50 pointer-events-none"
                      : ""
                  }`}
                >
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      {booking.roomName}
                      <span className="px-2 py-0.5 text-xs bg-yellow-100 text-yellow-700 rounded">
                        Pending
                      </span>
                    </div>
                  </td>
                  <td className="p-3">
                    <div>
                      <p className="font-medium">
                        {booking.customerName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {booking.customerEmail}
                      </p>
                    </div>
                  </td>
                  <td className="p-3">
                    {new Date(
                      booking.startTime
                    ).toLocaleString()}
                  </td>
                  <td className="p-3">
                    {new Date(
                      booking.endTime
                    ).toLocaleString()}
                  </td>
                  <td className="p-3 space-x-2">
                    <button
                      onClick={() =>
                        handleUpdateStatus(
                          booking.id,
                          "Approved"
                        )
                      }
                      disabled={
                        actionLoadingId === booking.id
                      }
                      className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
                    >
                      Approve
                    </button>

                    <button
                      onClick={() =>
                        handleUpdateStatus(
                          booking.id,
                          "Rejected"
                        )
                      }
                      disabled={
                        actionLoadingId === booking.id
                      }
                      className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400"
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminBookingsPage;
