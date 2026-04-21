"use client";

import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

type Booking = {
  _id: string;
  room: string;
  startTime: string;
  endTime: string;
  name: string;
  telNo: string;
  amount: number;
  date: string;
  status: "active" | "completed";
};

const rooms = [
  "Cinema-01",
  "Cinema-02",
  "Cinema-03",
  "Cinema-04",
  "Cinema-05",
  "Cinema-06",
  "Cinema-07",
  "Cinema-08",
  "VIP",
];

export default function RoomStatusPage() {
  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dateText, setDateText] = useState(formatDate(new Date()));
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchBookings = async (dateValue: string) => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:5000/bookings?date=${dateValue}`);
      const data = await res.json();
      setBookings(data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings(dateText);
  }, [dateText]);

  const handleDateChange = (date: Date | null) => {
    if (!date) return;
    setSelectedDate(date);
    setDateText(formatDate(date));
  };

  const roomStatusList = rooms.map((room) => {
    const roomBookings = bookings.filter(
      (booking) => booking.room === room && booking.status !== "completed"
    );

    return {
      room,
      occupied: roomBookings.length > 0,
      bookings: roomBookings,
    };
  });

  return (
    <div style={{ padding: "20px", maxWidth: "1300px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "20px" }}>Room Status Board</h1>

      <div
        style={{
          border: "1px solid #ccc",
          borderRadius: "10px",
          padding: "20px",
          marginBottom: "20px",
        }}
      >
        <h2 style={{ marginBottom: "15px" }}>Select Date</h2>

        <DatePicker
          selected={selectedDate}
          onChange={handleDateChange}
          dateFormat="yyyy-MM-dd"
          className="custom-date-input"
        />
      </div>

      {loading ? (
        <p>Loading room status...</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "20px",
          }}
        >
          {roomStatusList.map((roomItem) => (
            <div
              key={roomItem.room}
              style={{
                border: "1px solid #ccc",
                borderRadius: "12px",
                padding: "20px",
                background: roomItem.occupied ? "#fff7f7" : "#f7fff8",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "12px",
                }}
              >
                <h2 style={{ margin: 0 }}>{roomItem.room}</h2>
                <span
                  style={{
                    padding: "6px 12px",
                    borderRadius: "20px",
                    fontSize: "12px",
                    fontWeight: 600,
                    background: roomItem.occupied ? "#ffdddd" : "#ddffdd",
                    color: roomItem.occupied ? "#b00020" : "#0a7a2f",
                  }}
                >
                  {roomItem.occupied ? "Occupied" : "Free"}
                </span>
              </div>

              {!roomItem.occupied ? (
                <p style={{ margin: 0 }}>No active bookings for this room on selected date.</p>
              ) : (
                <div style={{ display: "grid", gap: "12px" }}>
                  {roomItem.bookings.map((booking) => (
                    <div
                      key={booking._id}
                      style={{
                        border: "1px solid #e5e5e5",
                        borderRadius: "10px",
                        padding: "12px",
                        background: "white",
                      }}
                    >
                      <p style={{ margin: "0 0 6px 0" }}>
                        <strong>Customer:</strong> {booking.name}
                      </p>
                      <p style={{ margin: "0 0 6px 0" }}>
                        <strong>Tel:</strong> {booking.telNo}
                      </p>
                      <p style={{ margin: "0 0 6px 0" }}>
                        <strong>Time:</strong> {booking.startTime} - {booking.endTime}
                      </p>
                      <p style={{ margin: 0 }}>
                        <strong>Amount:</strong> Rs. {booking.amount}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .custom-date-input {
          width: 220px;
          padding: 10px;
          border: 1px solid #ccc;
          border-radius: 6px;
        }
      `}</style>
    </div>
  );
}