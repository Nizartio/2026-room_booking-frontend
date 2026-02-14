import { useEffect, useState, useCallback } from "react";
import { fetchAdminBookings } from "../api/adminBookingApi";
import { updateBookingStatus } from "../api/adminBookingApi";
import type { RoomBookingResponse } from "../types/admin";
import toast from "react-hot-toast";

const STATUS_FILTERS = ["All", "Pending", "Approved", "Rejected"] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

function AdminPage() {
  const [bookings, setBookings] = useState<RoomBookingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("All");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [totalPages, setTotalPages] = useState(1);

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
  
  const loadBookings = useCallback(async () => {
    try {
      setLoading(true);

      const result = await fetchAdminBookings(
        page,
        statusFilter === "All" ? undefined : statusFilter, search
      );

      setBookings(result.data ?? []);
      setTotalPages(result.totalPages ?? 1);
    } catch (error) {
      console.error(error);
      toast.error("Gagal memuat data booking.");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, search]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const handleApprove = async (id: number) => {
    try {
      await updateBookingStatus(id, "Approved");
      toast.success("Booking Approved");
      loadBookings();
    } catch {
      toast.error("Gagal approve booking.");
    }
  };

  const handleReject = async (id: number) => {
    try {
      await updateBookingStatus(id, "Rejected");
      toast.success("Booking Rejected");
      loadBookings();
    } catch {
      toast.error("Gagal reject booking.");
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">
        Admin Booking Management
      </h1>

      {/* SEARCH */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by customer name or email..."
          value={search}
          onChange={(e) => {
            setPage(1); // reset page saat search
            setSearch(e.target.value);
          }}
          className="w-full md:w-1/3 border rounded-md px-3 py-2 text-sm"
        />
      </div>
      {/* FILTER */}
      <div className="flex gap-3 mb-6">
        {STATUS_FILTERS.map(status => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
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

      {loading && <p>Loading...</p>}

      {!loading && bookings.length === 0 && (
        <p>No bookings found.</p>
      )}

      {!loading && bookings.length > 0 && (
        <div className="space-y-4">
          {bookings.map(booking => (
            <div
              key={booking.id}
              className="border rounded-lg p-4 shadow-sm"
            >
              <div className="flex flex-col justify-between">
                <div className="flex justify-between items-center">
                  <h2 className="font-semibold">
                    {booking.roomName}
                  </h2>
                  <span className={`px-2 py-1 text-xs rounded ${getStatusColor(booking.status)}`}>
                    {booking.status}
                  </span>
                </div>
                  <p className="text-sm text-gray-500">
                    {booking.customerName}
                  </p>
              </div>

              <p className="text-sm mt-2">
                {new Date(booking.startTime).toLocaleString()} —
                {new Date(booking.endTime).toLocaleString()}
              </p>

              {booking.status === "Pending" && (
                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => handleApprove(booking.id)}
                    className="px-3 py-1.5 bg-green-600 text-white rounded-md"
                  >
                    Approve
                  </button>

                  <button
                    onClick={() => handleReject(booking.id)}
                    className="px-3 py-1.5 bg-red-600 text-white rounded-md"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
            
          ))}
          {/* Pagination Control */}
          {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-8">

            <button
              onClick={() => setPage(prev => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="px-3 py-1.5 border rounded-md text-sm disabled:opacity-50"
            >
              ◀ Previous
            </button>

            <span className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </span>

            <button
              onClick={() =>
                setPage(prev => Math.min(prev + 1, totalPages))
              }
              disabled={page === totalPages}
              className="px-3 py-1.5 border rounded-md text-sm disabled:opacity-50"
            >
              Next ▶
            </button>

          </div>
        )}
        </div>
        
      )}
    </div>
  );
}

export default AdminPage;