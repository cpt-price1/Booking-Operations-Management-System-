"use client";

import { useEffect, useMemo, useState } from "react";
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
  paymentMethod?: string;
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

const API_BASE_URL = "http://localhost:5000";

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

export default function DailyBalancePage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [form, setForm] = useState({
    date: formatDate(new Date()),
    openingCash: "0",
    foodIncome: "0",
    otherIncome: "0",
    emailTo: "",
  });

  const [data, setData] = useState<DailyBalanceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [finalizedReport, setFinalizedReport] = useState<DailyBalanceData | null>(
    null
  );

  const fetchDailyBalance = async () => {
    try {
      setLoading(true);

      const query = new URLSearchParams({
        date: form.date,
        openingCash: form.openingCash || "0",
        foodIncome: form.foodIncome || "0",
        otherIncome: form.otherIncome || "0",
      });

      const res = await fetch(
        `${API_BASE_URL}/daily-balance?${query.toString()}`
      );
      const result = await res.json();

      if (!res.ok) {
        alert(result.message || "Failed to fetch daily balance");
        return;
      }

      setData(result);
    } catch (error) {
      console.error("Error fetching daily balance:", error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDailyBalance();
  }, []);

  const handleDateChange = (date: Date | null) => {
    if (!date) return;

    setSelectedDate(date);
    setForm((prev) => ({
      ...prev,
      date: formatDate(date),
    }));
    setFinalizedReport(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFinalizedReport(null);
    await fetchDailyBalance();
  };

  const handleFinalizeDay = async () => {
    try {
      setFinalizing(true);

      const res = await fetch(`${API_BASE_URL}/finalize-day`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: form.date,
          openingCash: Number(form.openingCash || 0),
          foodIncome: Number(form.foodIncome || 0),
          otherIncome: Number(form.otherIncome || 0),
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        alert(result.message || "Failed to finalize day");
        return;
      }

      setFinalizedReport(result.report);
      await fetchDailyBalance();
      alert("Day finalized successfully");
    } catch (error) {
      console.error("Error finalizing day:", error);
      alert("Something went wrong");
    } finally {
      setFinalizing(false);
    }
  };

  const handleSendEmail = async () => {
    try {
      if (!form.emailTo.trim()) {
        alert("Please enter recipient email");
        return;
      }

      const reportToSend = finalizedReport || data;

      if (!reportToSend) {
        alert("No report data found");
        return;
      }

      setSendingEmail(true);

      const res = await fetch(`${API_BASE_URL}/send-finalized-report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: form.emailTo,
          date: reportToSend.date,
          openingCash: reportToSend.openingCash,
          cinemaIncome: reportToSend.cinemaIncome,
          foodIncome: reportToSend.foodIncome,
          otherIncome: reportToSend.otherIncome,
          totalIncome: reportToSend.totalIncome,
          totalExpenses: reportToSend.totalExpenses,
          dayEndCashBalance: reportToSend.dayEndCashBalance,
          bookings: reportToSend.bookings || [],
          expenses: reportToSend.expenses || [],
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        alert(result.message || "Failed to send email");
        return;
      }

      alert("Report emailed successfully");
    } catch (error) {
      console.error("Error sending email:", error);
      alert("Something went wrong while sending email");
    } finally {
      setSendingEmail(false);
    }
  };

  const groupedBookings = useMemo(() => {
    return rooms.map((room) => ({
      room,
      items: data?.bookings.filter((booking) => booking.room === room) || [],
    }));
  }, [data]);

  return (
    <div style={{ padding: "20px", maxWidth: "1300px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "20px" }}>Daily Balance Report</h1>

      <form
        onSubmit={handleGenerate}
        style={{
          border: "1px solid #ccc",
          borderRadius: "10px",
          padding: "20px",
          marginBottom: "20px",
        }}
      >
        <h2 style={{ marginBottom: "15px" }}>Report Inputs</h2>

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

          <div>
            <label>Food Income</label>
            <br />
            <input
              type="number"
              name="foodIncome"
              value={form.foodIncome}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>

          <div>
            <label>Other Income</label>
            <br />
            <input
              type="number"
              name="otherIncome"
              value={form.otherIncome}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>

          <div>
            <label>Recipient Email</label>
            <br />
            <input
              type="email"
              name="emailTo"
              value={form.emailTo}
              onChange={handleChange}
              placeholder="example@gmail.com"
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
          Calculate Balance
        </button>

        <button
          type="button"
          onClick={handleFinalizeDay}
          disabled={finalizing}
          style={{
            padding: "10px 20px",
            backgroundColor: "green",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: finalizing ? "not-allowed" : "pointer",
            marginLeft: "10px",
            opacity: finalizing ? 0.7 : 1,
          }}
        >
          {finalizing ? "Finalizing..." : "Finalize Day"}
        </button>

        <button
          type="button"
          onClick={handleSendEmail}
          disabled={sendingEmail || !data}
          style={{
            padding: "10px 20px",
            backgroundColor: "#1d4ed8",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: sendingEmail || !data ? "not-allowed" : "pointer",
            marginLeft: "10px",
            opacity: sendingEmail || !data ? 0.7 : 1,
          }}
        >
          {sendingEmail ? "Sending..." : "Send Email"}
        </button>
      </form>

      {loading ? (
        <p>Loading daily balance...</p>
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
            <SummaryCard title="Opening Cash" value={data.openingCash} />
            <SummaryCard title="Cinema Income" value={data.cinemaIncome} />
            <SummaryCard title="Food Income" value={data.foodIncome} />
            <SummaryCard title="Other Income" value={data.otherIncome} />
            <SummaryCard title="Total Income" value={data.totalIncome} />
            <SummaryCard title="Total Expenses" value={data.totalExpenses} />
            <SummaryCard
              title="Day End Cash Balance"
              value={data.dayEndCashBalance}
            />
          </div>

          <div style={{ display: "grid", gap: "20px", marginBottom: "20px" }}>
            {groupedBookings.map((group) => (
              <div
                key={group.room}
                style={{
                  border: "1px solid #ccc",
                  borderRadius: "10px",
                  padding: "20px",
                }}
              >
                <h2 style={{ marginBottom: "15px" }}>{group.room}</h2>

                {group.items.length === 0 ? (
                  <p>No bookings for this room on selected date.</p>
                ) : (
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr style={{ background: "#f3f3f3" }}>
                          <th style={thStyle}>Time</th>
                          <th style={thStyle}>Name</th>
                          <th style={thStyle}>Tel No</th>
                          <th style={thStyle}>Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.items.map((booking) => (
                          <tr key={booking._id}>
                            <td style={tdStyle}>
                              {booking.startTime} - {booking.endTime}
                            </td>
                            <td style={tdStyle}>{booking.name}</td>
                            <td style={tdStyle}>{booking.telNo}</td>
                            <td style={tdStyle}>Rs. {booking.amount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div
            style={{
              border: "1px solid #ccc",
              borderRadius: "10px",
              padding: "20px",
            }}
          >
            <h2 style={{ marginBottom: "15px" }}>Expenses</h2>

            {data.expenses.length === 0 ? (
              <p>No expenses found for selected date.</p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#f3f3f3" }}>
                      <th style={thStyle}>Date</th>
                      <th style={thStyle}>Category</th>
                      <th style={thStyle}>Description</th>
                      <th style={thStyle}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.expenses.map((expense) => (
                      <tr key={expense._id}>
                        <td style={tdStyle}>{expense.date}</td>
                        <td style={tdStyle}>{expense.category}</td>
                        <td style={tdStyle}>{expense.description}</td>
                        <td style={tdStyle}>Rs. {expense.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
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
        <p>No report data found.</p>
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
      <h3 style={{ margin: "8px 0 0 0" }}>Rs. {value}</h3>
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