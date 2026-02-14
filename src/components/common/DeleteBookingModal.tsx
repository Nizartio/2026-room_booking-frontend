import { useState } from "react";
import toast from "react-hot-toast";
import { deleteBooking } from "../../api/customerBookingApi";
import { getApiErrorMessage } from "../../api/apiClient";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  bookingId: number;
  roomName: string;
};

function DeleteBookingModal({
  isOpen,
  onClose,
  onSuccess,
  bookingId,
  roomName,
}: Props) {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleDelete = async () => {
    try {
      setLoading(true);

      await deleteBooking(bookingId);

      toast.success("Peminjaman berhasil dihapus!");
      onSuccess();
      onClose();
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, "Gagal menghapus peminjaman."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md rounded-lg p-6 shadow-lg">
        <h2 className="text-lg font-semibold mb-4 text-black">
          Hapus Peminjaman
        </h2>

        <p className="text-sm text-black mb-6">
          Apakah Anda yakin ingin menghapus peminjaman <strong>{roomName}</strong>? 
          Tindakan ini tidak dapat dibatalkan.
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-md border border-yellow-300 text-sm hover:bg-sky-100 transition"
          >
            Batal
          </button>

          <button
            onClick={handleDelete}
            disabled={loading}
            className="px-4 py-2 rounded-md bg-red-600 text-white text-sm hover:opacity-90 disabled:bg-gray-400 transition"
          >
            {loading ? "Menghapus..." : "Hapus"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteBookingModal;
