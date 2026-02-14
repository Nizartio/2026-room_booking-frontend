import { useEffect, useState, useCallback } from "react";
import { fetchCustomerBookingGroups } from "../api/bookingGroupApi";
import type { BookingGroupDetail } from "../types/admin";
import toast from "react-hot-toast";
import { getApiErrorMessage } from "../api/apiClient";
import { formatDateLong } from "../utils/dateUtils";


function MyBookingsPage() {
  const [bookingGroups, setBookingGroups] = useState<BookingGroupDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);

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
      case "AllApproved":
        return "bg-green-100 text-green-700";
      case "AllRejected":
        return "bg-red-100 text-red-700";
      case "PartiallyApproved":
      case "PartiallyRejected":
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

  return (
    <div className="p-8 bg-sky-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-black">
        Peminjaman Saya
      </h1>

      {loading && <p className="text-black">Memuat peminjaman...</p>}

      {!loading && bookingGroups.length === 0 && (
        <div className="text-center py-10 text-black">
          <p className="text-lg font-medium">
            Belum ada peminjaman
          </p>
        </div>
      )}

      {!loading && bookingGroups.length > 0 && (
        <div className="space-y-4">
          {bookingGroups.map(group => (
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

                            <span className={`px-2 py-1 text-xs whitespace-nowrap rounded ${getStatusColor(booking.status)}`}>
                              {booking.status === "Approved" ? "Disetujui" : booking.status === "Rejected" ? "Ditolak" : "Menunggu"}
                            </span>
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
    </div>
  );
}

export default MyBookingsPage;
