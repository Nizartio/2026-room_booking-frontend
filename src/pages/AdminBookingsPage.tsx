import { useEffect, useState, useCallback } from "react";
import { fetchAdminBookingGroups } from "../api/bookingGroupApi";
import { updateBookingStatus } from "../api/adminBookingApi";
import type { BookingGroupDetail } from "../types/admin";
import toast from "react-hot-toast";
import { getApiErrorMessage } from "../api/apiClient";
import { formatDateLong } from "../utils/dateutils";

const STATUS_FILTERS = ["All", "Menunggu", "Disetujui", "Sebagian Disetujui", "Ditolak", "Sebagian Ditolak"] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

function AdminPage() {
  const [bookingGroups, setBookingGroups] = useState<BookingGroupDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [expandedGroupId, setExpandedGroupId] = useState<number | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "AllApproved":
        return "bg-green-100 text-green-700";
      case "AllRejected":
        return "bg-red-100 text-red-700";
      case "PartiallyApproved":
      case "PartiallyRejected":
      case "Pending":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-sky-100 text-sky-700";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "AllApproved":
        return "Semua Disetujui";
      case "AllRejected":
        return "Semua Ditolak";
      case "PartiallyApproved":
        return "Sebagian Disetujui";
      case "PartiallyRejected":
        return "Sebagian Ditolak";
      default:
        return "Menunggu";
    }
  };

  const getBookingStatusColor = (status: string) => {
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

      // Map Indonesian filter labels to backend enum values
      let statusParam: string | undefined;
      if (statusFilter === "Menunggu") {
        statusParam = "Pending";
      } else if (statusFilter === "Disetujui") {
        statusParam = "AllApproved";
      } else if (statusFilter === "Sebagian Disetujui") {
        statusParam = "PartiallyApproved";
      } else if (statusFilter === "Ditolak") {
        statusParam = "AllRejected";
      } else if (statusFilter === "Sebagian Ditolak") {
        statusParam = "PartiallyRejected";
      }

      const result = await fetchAdminBookingGroups(
        page,
        10,
        statusParam,
        search
      );

      setBookingGroups(result.data ?? []);
      setTotalPages(result.totalPages ?? 1);
    } catch (error: unknown) {
      console.error(error);
      toast.error(getApiErrorMessage(error, "Gagal memuat data booking."));
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, search]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const handleApprove = async (bookingId: number) => {
    try {
      await updateBookingStatus(bookingId, "Approved");
      toast.success("Booking disetujui");
      loadBookings();
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "Gagal approve booking."));
    }
  };

  const handleReject = async (bookingId: number) => {
    try {
      await updateBookingStatus(bookingId, "Rejected");
      toast.success("Booking ditolak");
      loadBookings();
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "Gagal reject booking."));
    }
  };

  return (
    <div className="p-8 bg-sky-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-black">
        Manajemen Peminjaman
      </h1>

      {/* SEARCH */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Cari berdasarkan nama atau email pelanggan..."
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          className="w-full md:w-1/3 border border-yellow-300 rounded-md px-3 py-2 text-sm bg-white text-black"
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
                ? "bg-rose-500 text-white"
                : "bg-white border border-yellow-300 text-black hover:bg-sky-100"
            }`}
          >
            {status === "All" ? "Semua" : status}
          </button>
        ))}
      </div>

      {loading && <p className="text-black">Memuat data...</p>}

      {!loading && bookingGroups.length === 0 && (
        <p className="text-black">Tidak ada peminjaman ditemukan.</p>
      )}

      {!loading && bookingGroups.length > 0 && (
        <div className="space-y-4">
          {bookingGroups.map(group => (
            <div
              key={group.id}
              className="border border-yellow-300 bg-white rounded-lg shadow-sm overflow-hidden"
            >
              {/* Group Header */}
              <div
                className="p-4 border-b border-yellow-300 cursor-pointer hover:bg-sky-50 transition"
                onClick={() => setExpandedGroupId(expandedGroupId === group.id ? null : group.id)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-sm text-rose-600 font-medium">
                      {group.customerName}
                    </p>
                    <p className="text-sm text-black mt-1">
                      <strong>{formatDateLong(group.startDate)}</strong> → <strong>{formatDateLong(group.endDate)}</strong>
                    </p>
                    <p className="text-xs text-sky-600 mt-1">
                      {group.startTime} - {group.endTime}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1.5 text-xs font-medium rounded whitespace-nowrap ${getStatusColor(group.status)}`}>
                      {getStatusLabel(group.status)}
                    </span>

                    <button className="text-2xl text-sky-600 hover:text-sky-700">
                      {expandedGroupId === group.id ? "−" : "+"}
                    </button>
                  </div>
                </div>

                {/* Summary badges */}
                <div className="flex gap-2 mt-3">
                  {group.totalRooms > 0 && (
                    <span className="bg-sky-100 text-sky-700 px-2 py-1 text-xs rounded">
                      {group.totalRooms} Ruangan
                    </span>
                  )}
                  {group.approvedCount > 0 && (
                    <span className="bg-green-100 text-green-700 px-2 py-1 text-xs rounded">
                      {group.approvedCount} Disetujui
                    </span>
                  )}
                  {group.pendingCount > 0 && (
                    <span className="bg-yellow-100 text-yellow-700 px-2 py-1 text-xs rounded">
                      {group.pendingCount} Menunggu
                    </span>
                  )}
                  {group.rejectedCount > 0 && (
                    <span className="bg-red-100 text-red-700 px-2 py-1 text-xs rounded">
                      {group.rejectedCount} Ditolak
                    </span>
                  )}
                </div>
              </div>

              {/* Expanded Content - Individual Bookings */}
              {expandedGroupId === group.id && (
                <div className="p-4 bg-sky-50 border-t border-yellow-300 space-y-3">
                  <p className="text-sm font-medium text-black mb-3">
                    Detail Peminjaman ({group.roomBookings?.length || 0}):
                  </p>

                  {group.roomBookings && group.roomBookings.length > 0 ? (
                    <div className="space-y-2">
                      {group.roomBookings.map(booking => (
                        <div
                          key={booking.id}
                          className="p-3 bg-white border border-yellow-200 rounded"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="font-medium text-black text-sm">
                                {booking.roomName}
                              </p>
                              <p className="text-xs text-sky-600 mt-1">
                                {new Date(booking.startTime).toLocaleString()} → {new Date(booking.endTime).toLocaleString()}
                              </p>
                            </div>

                            <span className={`px-2 py-1 text-xs whitespace-nowrap rounded ${getBookingStatusColor(booking.status)}`}>
                              {booking.status === "Approved" ? "Disetujui" : booking.status === "Rejected" ? "Ditolak" : "Menunggu"}
                            </span>
                          </div>

                          {/* Action Buttons */}
                          {booking.status === "Pending" && (
                            <div className="mt-3 flex gap-2">
                              <button
                                onClick={() => handleApprove(booking.id)}
                                className="px-2 py-1 text-xs bg-rose-500 text-white rounded hover:opacity-90 transition"
                              >
                                Setujui
                              </button>

                              <button
                                onClick={() => handleReject(booking.id)}
                                className="px-2 py-1 text-xs bg-black text-white rounded hover:opacity-90 transition"
                              >
                                Tolak
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-sky-600">Tidak ada ruangan dalam peminjaman ini</p>
                  )}
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
                className="px-3 py-1.5 border border-yellow-300 rounded-md text-sm disabled:opacity-50 bg-white text-black hover:bg-sky-100"
              >
                ◀ Sebelumnya
              </button>

              <span className="text-sm text-black">
                Halaman {page} dari {totalPages}
              </span>

              <button
                onClick={() =>
                  setPage(prev => Math.min(prev + 1, totalPages))
                }
                disabled={page === totalPages}
                className="px-3 py-1.5 border border-yellow-300 rounded-md text-sm disabled:opacity-50 bg-white text-black hover:bg-sky-100"
              >
                Selanjutnya ▶
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminPage;