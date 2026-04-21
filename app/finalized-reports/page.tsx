"use client";

import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

type Booking = {
  _id?: string;
  room: string;
  startTime: string;
  endTime: string;
  name: string;
  telNo: string;
  amount: number;
  date: string;
};

type Expense = {
  _id?: string;
  date: string;
  category: string;
  description: string;
  amount: number;
};

type FinalizedReport = {
  _id: string;
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

export default function FinalizedReportsPage() {
  const [reports, setReports] = useState<FinalizedReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<FinalizedReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedDateText, setSelectedDateText] = useState("");

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/finalized-days");
      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to fetch reports");
        return;
      }

      setReports(data);

      if (data.length > 0) {
        setSelectedReport(data[0]);
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleViewReport = async (date: string) => {
    try {
      const res = await fetch(`http://localhost:5000/finalized-days/${date}`);
      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to fetch report");
        return;
      }

      setSelectedReport(data);
      setSelectedDateText(date);

      const parsedDate = new Date(date);
      if (!isNaN(parsedDate.getTime())) {
        setSelectedDate(parsedDate);
      }
    } catch (error) {
      console.error("Error fetching report:", error);
      alert("Something went wrong");
    }
  };

  const handleDateChange = (date: Date | null) => {
    if (!date) return;
    setSelectedDate(date);
    setSelectedDateText(formatDate(date));
  };

  const handleLoadSelectedDate = async () => {
    if (!selectedDateText) {
      alert("Please select a date");
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:5000/finalized-days/${selectedDateText}`
      );
      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Finalized report not found for selected date");
        return;
      }

      setSelectedReport(data);
    } catch (error) {
      console.error("Error loading selected date report:", error);
      alert("Something went wrong");
    }
  };

  const groupedBookings = rooms.map((room) => ({
    room,
    items:
      selectedReport?.bookings.filter((booking) => booking.room === room) || [],
  }));

  return (
    <div style={{ padding: "20px", maxWidth: "1400px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "20px" }}>Finalized Reports History</h1>

      <div
        style={{
          border: "1px solid #ccc",
          borderRadius: "10px",
          padding: "20px",
          marginBottom: "20px",
        }}
      >
        <h2 style={{ marginBottom: "15px" }}>Load Finalized Report by Date</h2>

        <div
          style={{
            display: "flex",
            gap: "10px",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <DatePicker
            selected={selectedDate}
            onChange={handleDateChange}
            dateFormat="yyyy-MM-dd"
            className="custom-date-input"
          />

          <button
            type="button"
            onClick={handleLoadSelectedDate}
            style={{
              padding: "10px 20px",
              backgroundColor: "black",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Load Finalized Report
          </button>
        </div>
      </div>

      {loading ? (
        <p>Loading reports...</p>
      ) : reports.length === 0 ? (
        <p>No finalized reports found.</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "300px 1fr",
            gap: "20px",
            alignItems: "start",
          }}
        >
          <div
            style={{
              border: "1px solid #ccc",
              borderRadius: "10px",
              padding: "20px",
            }}
          >
            <h2 style={{ marginBottom: "15px" }}>Saved Dates</h2>

            <div style={{ display: "grid", gap: "10px" }}>
              {reports.map((report) => (
                <button
                  key={report._id}
                  onClick={() => handleViewReport(report.date)}
                  style={{
                    padding: "10px",
                    border: "1px solid #ccc",
                    borderRadius: "6px",
                    background:
                      selectedReport?.date === report.date ? "#000" : "#fff",
                    color:
                      selectedReport?.date === report.date ? "#fff" : "#000",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  {report.date}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gap: "20px" }}>
            {selectedReport && (
              <>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: "15px",
                  }}
                >
                  <SummaryCard
                    title="Opening Cash"
                    value={selectedReport.openingCash}
                  />
                  <SummaryCard
                    title="Cinema Income"
                    value={selectedReport.cinemaIncome}
                  />
                  <SummaryCard
                    title="Food Income"
                    value={selectedReport.foodIncome}
                  />
                  <SummaryCard
                    title="Other Income"
                    value={selectedReport.otherIncome}
                  />
                  <SummaryCard
                    title="Total Income"
                    value={selectedReport.totalIncome}
                  />
                  <SummaryCard
                    title="Total Expenses"
                    value={selectedReport.totalExpenses}
                  />
                  <SummaryCard
                    title="Day End Cash Balance"
                    value={selectedReport.dayEndCashBalance}
                  />
                </div>

                <div style={{ display: "grid", gap: "20px" }}>
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
                        <p>No bookings for this room.</p>
                      ) : (
                        <div style={{ overflowX: "auto" }}>
                          <table
                            style={{ width: "100%", borderCollapse: "collapse" }}
                          >
                            <thead>
                              <tr style={{ background: "#f3f3f3" }}>
                                <th style={thStyle}>Time</th>
                                <th style={thStyle}>Name</th>
                                <th style={thStyle}>Tel No</th>
                                <th style={thStyle}>Amount</th>
                              </tr>
                            </thead>
                            <tbody>
                              {group.items.map((booking, index) => (
                                <tr key={booking._id || index}>
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

                  {selectedReport.expenses.length === 0 ? (
                    <p>No expenses for this date.</p>
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
                          {selectedReport.expenses.map((expense, index) => (
                            <tr key={expense._id || index}>
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
              </>
            )}
          </div>
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

const thStyle: React.CSSProperties = {
  border: "1px solid #ccc",
  padding: "10px",
  textAlign: "left",
};

const tdStyle: React.CSSProperties = {
  border: "1px solid #ccc",
  padding: "10px",
};