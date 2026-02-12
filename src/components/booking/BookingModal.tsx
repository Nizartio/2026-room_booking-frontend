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
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <h2>Tambah Peminjaman</h2>

        {/* Date Selection */}
        <div>
          <label>Pilih Rentang Tanggal:</label>
          <DatePicker
            selectsRange
            startDate={startDate}
            endDate={endDate}
            onChange={(update) => {
              setDateRange(update as [Date | null, Date | null]);
            }}
            excludeDates={unavailableDates}
            dateFormat="yyyy-MM-dd"
          />
        </div>
        
        {/* Time Selection*/}
        <div>
          <label>Jam Mulai:</label>
          <input
            type="time"
            value={startTime}
            onChange={e => setStartTime(e.target.value)}
          />
        </div>

        <div>
          <label>Jam Selesai:</label>
          <input
            type="time"
            value={endTime}
            onChange={e => setEndTime(e.target.value)}
          />
        </div>

        {/* Room Selection */}
        <div style={{ marginTop: "1rem" }}>
          <label>Pilih Ruangan:</label>

          {isLoadingRooms && <p>Memuat ruangan...</p>}

          {roomsError && (
            <p style={{ color: "red" }}>{roomsError}</p>
          )}

          {!isLoadingRooms && (
            <>
              <input
                type="text"
                placeholder="Cari ruangan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: "100%",
                  marginTop: "0.5rem",
                  marginBottom: "0.5rem",
                  padding: "0.5rem"
                }}
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
                style={{ width: "100%" }}
              >
                {rooms
                  .filter(room =>
                    room.isActive &&
                    room.name
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase())
                  )
                  .map(room => (
                    <option
                      key={room.id}
                      value={room.id}
                      disabled={conflictRoomIds.includes(room.id)}
                      style={
                        conflictRoomIds.includes(room.id)
                          ? { backgroundColor: "#ffd6d6", color: "red" }
                          : {}
                      }
                    >
                      {room.name} (Kap. {room.capacity})
                    </option>
                  ))}
              </select>

              <small>
                Gunakan Ctrl / Cmd untuk pilih lebih dari satu.
              </small>
            </>
          )}
        </div>

        {/* Conflict Selection */}
        {isCheckingConflict && (
          <div style={{ marginTop: "0.5rem", color: "blue" }}>
            Mengecek ketersediaan...
          </div>
        )}

        {conflicts.length > 0 && (
        <div
          style={{
            marginTop: "1rem",
            padding: "0.75rem",
            background: "#ffe5e5",
            border: "1px solid red",
            borderRadius: "6px"
          }}
        >
          <strong>Konflik ditemukan:</strong>
          {conflicts.map((c, index) => (
            <div key={index}>
              Room {c.roomId} bentrok pada{" "}
              {new Date(c.startTime).toLocaleDateString()} jam{" "}
              {new Date(c.startTime).toLocaleTimeString()} -{" "}
              {new Date(c.endTime).toLocaleTimeString()}
            </div>
          ))}
        </div>
      )}

        {/* Action Selection */}
        <div style={{ marginTop: "1rem" }}>
          <button 
            onClick={handleSubmit}
            disabled={conflicts.length > 0}
          >
            Tambahkan ke Summary
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
          >
            Tambahkan ke Summary
          </button>
        </div>
      </div>
    </div>
  );
}

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center"
};

const modalStyle: React.CSSProperties = {
  background: "white",
  padding: "2rem",
  borderRadius: "8px",
  width: "400px"
};

export default BookingModal;
