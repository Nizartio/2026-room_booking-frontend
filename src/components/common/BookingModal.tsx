import { useState, useEffect, useCallback } from "react";
import { fetchRooms } from "../../api/roomApi";
import type { Room } from "../../types/room";
import type { BookingGroup } from "../../types/booking";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import { generateDateRange, combineDateTime } from "../../utils/dateUtils";
import { checkConflicts } from "../../api/bookingApi";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (group: BookingGroup) => void;
  isInline?: boolean;
};

function BookingModal({ isOpen, onClose, onAdd, isInline = false }: Props) {
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [startDate, endDate] = dateRange;
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [description, setDescription] = useState("");
  const [selectedRooms, setSelectedRooms] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCheckingConflict, setIsCheckingConflict] = useState(false);

  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);
  const [roomsError, setRoomsError] = useState<string | null>(null);

  const [conflicts, setConflicts] = useState<
    { roomId: number; date?: string; startTime?: string; endTime?: string; message: string }[]
  >([]);

  useEffect(() => {
    if (!isOpen && !isInline) {
      return;
    }

    const loadData = async () => {
      try {
        setIsLoadingRooms(true);
        setRoomsError(null);

        const roomsData = await fetchRooms();
        setRooms(roomsData);

      } catch (error) {
        console.error(error);
        setRoomsError("Gagal memload data.");
      } finally {
        setIsLoadingRooms(false);
      }
    };

    loadData();
  }, [isOpen, isInline]);

  const generatePayload = useCallback(() => {
    if (!startDate || !endDate) return [];

    const dates = generateDateRange(
      startDate.toISOString().split("T")[0],
      endDate.toISOString().split("T")[0]
    );

    const payload = [];

    for (const date of dates) {
      for (const roomId of selectedRooms) {
        payload.push({
          roomId,
          customerId: 1,
          startTime: combineDateTime(date, startTime),
          endTime: combineDateTime(date, endTime)
        });
      }
    }

    return payload;
  }, [startDate, endDate, selectedRooms, startTime, endTime]);

  useEffect(() => {
    const handler = setTimeout(async () => {
      if (
        !startDate ||
        !endDate ||
        !startTime ||
        !endTime ||
        selectedRooms.length === 0
      ) {
        setConflicts([]);
        return;
      }

      try {
        setIsCheckingConflict(true);

        const payload = generatePayload();
        const result = await checkConflicts(payload);
        
        setConflicts(result);
        
      } catch (error) {
        console.error(error);
      } finally {
        setIsCheckingConflict(false);
      }
    }, 500); // debounce 500ms

    return () => clearTimeout(handler);

  }, [startDate, endDate, startTime, endTime, selectedRooms, generatePayload]);

  const getRoomName = (roomId: number) => {
    const room = rooms.find(r => r.id === roomId);
    return room ? room.name : `Room #${roomId}`;
  };

  const handleSubmit = () => {
    if (!startDate || !endDate || !startTime || !endTime) {
      alert("Semua field harus diisi.");
      return;
    }

    if (selectedRooms.length === 0) {
      alert("Pilih minimal satu ruangan.");
      return;
    }
    if (startTime >= endTime) {
      alert("Jam selesai harus lebih lambat dari jam mulai.");
      return;
    }
    if (startDate > endDate) {
      alert("Tanggal selesai harus setelah tanggal mulai.");
      return;
    } 


    const newGroup: BookingGroup = {
      id: crypto.randomUUID(),
      startDate: format(startDate, "yyyy-MM-dd"),
      endDate: format(endDate, "yyyy-MM-dd"),
      startTime,
      endTime,
      roomIds: selectedRooms,
      description,
      status: "draft",
      errors: []
    };


    onAdd(newGroup);
    
    // Only close modal if not in inline mode
    if (!isInline) {
      onClose();
    }

    // reset form
    setStartTime("");
    setEndTime("");
    setDescription("");
    setSelectedRooms([]);
  };
  
  const formContent = (
    <>
      <h2 className="text-xl font-semibold mb-4">Tambah Peminjaman</h2>
      
      {/* Date Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Pilih Rentang Tanggal:</label>
        <DatePicker
          selectsRange
          startDate={startDate}
          endDate={endDate}
          onChange={(update) => {
            setDateRange(update as [Date | null, Date | null]);
          }}
          className="w-full border border-yellow-300 rounded-lg px-3 py-2"
          dateFormat="dd-MM-yyyy"
        />
      </div>
      
      {/* Time Selection*/}
      <div className="mb-4">
        <div className="flex gap-2">
          <div className="flex-1"> 
            <label className="block text-sm font-medium mb-1">Jam Mulai:</label>
            <input
              type="time"
              value={startTime}
              onChange={e => setStartTime(e.target.value)}
              className="w-full border border-yellow-300 rounded-lg px-3 py-2"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Jam Selesai:</label>
            <input
              type="time"
              value={endTime}
              onChange={e => setEndTime(e.target.value)}
              className="w-full border border-yellow-300 rounded-lg px-3 py-2"
            />
          </div>
        </div>
      </div>

      {/* Room Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Pilih Ruangan:</label>

        {isLoadingRooms && <p className="text-sky-600">Memuat ruangan...</p>}

        {roomsError && (
          <p className="text-red-600">{roomsError}</p>
        )}

        {!isLoadingRooms && (
          <>
            <input
              type="text"
              placeholder="Cari ruangan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-yellow-300 rounded-lg px-3 py-2 mb-2"
            />

            {/* MULTI SELECT */}
            <select
              multiple
              size={6}
              value={selectedRooms.map(String)}
              onChange={(e) => {
                const values = Array.from(
                  e.target.selectedOptions,
                  option => Number(option.value)
                );
                setSelectedRooms(values);
              }}
              className="w-full border border-yellow-300 rounded-lg px-3 py-2"
            >
              {rooms
                .filter(room =>
                  room.isActive &&
                   room.name.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map(room => (
                  <option
                    key={room.id}
                    value={room.id}
                    disabled={conflicts.some(c => c.roomId === room.id)}
                  >
                    {room.name} (Kap. {room.capacity})
                  </option>
                ))}
            </select>

            <p className="text-xs text-sky-600 mt-1">
              Gunakan Ctrl / Cmd untuk pilih lebih dari satu.
            </p>
          </>
        )}
      </div>

      {/* Description */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Tujuan (Deskripsi):</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Contoh: Rapat koordinasi tim, Acara gathering, dll"
          className="w-full border border-yellow-300 rounded-lg px-3 py-2 h-20 text-sm"
        />
      </div>

      {/* Checking Conflicts */}
      {isCheckingConflict && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-300 rounded-lg text-sm text-yellow-800">
          Mengecek ketersediaan ruangan...
        </div>
      )}

      {/* Conflicts Display */}
      {conflicts.length > 0 && (
        <div className="mb-4 bg-red-50 border border-red-300 text-red-700 p-3 rounded-lg">
          <p className="text-sm font-semibold mb-2">⚠️ Konflik ditemukan:</p>
          {conflicts.map((c, index) => (
            <div key={index} className="text-sm mb-1">
              • {getRoomName(c.roomId)}: {c.message}
            </div>
          ))}
          <p className="text-xs mt-2 text-red-600">
            Ruangan yang bentrok tidak bisa dipilih. Silakan ubah waktu atau pilih ruangan lain.
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 mt-6">
        {!isInline && (
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-yellow-300 text-black hover:bg-sky-100 transition"
          >
            Batal
          </button>
        )}

        <button
          onClick={handleSubmit}
          disabled={
            selectedRooms.length === 0 ||
            !startDate ||
            !endDate ||
            !startTime ||
            !endTime ||
            conflicts.length > 0
          }
          className="px-4 py-2 rounded-lg bg-rose-500 text-white hover:opacity-90 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
        >
          {isInline ? "Tambahkan ke Keranjang" : "Tambahkan"}
        </button>
      </div>
    </>
  );

  if (isInline) {
    return (
      <div className="bg-white rounded-xl p-6 border border-yellow-300">
        {formContent}
      </div>
    );
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-xl p-6">
        {formContent}
      </div>
    </div>
  );
}

export default BookingModal;
