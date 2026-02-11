import { useState } from "react";
import type { BookingGroup, BulkBookingResult } from "../types/booking";
import BookingModal from "../components/booking/BookingModal";
import { createBulkBooking } from "../api/bookingApi";
import { generateDateRange, combineDateTime } from "../utils/dateutils";

function BookingPage() {
  const [bookingGroups, setBookingGroups] = useState<BookingGroup[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const removeGroup = (id: string) => {
    setBookingGroups(prev => prev.filter(g => g.id !== id));
  };
  const submitGroup = async (groupId: string) => {
  const group = bookingGroups.find(g => g.id === groupId);
  if (!group) return;

  // update status ke submitting
  setBookingGroups(prev =>
    prev.map(g =>
      g.id === groupId ? { ...g, status: "submitting" } : g
    )
  );

  const dates = generateDateRange(group.startDate, group.endDate);

  const bookingsPayload = [];

  for (const date of dates) {
    for (const roomId of group.roomIds) {
      bookingsPayload.push({
        roomId,
        customerId: 1, // sementara hardcode
        startTime: combineDateTime(date, group.startTime),
        endTime: combineDateTime(date, group.endTime)
      });
    }
  }

  try {
    const data = await createBulkBooking({
      bookings: bookingsPayload
    });

    const failed = data.results.filter(r => !r.success);

    setBookingGroups(prev =>
      prev.map(g => {
        if (g.id !== groupId) return g;

        if (failed.length === 0) {
          return { ...g, status: "pending", errors: [] };
        }

        return {
          ...g,
          status: "partial-error",
          errors: failed.map((r: BulkBookingResult) => ({
            roomId: r.roomId,
            startTime: r.startTime,
            endTime: r.endTime,
            message: r.errorMessage ?? "Unknown error"
          }))
        };
      })
    );

  } catch (error) {
    console.error("Bulk booking error:", error);

    setBookingGroups(prev =>
      prev.map(g =>
        g.id === groupId
          ? { ...g, status: "draft" }
          : g
      )
    );
  }
};

  return (
      <div style={{ padding: "2rem" }}>
        <h1>Peminjaman Saya</h1>

        <button onClick={() => setIsModalOpen(true)}>
          + Tambah Peminjaman
        </button>

        <hr style={{ margin: "1rem 0" }} />

        {bookingGroups.length === 0 && (
          <p>Belum ada peminjaman.</p>
        )}

        {bookingGroups.map(group => (
          <div
            key={group.id}
            style={{
              border: "1px solid #ccc",
              padding: "1rem",
              marginBottom: "1rem"
            }}
          >
            <h3>Group ID: {group.id}</h3>

            <p>
              Tanggal: {group.startDate} - {group.endDate}
            </p>

            <p>
              Jam: {group.startTime} - {group.endTime}
            </p>

            <p>Ruangan:</p>
            <ul>
              {group.roomIds.map(id => (
                <li key={id}>Room #{id}</li>
              ))}
            </ul>

            <p>Status: {group.status}</p>

            {group.status === "draft" && (
              <>
                <button style={{ marginRight: "0.5rem" }} onClick={() => submitGroup(group.id)}>
                  Submit
                </button>

                <button onClick={() => removeGroup(group.id)}>
                  Hapus
                </button>
              </>
            )}

            {group.status === "partial-error" &&
              group.errors?.map((err, index) => (
                <div
                  key={index}
                  style={{ color: "red", fontSize: "0.9rem" }}
                >
                  Room {err.roomId} : {err.message}
                </div>
              ))}
          </div>
        ))}

        {/* 🔥 Modal HARUS di dalam return */}
        <BookingModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAdd={(group) =>
            setBookingGroups(prev => [...prev, group])
          }
        />
      </div>
    );
}

export default BookingPage;
