"use client";

import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

type Expense = {
  _id: string;
  date: string;
  category: string;
  description: string;
  amount: number;
};

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [form, setForm] = useState({
    date: formatDate(new Date()),
    category: "Card",
    description: "",
    amount: "",
  });

  const fetchExpenses = async (dateValue: string) => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:5000/expenses?date=${dateValue}`);
      const data = await res.json();
      setExpenses(data);
    } catch (error) {
      console.error("Error fetching expenses:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses(form.date);
  }, [form.date]);

  const handleDateChange = (date: Date | null) => {
    if (!date) return;
    setSelectedDate(date);
    setForm((prev) => ({
      ...prev,
      date: formatDate(date),
    }));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.date || !form.category || !form.amount) {
      alert("Please fill required fields");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          amount: Number(form.amount),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to add expense");
        return;
      }

      alert("Expense added successfully");

      setForm((prev) => ({
        ...prev,
        category: "Card",
        description: "",
        amount: "",
      }));

      fetchExpenses(form.date);
    } catch (error) {
      console.error("Error adding expense:", error);
      alert("Something went wrong");
    }
  };

  const handleDeleteExpense = async (id: string) => {
    const confirmDelete = confirm("Are you sure you want to delete this expense?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`http://localhost:5000/expenses/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to delete expense");
        return;
      }

      alert("Expense deleted successfully");
      fetchExpenses(form.date);
    } catch (error) {
      console.error("Error deleting expense:", error);
      alert("Something went wrong");
    }
  };

  const totalExpenses = expenses.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  );

  return (
    <div style={{ padding: "20px", maxWidth: "1000px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "20px" }}>Expenses Management</h1>

      <form
        onSubmit={handleAddExpense}
        style={{
          border: "1px solid #ccc",
          padding: "20px",
          borderRadius: "10px",
          marginBottom: "20px",
        }}
      >
        <h2 style={{ marginBottom: "15px" }}>Add Expense</h2>

        <div style={{ display: "grid", gap: "12px", marginBottom: "12px" }}>
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
            <label>Category</label>
            <br />
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              style={{ width: "100%", padding: "10px" }}
            >
              <option value="Card">Card</option>
              <option value="Salary">Salary</option>
              <option value="Food">Food</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Bills">Bills</option>
              <option value="Owner Withdraw">Owner Withdraw</option>
              <option value="Bank Deposit">Bank Deposit</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label>Description</label>
            <br />
            <input
              type="text"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Enter description"
              style={{ width: "100%", padding: "10px" }}
            />
          </div>

          <div>
            <label>Amount</label>
            <br />
            <input
              type="number"
              name="amount"
              value={form.amount}
              onChange={handleChange}
              placeholder="Enter amount"
              style={{ width: "100%", padding: "10px" }}
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
          Add Expense
        </button>
      </form>

      <div
        style={{
          border: "1px solid #ccc",
          padding: "20px",
          borderRadius: "10px",
        }}
      >
        <h2 style={{ marginBottom: "10px" }}>Expense List</h2>
        <p style={{ marginBottom: "15px" }}>
          <strong>Total Expenses:</strong> Rs. {totalExpenses}
        </p>

        {loading ? (
          <p>Loading...</p>
        ) : expenses.length === 0 ? (
          <p>No expenses found for selected date.</p>
        ) : (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr style={{ background: "#f3f3f3" }}>
                <th style={thStyle}>Date</th>
                <th style={thStyle}>Category</th>
                <th style={thStyle}>Description</th>
                <th style={thStyle}>Amount</th>
                <th style={thStyle}>Action</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr key={expense._id}>
                  <td style={tdStyle}>{expense.date}</td>
                  <td style={tdStyle}>{expense.category}</td>
                  <td style={tdStyle}>{expense.description}</td>
                  <td style={tdStyle}>Rs. {expense.amount}</td>
                  <td style={tdStyle}>
                    <button
                      onClick={() => handleDeleteExpense(expense._id)}
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
        )}

        <style jsx>{`
          .custom-date-input {
            width: 100%;
            padding: 10px;
            border: 1px solid #ccc;
            border-radius: 6px;
          }
        `}</style>
      </div>
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