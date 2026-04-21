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
};

type Expense = {
  _id: string;
  date: string;
  category: string;
  description: string;
  amount: number;
};

type DailyBalanceData = {
  date: string;
  openingCash: number;
  cinemaIncome: number;
  foodIncome: number;
  otherIncome: number;
  totalIncome: number;
  totalExpenses: number;
  dayEndCashBalance: number;
  bookings: Booking[];
  expenses: Expense[];
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

export default function DashboardPage() {
  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<DailyBalanceData | null>(null);

  const [form, setForm] = useState({
    date: formatDate(new Date()),
    openingCash: "0",
  });

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const query = new URLSearchParams({
        date: form.date,
        openingCash: form.openingCash || "0",
        foodIncome: "0",
        otherIncome: "0",
      });

      const res = await fetch(
        `http://localhost:5000/daily-balance?${query.toString()}`
      );
      const result = await res.json();

      if (!res.ok) {
        alert(result.message || "Failed to fetch dashboard data");
        return;
      }

      setData(result);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleDateChange = (date: Date | null) => {
    if (!date) return;

    setSelectedDate(date);
    setForm((prev) => ({
      ...prev,
      date: formatDate(date),
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleLoadDashboard = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDashboardData();
  };

  const roomSummary = rooms.map((room) => {
    const roomBookings =
      data?.bookings.filter((booking) => booking.room === room) || [];

    return {
      room,
      count: roomBookings.length,
      total: roomBookings.reduce((sum, booking) => sum + booking.amount, 0),
    };
  });

  return (
    <div style={{ padding: "20px", maxWidth: "1300px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "20px" }}>Dashboard</h1>

      <form
        onSubmit={handleLoadDashboard}
        style={{
          border: "1px solid #ccc",
          borderRadius: "10px",
          padding: "20px",
          marginBottom: "20px",
        }}
      >
        <h2 style={{ marginBottom: "15px" }}>Dashboard Filters</h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "12px",
            marginBottom: "15px",
          }}
        >
          <div>
            <label>Date</label>
            <br />
            <DatePicker
              selected={selectedDate}
              onChange={handleDateChange}
              dateFormat="yyyy-MM-dd"
              className="custom-date-input"
            />
          </div>

          <div>
            <label>Opening Cash</label>
            <br />
            <input
              type="number"
              name="openingCash"
              value={form.openingCash}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>
        </div>

        <button
          type="submit"
          style={{
            padding: "10px 20px",
            backgroundColor: "black",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Load Dashboard
        </button>
      </form>

      {loading ? (
        <p>Loading dashboard...</p>
      ) : data ? (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "15px",
              marginBottom: "25px",
            }}
          >
            <SummaryCard title="Total Bookings" value={data.bookings.length} />
            <SummaryCard title="Cinema Income" value={data.cinemaIncome} />
            <SummaryCard title="Total Expenses" value={data.totalExpenses} />
            <SummaryCard
              title="Day End Cash Balance"
              value={data.dayEndCashBalance}
            />
          </div>

          <div
            style={{
              border: "1px solid #ccc",
              borderRadius: "10px",
              padding: "20px",
            }}
          >
            <h2 style={{ marginBottom: "15px" }}>Room Summary</h2>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f3f3f3" }}>
                    <th style={thStyle}>Room</th>
                    <th style={thStyle}>Booking Count</th>
                    <th style={thStyle}>Total Income</th>
                  </tr>
                </thead>
                <tbody>
                  {roomSummary.map((item) => (
                    <tr key={item.room}>
                      <td style={tdStyle}>{item.room}</td>
                      <td style={tdStyle}>{item.count}</td>
                      <td style={tdStyle}>Rs. {item.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <style jsx>{`
            .custom-date-input {
              width: 100%;
              padding: 10px;
              border: 1px solid #ccc;
              border-radius: 6px;
            }
          `}</style>
        </>
      ) : (
        <p>No dashboard data found.</p>
      )}
    </div>
  );
}

function SummaryCard({
  title,
  value,
}: {
  title: string;
  value: number;
}) {
  return (
    <div
      style={{
        border: "1px solid #ccc",
        borderRadius: "10px",
        padding: "16px",
        background: "#fafafa",
      }}
    >
      <p style={{ margin: 0, fontSize: "14px", color: "#555" }}>{title}</p>
      <h3 style={{ margin: "8px 0 0 0" }}>{value}</h3>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px",
  border: "1px solid #ccc",
  borderRadius: "6px",
};

const thStyle: React.CSSProperties = {
  border: "1px solid #ccc",
  padding: "10px",
  textAlign: "left",
};

const tdStyle: React.CSSProperties = {
  border: "1px solid #ccc",
  padding: "10px",
};