import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import type { RoomBookingResponse } from "../../types/admin";
import { updateBooking } from "../../api/customerBookingApi";
import { getApiErrorMessage } from "../../api/apiClient";

type Props = {
  booking: RoomBookingResponse | null;
  isOpen: boolean;
  bookingId: number;
  initialStartTime: string;
  initialEndTime: string;
  onClose: () => void;
  onSuccess: () => void;
};

function EditBookingModal({ booking, isOpen, onClose, onSuccess }: Props) {
    const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (booking) {
      setStartTime(booking.startTime.slice(0, 16));
      setEndTime(booking.endTime.slice(0, 16));
    }
  }, [booking]);
  if (!isOpen || !booking) return null;
  
  const handleSubmit = async () => {
    if (!startTime || !endTime) {
      toast.error("Semua field wajib diisi.");
      return;
    }

    if (new Date(endTime) <= new Date(startTime)) {
      toast.error("End time harus lebih dari start time.");
      return;
    }

    try {
      setLoading(true);

      await updateBooking(booking.id, {
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString()
      });

      toast.success("Booking berhasil diperbarui!");
      onSuccess();
      onClose();
      
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "Gagal update booking."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md rounded-lg p-6 shadow-lg">

        <h2 className="text-lg font-semibold mb-4">
          Edit Booking - {booking.roomName}
        </h2>

        <div className="space-y-4">

          <div>
            <label className="block text-sm font-medium mb-1">
              Start Time
            </label>
            <input
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full border rounded-md px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              End Time
            </label>
            <input
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full border rounded-md px-3 py-2 text-sm"
            />
          </div>

        </div>

        <div className="flex justify-end gap-3 mt-6">

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md border text-sm hover:bg-gray-100"
            disabled={loading}
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? "Updating..." : "Save Changes"}
          </button>

        </div>
      </div>
    </div>
  );
}

export default EditBookingModal;
