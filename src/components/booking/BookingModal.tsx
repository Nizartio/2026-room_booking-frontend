import { useState } from "react";
import type { BookingGroup } from "../../types/booking";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (group: BookingGroup) => void;
};

const dummyRooms = [
  { id: 1, name: "A-301" },
  { id: 2, name: "A-302" },
  { id: 3, name: "A-303" },
  { id: 4, name: "B-201" }
];

function BookingModal({ isOpen, onClose, onAdd }: Props) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [selectedRooms, setSelectedRooms] = useState<number[]>([]);

  if (!isOpen) return null;

  const toggleRoom = (roomId: number) => {
    setSelectedRooms(prev =>
      prev.includes(roomId)
        ? prev.filter(id => id !== roomId)
        : [...prev, roomId]
    );
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

    const newGroup: BookingGroup = {
      id: crypto.randomUUID(),
      startDate,
      endDate,
      startTime,
      endTime,
      roomIds: selectedRooms,
      status: "draft",
      errors: []
    };

    onAdd(newGroup);
    onClose();

    // reset form
    setStartDate("");
    setEndDate("");
    setStartTime("");
    setEndTime("");
    setSelectedRooms([]);
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <h2>Tambah Peminjaman</h2>

        <div>
          <label>Tanggal Mulai:</label>
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
          />
        </div>

        <div>
          <label>Tanggal Selesai:</label>
          <input
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
          />
        </div>

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

        <div>
          <p>Pilih Ruangan:</p>
          {dummyRooms.map(room => (
            <label key={room.id} style={{ display: "block" }}>
              <input
                type="checkbox"
                checked={selectedRooms.includes(room.id)}
                onChange={() => toggleRoom(room.id)}
              />
              {room.name}
            </label>
          ))}
        </div>

        <div style={{ marginTop: "1rem" }}>
          <button onClick={handleSubmit}>
            Tambahkan ke Summary
          </button>

          <button
            onClick={onClose}
            style={{ marginLeft: "0.5rem" }}
          >
            Batal
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
