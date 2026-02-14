import { useEffect, useState } from "react";
import type { BookingGroup, BookingConflict } from "../types/booking";
import BookingModal from "../components/common/BookingModal";
import { submitBulkBookingGroups } from "../api/bookingGroupApi";
import { fetchRooms } from "../api/roomApi";
import type { Room } from "../types/room";
import toast from "react-hot-toast";
import ConfirmModal from "../components/common/ConfirmModal";
import { useNavigate } from "react-router-dom";
import { getApiErrorMessage } from "../api/apiClient";
import { formatDateLong } from "../utils/dateUtils";

interface BookingResult {
  success: boolean;
  conflicts?: BookingConflict[];
}


function BookingPage() {
  const [bookingGroups, setBookingGroups] = useState<BookingGroup[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [isSubmittingAll, setIsSubmittingAll] = useState(false);
  const navigate = useNavigate();

  const getRoomName = (roomId: number) => {
    const room = rooms.find(r => r.id === roomId);
    return room ? room.name : `Room #${roomId}`;
  };

  const handleSubmitAll = async () => {
    if (bookingGroups.length === 0) {
      toast.error("Tidak ada peminjaman untuk diajukan.");
      return;
    }

    try {
      setIsSubmittingAll(true);

      const payload = {
        customerId: 1, // sementara hardcoded
        groups: bookingGroups.map(g => ({
          startDate: new Date(g.startDate).toISOString().split('T')[0],
          endDate: new Date(g.endDate).toISOString().split('T')[0],
          startTime: g.startTime + ":00", // Convert "HH:MM" to TimeSpan format "HH:MM:SS"
          endTime: g.endTime + ":00",     // Convert "HH:MM" to TimeSpan format "HH:MM:SS"
          roomIds: g.roomIds,
          description: g.description
        }))
      };

      const response = await submitBulkBookingGroups(payload);

      // Check for conflicts in results
      const hasConflicts = response.results.some((r: BookingResult) => !r.success);

      if (hasConflicts) {
        // Update groups with conflict information
        setBookingGroups(prev =>
          prev.map((g, idx) => {
            const result = response.results[idx];
            if (!result.success && result.conflicts) {
              return {
                ...g,
                status: "partial-error",
                conflicts: result.conflicts
              };
            }
            return { ...g, status: "pending" };
          })
        );
        toast.error("Ada konflik dalam beberapa peminjaman. Silakan periksa lagi.");
      } else {
        toast.success("Semua peminjaman berhasil diajukan!");
        setBookingGroups([]);
        navigate("/customers/my-bookings");
      }
    } catch (error: unknown) {
      console.error(error);
      toast.error(getApiErrorMessage(error, "Gagal submit booking."));
    } finally {
      setIsSubmittingAll(false);
    }
  };

  const cancelGroup = (groupId: string) => {
    setBookingGroups(prev =>
      prev.filter(g => g.id !== groupId)
    );
    toast.success("Peminjaman dihapus dari keranjang.");
  };

  useEffect(() => {
    const loadRooms = async () => {
      try {
        const data = await fetchRooms();
        setRooms(data);
      } catch (error: unknown) {
        console.error("Gagal memuat rooms", error);
        toast.error(getApiErrorMessage(error, "Gagal memuat data room."));
      }
    };

    loadRooms();
  }, []);

  return (
  <div className="min-h-screen bg-sky-50">
    <div className="flex h-screen">
      {/* Left Panel - Booking Form */}
      <div className="flex-1 overflow-y-auto border-r border-yellow-300 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-black mb-2">
            Tambah Peminjaman
          </h1>
          <p className="text-sm text-sky-600">
            Tambahkan ruangan ke keranjang, kemudian klik "Ajukan Semua" di sebelah kanan
          </p>
        </div>

        {/* Booking Modal for adding items */}
        <BookingModal
          isOpen={true}
          onClose={() => {}}
          onAdd={(group) => {
            // Check for conflicts before adding to cart
            setBookingGroups(prev => [...prev, group]);
            toast.success("Peminjaman ditambahkan ke keranjang!");
          }}
          isInline={true}
        />
      </div>

      {/* Right Panel - Shopping Cart */}
      <div className="w-96 bg-white border-l border-yellow-300 flex flex-col h-screen">
        {/* Cart Header */}
        <div className="p-6 border-b border-yellow-300 bg-sky-50">
          <h2 className="text-lg font-semibold text-black">
            Keranjang Peminjaman
          </h2>
          <p className="text-sm text-sky-600 mt-1">
            {bookingGroups.length} peminjaman
          </p>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {bookingGroups.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-center text-sky-600">
                Keranjang kosong
              </p>
            </div>
          ) : (
            bookingGroups.map((group, idx) => (
              <div
                key={group.id}
                className="border border-yellow-300 rounded-lg p-4 bg-sky-50"
              >
                {/* Group Summary */}
                <div className="mb-3">
                  <h3 className="font-semibold text-black text-sm">
                    Peminjaman {idx + 1}
                  </h3>
                  <p className="text-xs text-sky-600 mt-1">
                    {formatDateLong(group.startDate)} → {formatDateLong(group.endDate)}
                  </p>
                  <p className="text-xs text-sky-600">
                    {group.startTime} - {group.endTime}
                  </p>
                  {group.description && (
                    <p className="text-xs text-black font-medium mt-2">
                      Tujuan: {group.description}
                    </p>
                  )}
                </div>

                {/* Rooms */}
                <div className="mb-3">
                  <p className="text-xs font-medium text-black mb-1">Ruangan:</p>
                  <div className="flex flex-wrap gap-1">
                    {group.roomIds.map(id => (
                      <span
                        key={id}
                        className="bg-rose-100 text-rose-700 px-2 py-1 rounded text-xs"
                      >
                        {getRoomName(id)}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Status/Conflicts */}
                {group.conflicts && group.conflicts.length > 0 && (
                  <div className="mb-3 bg-red-50 border border-red-300 rounded p-2">
                    <p className="text-xs font-semibold text-red-700 mb-1">
                      Konflik:
                    </p>
                    {group.conflicts.map((conflict, cidx) => (
                      <p key={cidx} className="text-xs text-red-600 mb-1">
                        • {getRoomName(conflict.roomId)}: {conflict.message}
                      </p>
                    ))}
                  </div>
                )}

                {/* Delete Button */}
                <button
                  onClick={() => cancelGroup(group.id)}
                  className="w-full px-2 py-1.5 text-xs border border-red-300 text-red-600 rounded hover:bg-red-50 transition"
                >
                  Hapus
                </button>
              </div>
            ))
          )}
        </div>

        {/* Cart Footer - Submit Button */}
        <div className="p-6 border-t border-yellow-300 bg-sky-50 sticky bottom-0">
          <button
            onClick={handleSubmitAll}
            disabled={bookingGroups.length === 0 || isSubmittingAll}
            className="w-full px-4 py-3 bg-rose-500 text-white font-semibold rounded-lg hover:opacity-90 disabled:bg-gray-400 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
          >
            {isSubmittingAll && (
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
            )}
            {isSubmittingAll ? "Mengirim..." : "Ajukan Semua"}
          </button>
          <p className="text-xs text-sky-600 text-center mt-2">
            {bookingGroups.length > 0 && `${bookingGroups.length} peminjaman siap dikirim`}
          </p>
        </div>
      </div>
    </div>

    <ConfirmModal
      isOpen={confirmId !== null}
      title="Batalkan Booking?"
      message="Apakah kamu yakin ingin membatalkan booking ini?"
      onCancel={() => setConfirmId(null)}
      onConfirm={() => {
        if (confirmId) {
          cancelGroup(confirmId);
          setConfirmId(null);
        }
      }}
    />
  </div>
);
}

export default BookingPage;
