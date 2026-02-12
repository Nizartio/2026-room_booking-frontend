import { useEffect, useState } from "react";
import type { BookingGroup } from "../types/booking";
import BookingModal from "../components/booking/BookingModal";
import { createBulkBooking } from "../api/bookingApi";
import { generateDateRange, combineDateTime } from "../utils/dateUtils";
import { fetchRooms } from "../api/roomApi";
import type { Room } from "../types/room";
import toast from "react-hot-toast";
import ConfirmModal from "../components/common/ConfirmModal";


function BookingPage() {
  const [bookingGroups, setBookingGroups] = useState<BookingGroup[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [confirmId, setConfirmId] = useState<string | null>(null);


  const handleSubmitGroup = async (groupId: string) => {
    const group = bookingGroups.find(g => g.id === groupId);
    if (!group) return;

    try {
      // Set status submitting
      setBookingGroups(prev =>
        prev.map(g =>
          g.id === groupId ? { ...g, status: "submitting" } : g
        )
      );

      const dates = generateDateRange(group.startDate, group.endDate);

      const payload = [];

      for (const date of dates) {
        for (const roomId of group.roomIds) {
          payload.push({
            roomId,
            customerId: 1, // sementara hardcoded
            startTime: combineDateTime(date, group.startTime),
            endTime: combineDateTime(date, group.endTime)
          });
        }
      }

      const response = await createBulkBooking({ bookings: payload });

      const failed = response.results.filter(r => !r.success);

      setBookingGroups(prev =>
        prev.map(g => {
          if (g.id !== groupId) return g;

          if (failed.length === 0) {
            toast.success("Booking berhasil diajukan!");
            return { ...g, status: "pending", errors: [] };
          }

          toast.error("Beberapa booking gagal.");
          return {
            ...g,
            status: "partial-error",
            errors: failed.map(r => ({
              roomId: r.roomId,
              startTime: r.startTime,
              endTime: r.endTime,
              message: r.errorMessage ?? "Bentrok"
            }))
          };
        })
      );

    } catch (error) {
      console.error(error);
    }
  };

  const getRoomName = (roomId: number) => {
    const room = rooms.find(r => r.id === roomId);
    return room ? room.name : `Room #${roomId}`;
  };

  //Cancel booking group  
  const cancelGroup = async (groupId: string) => {
    try {
      // sementara: hapus frontend saja
      setBookingGroups(prev =>
        prev.filter(g => g.id !== groupId)
      );

      toast.success("Booking dibatalkan.");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Gagal membatalkan booking.");
    }
  };

  useEffect(() => {
    const loadRooms = async () => {
      try {
        const data = await fetchRooms();
        setRooms(data);
      } catch (error) {
        console.error("Gagal memuat rooms", error);
      }
    };

    loadRooms();
  }, []);


  return (
  <div className="min-h-screen bg-gray-50 py-10">
    <div className="max-w-5xl mx-auto px-4">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-800">
          Peminjaman Saya
        </h1>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          + Tambah Peminjaman
        </button>
      </div>

      {/* Empty State */}
      {bookingGroups.length === 0 && (
        <div className="bg-white rounded-xl shadow p-8 text-center text-gray-500">
          Belum ada peminjaman.
        </div>
      )}

      {/* Booking Cards */}
      <div className="space-y-4">
        {bookingGroups.map(group => (
          <div
            key={group.id}
            className={`bg-white rounded-xl shadow p-5 transition ${
              group.status === "pending"
                ? "opacity-80"
                : ""
            }`}
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold text-gray-800">
                  {group.startDate} - {group.endDate}
                </h3>
                <p className="text-sm text-gray-500">
                  {group.startTime} - {group.endTime}
                </p>
              </div>

              <span
                className={`text-xs px-3 py-1 rounded-full ${
                  group.status === "draft"
                    ? "bg-gray-200 text-gray-700"
                    : group.status === "pending"
                    ? "bg-yellow-200 text-yellow-800"
                    : group.status === "partial-error"
                    ? "bg-red-200 text-red-700"
                    : "bg-green-200 text-green-700"
                }`}
              >
                {group.status}
              </span>
            </div>

            {/* Room List */}
            <div className="mb-3">
              <p className="text-sm font-medium mb-1">
                Ruangan:
              </p>
              <div className="flex flex-wrap gap-2">
                {group.roomIds.map(id => (
                  <span
                    key={id}
                    className="bg-blue-100 text-blue-700 px-2 py-1 rounded-md text-xs"
                  >
                    {getRoomName(id)}
                  </span>
                ))}
              </div>
            </div>

            {/* Conflict Error */}
            {group.status === "partial-error" &&
              group.errors?.map((err, index) => (
                <div
                  key={index}
                  className="text-sm text-red-600"
                >
                  {getRoomName(err.roomId)}: {err.message}
                </div>
              ))}

            {/* Actions */}
            <div className="mt-4 flex gap-3">

              {/* Draft / Partial-error / Submitting */}
              {(group.status === "draft" ||
                group.status === "partial-error" ||
                group.status === "submitting") && (
                <>
                  <button
                    onClick={() => handleSubmitGroup(group.id)}
                    disabled={group.status === "submitting"}
                    className="px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 transition flex items-center gap-2"
                  >
                    {group.status === "submitting" && (
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                      </svg>
                    )}
                    {group.status === "submitting"
                      ? "Submitting..."
                      : "Submit"}
                  </button>

                  <button
                    onClick={() =>
                      setBookingGroups(prev =>
                        prev.filter(g => g.id !== group.id)
                      )
                    }
                    disabled={group.status === "submitting"}
                    className="px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-100 transition disabled:opacity-50"
                  >
                    Hapus
                  </button>
                </>
              )}

              {/* Pending State */}
              {group.status === "pending" && (
                <>
                  <span className="text-sm text-gray-500">
                    Menunggu persetujuan admin...
                  </span>

                  <button
                    onClick={() => setConfirmId(group.id)}
                    className="px-3 py-1.5 border border-red-300 text-red-600 rounded-md hover:bg-red-50 transition"
                  >
                    Batalkan
                  </button>
                </>
              )}

            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      <BookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={(group) =>
          setBookingGroups(prev => [...prev, group])
        }
      />
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
  </div>
);
}

export default BookingPage;
