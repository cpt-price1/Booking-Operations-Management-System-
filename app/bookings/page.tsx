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
  address: string;
  idNumber: string;
  telNo: string;
  paymentMethod: "Cash" | "Card";
  basePrice: number;
  extraHours: number;
  extraCharge: number;
  amount: number;
  date: string;
  status: "active" | "completed";
};

type CustomerSuggestion = {
  name: string;
  address: string;
  idNumber: string;
  telNo: string;
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

export default function BookingsPage() {
  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [customerSuggestions, setCustomerSuggestions] = useState<
    CustomerSuggestion[]
  >([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [form, setForm] = useState({
    room: "Cinema-01",
    startTime: "10:00",
    endTime: "12:00",
    name: "",
    address: "",
    idNumber: "",
    telNo: "",
    paymentMethod: "Cash" as "Cash" | "Card",
    basePrice: "3900",
    extraHours: "0",
    extraCharge: "0",
    amount: "3900",
    date: formatDate(new Date()),
    status: "active" as "active" | "completed",
  });

  const totalAmount = useMemo(() => {
    return Number(form.basePrice || 0) + Number(form.extraCharge || 0);
  }, [form.basePrice, form.extraCharge]);

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      amount: String(totalAmount),
    }));
  }, [totalAmount]);

  const fetchBookings = async (dateValue: string) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/bookings?date=${dateValue}`);
      const data = await res.json();
      setBookings(data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings(form.date);
  }, [form.date]);

  const handleDateChange = (date: Date | null) => {
    if (!date) return;
    setSelectedDate(date);
    const formatted = formatDate(date);
    setForm((prev) => ({
      ...prev,
      date: formatted,
    }));
  };

  const fetchCustomerByPhone = async (phone: string) => {
    if (!phone || phone.trim().length < 5) return;

    try {
      const res = await fetch(`${API_BASE_URL}/customers/by-phone/${phone}`);
      if (!res.ok) return;

      const data = await res.json();

      setForm((prev) => ({
        ...prev,
        name: prev.name || data.name || "",
        address: prev.address || data.address || "",
        idNumber: prev.idNumber || data.idNumber || "",
      }));
    } catch (error) {
      console.error("Error fetching customer by phone:", error);
    }
  };

  const searchCustomers = async (query: string) => {
    if (!query || query.trim().length < 2) {
      setCustomerSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const res = await fetch(
        `${API_BASE_URL}/customers/search/${encodeURIComponent(query)}`
      );

      if (!res.ok) {
        setCustomerSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      const data = await res.json();
      setCustomerSuggestions(data);
      setShowSuggestions(data.length > 0);
    } catch (error) {
      console.error("Error searching customers:", error);
      setCustomerSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectCustomer = (customer: CustomerSuggestion) => {
    setForm((prev) => ({
      ...prev,
      name: customer.name || "",
      address: customer.address || "",
      idNumber: customer.idNumber || "",
      telNo: customer.telNo || "",
    }));

    setCustomerSuggestions([]);
    setShowSuggestions(false);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const resetForm = () => {
    const today = formatDate(new Date());

    setEditingId(null);
    setIsEditing(false);
    setSelectedDate(new Date());
    setCustomerSuggestions([]);
    setShowSuggestions(false);

    setForm({
      room: "Cinema-01",
      startTime: "10:00",
      endTime: "12:00",
      name: "",
      address: "",
      idNumber: "",
      telNo: "",
      paymentMethod: "Cash",
      basePrice: "3900",
      extraHours: "0",
      extraCharge: "0",
      amount: "3900",
      date: today,
      status: "active",
    });
  };

  const handleEditBooking = (booking: Booking) => {
    setEditingId(booking._id);
    setIsEditing(true);

    setForm({
      room: booking.room,
      startTime: booking.startTime,
      endTime: booking.endTime,
      name: booking.name,
      address: booking.address || "",
      idNumber: booking.idNumber || "",
      telNo: booking.telNo || "",
      paymentMethod: booking.paymentMethod || "Cash",
      basePrice: String(booking.basePrice || 3900),
      extraHours: String(booking.extraHours || 0),
      extraCharge: String(booking.extraCharge || 0),
      amount: String(booking.amount || 0),
      date: booking.date,
      status: booking.status || "active",
    });

    setSelectedDate(new Date(booking.date));
    setCustomerSuggestions([]);
    setShowSuggestions(false);
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !form.name ||
      !form.date ||
      !form.room ||
      !form.startTime ||
      !form.endTime
    ) {
      alert("Please fill required fields");
      return;
    }

    try {
      const payload = {
        ...form,
        basePrice: Number(form.basePrice),
        extraHours: Number(form.extraHours),
        extraCharge: Number(form.extraCharge),
        amount: Number(form.amount),
      };

      const url = isEditing
        ? `${API_BASE_URL}/bookings/${editingId}`
        : `${API_BASE_URL}/bookings`;

      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to save booking");
        return;
      }

      alert(
        isEditing
          ? "Booking updated successfully"
          : "Booking added successfully"
      );

      const currentDate = form.date;
      resetForm();
      fetchBookings(currentDate);
    } catch (error) {
      console.error("Error saving booking:", error);
      alert("Something went wrong");
    }
  };

  const handleDeleteBooking = async (id: string) => {
    const ok = confirm("Are you sure you want to delete this booking?");
    if (!ok) return;

    try {
      const res = await fetch(`${API_BASE_URL}/bookings/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to delete booking");
        return;
      }

      alert("Booking deleted successfully");
      fetchBookings(form.date);
    } catch (error) {
      console.error("Error deleting booking:", error);
      alert("Something went wrong");
    }
  };

  const handleChangeStatus = async (
    id: string,
    status: "active" | "completed"
  ) => {
    try {
      const res = await fetch(`${API_BASE_URL}/bookings/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to update booking status");
        return;
      }

      alert(
        status === "completed"
          ? "Room marked as free"
          : "Booking marked active again"
      );

      fetchBookings(form.date);
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Something went wrong");
    }
  };

  const groupedBookings = useMemo(() => {
    return rooms.map((room) => ({
      room,
      items: bookings.filter((booking) => booking.room === room),
    }));
  }, [bookings]);

  return (
    <div style={{ padding: "20px", maxWidth: "1300px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "20px" }}>Bookings Management</h1>

      <form
        onSubmit={handleSubmitBooking}
        style={{
          border: "1px solid #ccc",
          borderRadius: "10px",
          padding: "20px",
          marginBottom: "20px",
        }}
      >
        <h2 style={{ marginBottom: "15px" }}>
          {isEditing ? "Edit / Extend Booking" : "Add Booking"}
        </h2>

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
            <label>Room</label>
            <br />
            <select
              name="room"
              value={form.room}
              onChange={handleChange}
              style={inputStyle}
            >
              {rooms.map((room) => (
                <option key={room} value={room}>
                  {room}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>Start Time</label>
            <br />
            <input
              type="time"
              name="startTime"
              value={form.startTime}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>

          <div>
            <label>End Time</label>
            <br />
            <input
              type="time"
              name="endTime"
              value={form.endTime}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>

          <div style={{ position: "relative" }}>
            <label>Customer Name</label>
            <br />
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={(e) => {
                handleChange(e);
                searchCustomers(e.target.value);
              }}
              onFocus={() => {
                if (customerSuggestions.length > 0) {
                  setShowSuggestions(true);
                }
              }}
              onBlur={() => {
                setTimeout(() => setShowSuggestions(false), 200);
              }}
              style={inputStyle}
              autoComplete="off"
            />

            {showSuggestions && customerSuggestions.length > 0 && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  right: 0,
                  background: "white",
                  border: "1px solid #ccc",
                  borderRadius: "6px",
                  zIndex: 20,
                  maxHeight: "220px",
                  overflowY: "auto",
                  boxShadow: "0 4px 8px rgba(0,0,0,0.08)",
                }}
              >
                {customerSuggestions.map((customer, index) => (
                  <div
                    key={`${customer.telNo}-${index}`}
                    onMouseDown={() => handleSelectCustomer(customer)}
                    style={{
                      padding: "10px",
                      borderBottom: "1px solid #eee",
                      cursor: "pointer",
                      background: "#fff",
                    }}
                  >
                    <div style={{ fontWeight: 600 }}>
                      {customer.name || "No Name"}
                    </div>
                    <div style={{ fontSize: "13px", color: "#555" }}>
                      {customer.telNo}
                    </div>
                    <div style={{ fontSize: "12px", color: "#777" }}>
                      {customer.address}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label>Address</label>
            <br />
            <input
              type="text"
              name="address"
              value={form.address}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>

          <div>
            <label>ID Number</label>
            <br />
            <input
              type="text"
              name="idNumber"
              value={form.idNumber}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>

          <div>
            <label>Tel No</label>
            <br />
            <input
              type="text"
              name="telNo"
              value={form.telNo}
              onChange={(e) => {
                handleChange(e);
                fetchCustomerByPhone(e.target.value);
              }}
              style={inputStyle}
              autoComplete="off"
            />
          </div>

          <div>
            <label>Payment Method</label>
            <br />
            <select
              name="paymentMethod"
              value={form.paymentMethod}
              onChange={handleChange}
              style={inputStyle}
            >
              <option value="Cash">Cash</option>
              <option value="Card">Card</option>
            </select>
          </div>

          <div>
            <label>Base Price</label>
            <br />
            <input
              type="number"
              name="basePrice"
              value={form.basePrice}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>

          <div>
            <label>Extra Hours</label>
            <br />
            <input
              type="number"
              name="extraHours"
              value={form.extraHours}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>

          <div>
            <label>Extra Charge</label>
            <br />
            <input
              type="number"
              name="extraCharge"
              value={form.extraCharge}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>

          <div>
            <label>Total Amount</label>
            <br />
            <input
              type="number"
              name="amount"
              value={form.amount}
              readOnly
              style={{ ...inputStyle, background: "#f3f3f3" }}
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
          {isEditing ? "Update Booking" : "Add Booking"}
        </button>

        {isEditing && (
          <button
            type="button"
            onClick={resetForm}
            style={{
              padding: "10px 20px",
              backgroundColor: "#666",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              marginLeft: "10px",
            }}
          >
            Cancel Edit
          </button>
        )}
      </form>

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

            {loading ? (
              <p>Loading...</p>
            ) : group.items.length === 0 ? (
              <p>No bookings for this room on selected date.</p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#f3f3f3" }}>
                      <th style={thStyle}>Time</th>
                      <th style={thStyle}>Name</th>
                      <th style={thStyle}>Tel No</th>
                      <th style={thStyle}>Payment</th>
                      <th style={thStyle}>Base</th>
                      <th style={thStyle}>Extra Hrs</th>
                      <th style={thStyle}>Extra Charge</th>
                      <th style={thStyle}>Total</th>
                      <th style={thStyle}>Status</th>
                      <th style={thStyle}>Action</th>
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
                        <td style={tdStyle}>
                          {booking.paymentMethod || "Cash"}
                        </td>
                        <td style={tdStyle}>Rs. {booking.basePrice || 3900}</td>
                        <td style={tdStyle}>{booking.extraHours || 0}</td>
                        <td style={tdStyle}>
                          Rs. {booking.extraCharge || 0}
                        </td>
                        <td style={tdStyle}>Rs. {booking.amount}</td>
                        <td style={tdStyle}>
                          {booking.status === "completed"
                            ? "Completed"
                            : "Active"}
                        </td>
                        <td style={tdStyle}>
                          <button
                            onClick={() => handleEditBooking(booking)}
                            style={{
                              padding: "6px 12px",
                              backgroundColor: "blue",
                              color: "white",
                              border: "none",
                              borderRadius: "5px",
                              cursor: "pointer",
                              marginRight: "8px",
                            }}
                          >
                            Edit
                          </button>

                          {booking.status !== "completed" ? (
                            <button
                              onClick={() =>
                                handleChangeStatus(booking._id, "completed")
                              }
                              style={{
                                padding: "6px 12px",
                                backgroundColor: "green",
                                color: "white",
                                border: "none",
                                borderRadius: "5px",
                                cursor: "pointer",
                                marginRight: "8px",
                              }}
                            >
                              Free Room
                            </button>
                          ) : (
                            <button
                              onClick={() =>
                                handleChangeStatus(booking._id, "active")
                              }
                              style={{
                                padding: "6px 12px",
                                backgroundColor: "#555",
                                color: "white",
                                border: "none",
                                borderRadius: "5px",
                                cursor: "pointer",
                                marginRight: "8px",
                              }}
                            >
                              Reopen
                            </button>
                          )}

                          <button
                            onClick={() => handleDeleteBooking(booking._id)}
                            style={{
                              padding: "6px 12px",
                              backgroundColor: "red",
                              color: "white",
                              border: "none",
                              borderRadius: "5px",
                              cursor: "pointer",
                            }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>

      <style jsx>{`
        .custom-date-input {
          width: 100%;
          padding: 10px;
          border: 1px solid #ccc;
          border-radius: 6px;
        }
      `}</style>
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