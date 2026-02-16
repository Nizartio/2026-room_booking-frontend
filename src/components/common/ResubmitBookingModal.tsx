import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { resubmitBooking } from "../../api/customerBookingApi";
import { getApiErrorMessage } from "../../api/apiClient";
import { toDateTimeLocalString, fromDateTimeLocalString } from "../../utils/dateutils";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  bookingId: number;
  roomName: string;
  initialStartTime: string;
  initialEndTime: string;
};

function ResubmitBookingModal({
  isOpen,
  onClose,
  onSuccess,
  bookingId,
  roomName,
  initialStartTime,
  initialEndTime,
}: Props) {
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Convert ISO string to datetime-local format
      setStartTime(toDateTimeLocalString(initialStartTime));
      setEndTime(toDateTimeLocalString(initialEndTime));
    }
  }, [isOpen, initialStartTime, initialEndTime]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!startTime || !endTime) {
      toast.error("Semua field wajib diisi.");
      return;
    }

    if (new Date(endTime) <= new Date(startTime)) {
      toast.error("Waktu selesai harus lebih dari waktu mulai.");
      return;
    }

    try {
      setLoading(true);

      await resubmitBooking(
        bookingId,
        fromDateTimeLocalString(startTime),
        fromDateTimeLocalString(endTime)
      );

      toast.success("Peminjaman berhasil diajukan ulang!");
      onSuccess();
      onClose();
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "Gagal mengajukan ulang peminjaman."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md rounded-lg p-6 shadow-lg">
        <h2 className="text-lg font-semibold mb-4 text-black">
          Ajukan Ulang Peminjaman - {roomName}
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-black">
              Waktu Mulai
            </label>
            <input
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full border border-yellow-300 rounded-md px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-black">
              Waktu Selesai
            </label>
            <input
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full border border-yellow-300 rounded-md px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-md border border-yellow-300 text-sm hover:bg-sky-100 transition"
          >
            Batal
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 rounded-md bg-rose-500 text-white text-sm hover:opacity-90 disabled:bg-gray-400 transition"
          >
            {loading ? "Mengajukan..." : "Ajukan Ulang"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ResubmitBookingModal;
