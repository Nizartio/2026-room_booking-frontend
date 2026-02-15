import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { fetchCustomerBookingGroups } from "../api/bookingGroupApi";
import type { BookingGroupDetail } from "../types/admin";
import toast from "react-hot-toast";
import { getApiErrorMessage } from "../api/apiClient";
import { formatDateLong } from "../utils/dateutils";
import ResubmitBookingModal from "../components/common/ResubmitBookingModal";
import DeleteBookingModal from "../components/common/DeleteBookingModal";

const STATUS_FILTERS = ["Semua", "Menunggu", "Disetujui", "Sebagian Disetujui", "Ditolak", "Sebagian Ditolak"] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

function MyBookingsPage() {
  const navigate = useNavigate();
  const [bookingGroups, setBookingGroups] = useState<BookingGroupDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("Semua");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [editingBooking, setEditingBooking] = useState<{
    id: number;
    roomName: string;
    startTime: string;
    endTime: string;
  } | null>(null);
  const [deletingBooking, setDeletingBooking] = useState<{
    id: number;
    roomName: string;
  } | null>(null);

  const customerId = 1; // simulate login

  const loadBookings = useCallback(async () => {
    try {
      setLoading(true);
      const result = await fetchCustomerBookingGroups(customerId);
      setBookingGroups(result);
    } catch (error: unknown) {
      console.error(error);
      toast.error(getApiErrorMessage(error, "Gagal memuat data booking."));
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
      case "AllApproved":
        return "bg-green-100 text-green-700";
      case "Rejected":
      case "AllRejected":
        return "bg-red-100 text-red-700";
      case "PartiallyApproved":
      case "PartiallyRejected":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-yellow-100 text-yellow-700";
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

  const filteredBookingGroups = useMemo(() => {
    if (statusFilter === "Semua") {
      return bookingGroups;
    }

    return bookingGroups.filter(group => {
      switch (statusFilter) {
        case "Menunggu":
          return group.status === "Pending";
        case "Disetujui":
          return group.status === "AllApproved";
        case "Sebagian Disetujui":
          return group.status === "PartiallyApproved";
        case "Ditolak":
          return group.status === "AllRejected";
        case "Sebagian Ditolak":
          return group.status === "PartiallyRejected";
        default:
          return true;
      }
    });
  }, [bookingGroups, statusFilter]);

  return (
    <div className="p-8 bg-sky-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-black">
          Peminjaman Saya
        </h1>
        <button
          onClick={() => navigate("/customers/booking")}
          className="px-4 py-2 bg-rose-500 text-white rounded-md hover:bg-rose-600 transition font-medium"
        >
          Tambah Peminjaman
        </button>
      </div>

      {/* Status Filter */}
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
            {status}
          </button>
        ))}
      </div>

      {loading && <p className="text-black">Memuat peminjaman...</p>}

      {!loading && filteredBookingGroups.length === 0 && (
        <div className="text-center py-10 text-black">
          <p className="text-lg font-medium">
            Belum ada peminjaman
          </p>
        </div>
      )}

      {!loading && filteredBookingGroups.length > 0 && (
        <div className="space-y-4">
          {filteredBookingGroups.map(group => (
            <div
              key={group.id}
              className="border border-yellow-300 bg-white rounded-lg shadow-sm overflow-hidden"
            >
              {/* Group Header */}
              <div className="p-4 border-b border-yellow-300 cursor-pointer hover:bg-sky-50 transition"
                onClick={() => setExpandedId(expandedId === group.id ? null : group.id)}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-sm text-sky-600 font-medium">
                      Grup Peminjaman #{group.id}
                    </p>
                    <p className="text-sm text-black mt-1">
                      <strong>{formatDateLong(group.startDate)}</strong> → <strong>{formatDateLong(group.endDate)}</strong>
                    </p>
                    <p className="text-xs text-sky-600 mt-1">
                      {group.startTime} - {group.endTime}
                    </p>
                    {group.description && (
                      <p className="text-sm text-black font-medium mt-2">
                        Tujuan: {group.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Status Badge */}
                    <span className={`px-3 py-1.5 text-xs font-medium rounded whitespace-nowrap ${getStatusColor(group.status)}`}>
                      {getStatusLabel(group.status)}
                    </span>

                    {/* Expand/Collapse Toggle */}
                    <button className="text-2xl text-sky-600 hover:text-sky-700">
                      {expandedId === group.id ? "−" : "+"}
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
              {expandedId === group.id && (
                <div className="p-4 bg-sky-50 border-t border-yellow-300 space-y-3">
                  <p className="text-sm font-medium text-black mb-3">
                    Peminjaman Ruangan ({group.roomBookings?.length || 0}):
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

                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 text-xs whitespace-nowrap rounded ${getStatusColor(booking.status)}`}>
                                {booking.status === "Approved" ? "Disetujui" : booking.status === "Rejected" ? "Ditolak" : "Menunggu"}
                              </span>

                              {/* Edit and Delete buttons for rejected bookings */}
                              {booking.status === "Rejected" && (
                                <div className="flex gap-2 ml-2">
                                  <button
                                    onClick={() => setEditingBooking({
                                      id: booking.id,
                                      roomName: booking.roomName,
                                      startTime: booking.startTime,
                                      endTime: booking.endTime
                                    })}
                                    className="px-3 py-1 text-xs bg-sky-500 text-white rounded hover:bg-sky-600 transition"
                                  >
                                    Ubah
                                  </button>
                                  <button
                                    onClick={() => setDeletingBooking({
                                      id: booking.id,
                                      roomName: booking.roomName
                                    })}
                                    className="px-3 py-1 text-xs bg-rose-500 text-white rounded hover:bg-rose-600 transition"
                                  >
                                    Hapus
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
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
        </div>
      )}

      {/* Resubmit Modal */}
      {editingBooking && (
        <ResubmitBookingModal
          isOpen={!!editingBooking}
          onClose={() => setEditingBooking(null)}
          bookingId={editingBooking.id}
          roomName={editingBooking.roomName}
          initialStartTime={editingBooking.startTime}
          initialEndTime={editingBooking.endTime}
          onSuccess={() => {
            setEditingBooking(null);
            loadBookings();
          }}
        />
      )}

      {/* Delete Modal */}
      {deletingBooking && (
        <DeleteBookingModal
          isOpen={!!deletingBooking}
          onClose={() => setDeletingBooking(null)}
          bookingId={deletingBooking.id}
          roomName={deletingBooking.roomName}
          onSuccess={() => {
            setDeletingBooking(null);
            loadBookings();
          }}
        />
      )}
    </div>
  );
}

export default MyBookingsPage;
