import { useState, useEffect } from "react";
import { fetchRooms, fetchUnavailableDates } from "../../api/roomApi";
import type { Room } from "../../types/room";
import type { BookingGroup } from "../../types/booking";
import DatePicker from "react-datepicker";
import { format } from "date-fns";
import { generateDateRange, combineDateTime } from "../../utils/dateUtils";
import { checkConflicts } from "../../api/bookingApi";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (group: BookingGroup) => void;
};

function BookingModal({ isOpen, onClose, onAdd }: Props) {
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [startDate, endDate] = dateRange;
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [selectedRooms, setSelectedRooms] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [unavailableDates, setUnavailableDates] = useState<Date[]>([]);
  const [isCheckingConflict, setIsCheckingConflict] = useState(false);

  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);
  const [roomsError, setRoomsError] = useState<string | null>(null);

  const [conflicts, setConflicts] = useState<
    { roomId: number; startTime: string; endTime: string }[]
  >([]);
  useEffect(() => {
    if (!isOpen) return;

    const loadData = async () => {
      try {
        setIsLoadingRooms(true);
        setRoomsError(null);

        const roomsData = await fetchRooms();
        setRooms(roomsData);

        const unavailable = await fetchUnavailableDates();
        setUnavailableDates(unavailable.map(d => new Date(d)));

      } catch (error) {
        console.error(error);
        setRoomsError("Gagal memuat data.");
      } finally {
        setIsLoadingRooms(false);
      }
    };

    loadData();
  }, [isOpen]);

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

  }, [startDate, endDate, startTime, endTime, selectedRooms]);
  
  const conflictRoomIds = conflicts.map(c => c.roomId);
  useEffect(() => {
    if (conflictRoomIds.length === 0) return;

    setSelectedRooms(prev =>
      prev.filter(roomId => !conflictRoomIds.includes(roomId))
    );
  }, [conflictRoomIds]);
  

  if (!isOpen) return null;
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
      status: "draft",
      errors: []
    };


    onAdd(newGroup);
    onClose();

    // reset form
    setStartTime("");
    setEndTime("");
    setSelectedRooms([]);
  };
  const generatePayload = () => {
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
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-xl p-6">
        <h2 className="text-xl font-semibold mb-4">Tambah Peminjaman</h2>
        {/* Date Selection */}
        <div>
          <label className="block text-sm font-medium mb-1"> Pilih Rentang Tanggal:</label>
          <DatePicker
            selectsRange
            startDate={startDate}
            endDate={endDate}
            onChange={(update) => {
              setDateRange(update as [Date | null, Date | null]);
            }}
            excludeDates={unavailableDates}
            className="w-full border rounded-lg px-3 py-2"
            dateFormat="yyyy-MM-dd"
          />
        </div>
        
        {/* Time Selection*/}
        <div>
            <div className="flex mt-4 mb-1">
              <div className="w-full mx-1"> 
                <label className="block text-center font-medium mb-1">Jam Mulai:</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div className="w-full mx-1">
                <label className="block text-center font-medium mb-1">Jam Selesai:</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={e => setEndTime(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
            </div>
        </div>

        {/* Room Selection */}
        <div>
          <label className="block text-sm font-medium mb-1">Pilih Ruangan:</label>

          {isLoadingRooms && <p>Memuat ruangan...</p>}

          {roomsError && (
            <p>{roomsError}</p>
          )}

          {!isLoadingRooms && (
            <>
              <input
                type="text"
                placeholder="Cari ruangan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
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
                className="w-full border rounded-lg px-3 py-2"
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
                      disabled={conflictRoomIds.includes(room.id)}
                    >
                      {room.name} (Kap. {room.capacity})
                    </option>
                  ))}
              </select>

              <p className="text-sm text-gray-500 mt-1">
                Gunakan Ctrl / Cmd untuk pilih lebih dari satu.
              </p>
            </>
          )}
        </div>

        {/* Conflict Selection */}
        {isCheckingConflict && (
          <div>
            Mengecek ketersediaan...
          </div>
        )}

        {conflicts.length > 0 && (
        <div className="mt-4 bg-red-50 border border-red-300 text-red-700 p-3 rounded-lg">
          <p className="text-sm font-semibold mb-1">Konflik ditemukan:</p>
          {conflicts.map((c, index) => (
            <div key={index} className="text-sm">
              Room {c.roomId} bentrok pada{" "}
              {new Date(c.startTime).toLocaleDateString()} jam{" "}
              {new Date(c.startTime).toLocaleTimeString()} -{" "}
              {new Date(c.endTime).toLocaleTimeString()}
            </div>
          ))}
        </div>
      )}

        {/* Action Selection */}
        <div className="flex justify-end gap-3 mt-6">

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition"
          >
            Batal
          </button>

          <button
            onClick={handleSubmit}
            disabled={
              selectedRooms.length === 0 ||
              !startDate ||
              !endDate ||
              !startTime ||
              !endTime
            }
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 transition"
          >
            Tambahkan
          </button>

        </div>
      </div>
    </div>
  );
}

export default BookingModal;
