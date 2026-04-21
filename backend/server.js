require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const nodemailer = require("nodemailer");

const app = express();

app.use(cors());
app.use(express.json());

mongoose
  .connect("mongodb://127.0.0.1:27017/crm")
  .then(() => console.log("MongoDB Connected ✅"))
  .catch((err) => console.log("Mongo Error ❌", err));

mongoose.connection.once("open", () => {
  console.log("DB NAME:", mongoose.connection.name);
  console.log("DB HOST:", mongoose.connection.host);
});

const bookingSchema = new mongoose.Schema({
  room: {
    type: String,
    required: true,
    enum: [
      "Cinema-01",
      "Cinema-02",
      "Cinema-03",
      "Cinema-04",
      "Cinema-05",
      "Cinema-06",
      "Cinema-07",
      "Cinema-08",
      "VIP",
    ],
  },
  startTime: {
    type: String,
    required: true,
  },
  endTime: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    default: "",
  },
  idNumber: {
    type: String,
    default: "",
  },
  telNo: {
    type: String,
    default: "",
  },
  paymentMethod: {
    type: String,
    enum: ["Cash", "Card"],
    default: "Cash",
  },
  basePrice: {
    type: Number,
    default: 3900,
  },
  extraHours: {
    type: Number,
    default: 0,
  },
  extraCharge: {
    type: Number,
    default: 0,
  },
  amount: {
    type: Number,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["active", "completed"],
    default: "active",
  },
});

const Booking = mongoose.model("Booking", bookingSchema);

const expenseSchema = new mongoose.Schema(
  {
    date: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "Card",
        "Salary",
        "Food",
        "Maintenance",
        "Bills",
        "Owner Withdraw",
        "Bank Deposit",
        "Other",
      ],
      default: "Other",
    },
    description: {
      type: String,
      default: "",
    },
    amount: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const Expense = mongoose.model("Expense", expenseSchema);

const dailyReportSchema = new mongoose.Schema(
  {
    date: {
      type: String,
      required: true,
      unique: true,
    },
    openingCash: {
      type: Number,
      default: 0,
    },
    cinemaIncome: {
      type: Number,
      default: 0,
    },
    foodIncome: {
      type: Number,
      default: 0,
    },
    otherIncome: {
      type: Number,
      default: 0,
    },
    totalIncome: {
      type: Number,
      default: 0,
    },
    totalExpenses: {
      type: Number,
      default: 0,
    },
    dayEndCashBalance: {
      type: Number,
      default: 0,
    },
    bookings: {
      type: Array,
      default: [],
    },
    expenses: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true }
);

const DailyReport = mongoose.model("DailyReport", dailyReportSchema);

function timeToMinutes(time) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function hasTimeOverlap(existingStart, existingEnd, newStart, newEnd) {
  const existingStartMin = timeToMinutes(existingStart);
  const existingEndMin = timeToMinutes(existingEnd);
  const newStartMin = timeToMinutes(newStart);
  const newEndMin = timeToMinutes(newEnd);

  return newStartMin < existingEndMin && newEndMin > existingStartMin;
}

app.get("/", (req, res) => {
  res.send("CRM Backend Running");
});

app.post("/bookings", async (req, res) => {
  try {
    const {
      room,
      date,
      startTime,
      endTime,
      basePrice,
      extraHours,
      extraCharge,
      amount,
    } = req.body;

    if (!room || !date || !startTime || !endTime) {
      return res.status(400).json({
        message: "room, date, startTime and endTime are required",
      });
    }

    if (timeToMinutes(endTime) <= timeToMinutes(startTime)) {
      return res.status(400).json({
        message: "End time must be greater than start time",
      });
    }

    const existingBookings = await Booking.find({ room, date });

    const overlapBooking = existingBookings.find((booking) =>
      hasTimeOverlap(booking.startTime, booking.endTime, startTime, endTime)
    );

    if (overlapBooking) {
      return res.status(400).json({
        message: `This room already has a booking between ${overlapBooking.startTime} and ${overlapBooking.endTime}`,
      });
    }

    const bookingData = {
      ...req.body,
      basePrice: Number(basePrice || 3900),
      extraHours: Number(extraHours || 0),
      extraCharge: Number(extraCharge || 0),
      amount: Number(amount || 0),
      status: req.body.status || "active",
    };

    const savedBooking = await Booking.create(bookingData);

    if (savedBooking.paymentMethod === "Card") {
      await Expense.create({
        date: savedBooking.date,
        category: "Card",
        description: `Card payment - ${savedBooking.room} - ${savedBooking.name} (${savedBooking.startTime}-${savedBooking.endTime})`,
        amount: savedBooking.amount,
      });
    }

    res.status(201).json(savedBooking);
  } catch (err) {
    console.log("SAVE ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

app.get("/bookings", async (req, res) => {
  try {
    const { date, room } = req.query;

    const filter = {};
    if (date) filter.date = date;
    if (room) filter.room = room;

    const bookings = await Booking.find(filter).sort({
      room: 1,
      startTime: 1,
      _id: -1,
    });

    res.json(bookings);
  } catch (err) {
    console.log("GET BOOKINGS ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

app.get("/customers/by-phone/:telNo", async (req, res) => {
  try {
    const { telNo } = req.params;

    const customer = await Booking.findOne({ telNo }).sort({ _id: -1 });

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.json({
      name: customer.name || "",
      address: customer.address || "",
      idNumber: customer.idNumber || "",
      telNo: customer.telNo || "",
    });
  } catch (err) {
    console.log("GET CUSTOMER BY PHONE ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

app.get("/customers/search/:query", async (req, res) => {
  try {
    const { query } = req.params;

    const customers = await Booking.find({
      name: { $regex: query, $options: "i" },
    })
      .sort({ _id: -1 })
      .limit(8);

    const uniqueCustomers = [];
    const seen = new Set();

    for (const customer of customers) {
      const key = `${customer.name}-${customer.telNo}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueCustomers.push({
          name: customer.name || "",
          address: customer.address || "",
          idNumber: customer.idNumber || "",
          telNo: customer.telNo || "",
        });
      }
    }

    res.json(uniqueCustomers);
  } catch (err) {
    console.log("CUSTOMER SEARCH ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

app.put("/bookings/:id", async (req, res) => {
  try {
    const currentBooking = await Booking.findById(req.params.id);

    if (!currentBooking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const room = req.body.room || currentBooking.room;
    const date = req.body.date || currentBooking.date;
    const startTime = req.body.startTime || currentBooking.startTime;
    const endTime = req.body.endTime || currentBooking.endTime;

    if (timeToMinutes(endTime) <= timeToMinutes(startTime)) {
      return res.status(400).json({
        message: "End time must be greater than start time",
      });
    }

    const existingBookings = await Booking.find({
      room,
      date,
      _id: { $ne: req.params.id },
    });

    const overlapBooking = existingBookings.find((booking) =>
      hasTimeOverlap(booking.startTime, booking.endTime, startTime, endTime)
    );

    if (overlapBooking) {
      return res.status(400).json({
        message: `This room already has a booking between ${overlapBooking.startTime} and ${overlapBooking.endTime}`,
      });
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        basePrice: Number(req.body.basePrice || 3900),
        extraHours: Number(req.body.extraHours || 0),
        extraCharge: Number(req.body.extraCharge || 0),
        amount: Number(req.body.amount || 0),
        status: req.body.status || currentBooking.status || "active",
      },
      { new: true, runValidators: true }
    );

    res.json(updatedBooking);
  } catch (err) {
    console.log("UPDATE ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

app.put("/bookings/:id/status", async (req, res) => {
  try {
    const { status } = req.body;

    if (!["active", "completed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!updatedBooking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json(updatedBooking);
  } catch (err) {
    console.log("STATUS UPDATE ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

app.delete("/bookings/:id", async (req, res) => {
  try {
    await Booking.findByIdAndDelete(req.params.id);
    res.json({ message: "Booking deleted successfully" });
  } catch (err) {
    console.log("DELETE BOOKING ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

app.post("/expenses", async (req, res) => {
  try {
    const savedExpense = await Expense.create({
      ...req.body,
      amount: Number(req.body.amount || 0),
    });
    res.status(201).json(savedExpense);
  } catch (err) {
    console.log("EXPENSE SAVE ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

app.get("/expenses", async (req, res) => {
  try {
    const { date } = req.query;
    const filter = date ? { date } : {};
    const expenses = await Expense.find(filter).sort({ _id: -1 });
    res.json(expenses);
  } catch (err) {
    console.log("GET EXPENSES ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

app.delete("/expenses/:id", async (req, res) => {
  try {
    await Expense.findByIdAndDelete(req.params.id);
    res.json({ message: "Expense deleted successfully" });
  } catch (err) {
    console.log("DELETE EXPENSE ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

app.get("/daily-balance", async (req, res) => {
  try {
    const {
      date,
      openingCash = 0,
      foodIncome = 0,
      otherIncome = 0,
    } = req.query;

    if (!date) {
      return res.status(400).json({ message: "date is required" });
    }

    const bookings = await Booking.find({ date }).sort({
      room: 1,
      startTime: 1,
      _id: -1,
    });

    const expenses = await Expense.find({ date }).sort({ _id: -1 });

    const cinemaIncome = bookings.reduce(
      (sum, booking) => sum + Number(booking.amount || 0),
      0
    );

    const totalExpenses = expenses.reduce(
      (sum, expense) => sum + Number(expense.amount || 0),
      0
    );

    const totalIncome =
      Number(openingCash) +
      Number(cinemaIncome) +
      Number(foodIncome) +
      Number(otherIncome);

    const dayEndCashBalance = totalIncome - totalExpenses;

    res.json({
      date,
      openingCash: Number(openingCash),
      cinemaIncome,
      foodIncome: Number(foodIncome),
      otherIncome: Number(otherIncome),
      totalIncome,
      totalExpenses,
      dayEndCashBalance,
      bookings,
      expenses,
    });
  } catch (err) {
    console.log("DAILY BALANCE ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

app.post("/finalize-day", async (req, res) => {
  try {
    const {
      date,
      openingCash = 0,
      foodIncome = 0,
      otherIncome = 0,
    } = req.body;

    if (!date) {
      return res.status(400).json({ message: "date is required" });
    }

    const bookings = await Booking.find({ date }).sort({
      room: 1,
      startTime: 1,
      _id: -1,
    });

    const expenses = await Expense.find({ date }).sort({ _id: -1 });

    const cinemaIncome = bookings.reduce(
      (sum, booking) => sum + Number(booking.amount || 0),
      0
    );

    const totalExpenses = expenses.reduce(
      (sum, expense) => sum + Number(expense.amount || 0),
      0
    );

    const totalIncome =
      Number(openingCash) +
      Number(cinemaIncome) +
      Number(foodIncome) +
      Number(otherIncome);

    const dayEndCashBalance = totalIncome - totalExpenses;

    const savedReport = await DailyReport.findOneAndUpdate(
      { date },
      {
        date,
        openingCash: Number(openingCash),
        cinemaIncome,
        foodIncome: Number(foodIncome),
        otherIncome: Number(otherIncome),
        totalIncome,
        totalExpenses,
        dayEndCashBalance,
        bookings,
        expenses,
      },
      { new: true, upsert: true }
    );

    res.status(201).json({
      message: "Day finalized successfully",
      report: savedReport,
    });
  } catch (err) {
    console.log("FINALIZE DAY ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

app.get("/finalized-days", async (req, res) => {
  try {
    const reports = await DailyReport.find().sort({ date: -1 });
    res.json(reports);
  } catch (err) {
    console.log("GET FINALIZED DAYS ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

app.get("/finalized-days/:date", async (req, res) => {
  try {
    const report = await DailyReport.findOne({ date: req.params.date });

    if (!report) {
      return res.status(404).json({ message: "Finalized report not found" });
    }

    res.json(report);
  } catch (err) {
    console.log("GET FINALIZED DAY ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

app.post("/send-finalized-report", async (req, res) => {
  try {
    const {
      to,
      date,
      openingCash,
      cinemaIncome,
      foodIncome,
      otherIncome,
      totalIncome,
      totalExpenses,
      dayEndCashBalance,
      bookings = [],
      expenses = [],
    } = req.body;

    if (!to) {
      return res.status(400).json({ message: "Recipient email is required" });
    }

    if (!date) {
      return res.status(400).json({ message: "Report date is required" });
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return res.status(500).json({
        message: "EMAIL_USER or EMAIL_PASS is missing in .env",
      });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const bookingsRows =
      bookings.length > 0
        ? bookings
            .map(
              (booking, index) => `
                <tr>
                  <td style="padding:8px; border:1px solid #ddd;">${index + 1}</td>
                  <td style="padding:8px; border:1px solid #ddd;">${booking.room || ""}</td>
                  <td style="padding:8px; border:1px solid #ddd;">${booking.startTime || ""} - ${booking.endTime || ""}</td>
                  <td style="padding:8px; border:1px solid #ddd;">${booking.name || ""}</td>
                  <td style="padding:8px; border:1px solid #ddd;">${booking.telNo || ""}</td>
                  <td style="padding:8px; border:1px solid #ddd;">${booking.paymentMethod || ""}</td>
                  <td style="padding:8px; border:1px solid #ddd;">Rs. ${Number(booking.amount || 0).toLocaleString()}</td>
                </tr>
              `
            )
            .join("")
        : `
          <tr>
            <td colspan="7" style="padding:8px; border:1px solid #ddd; text-align:center;">
              No bookings
            </td>
          </tr>
        `;

    const expensesRows =
      expenses.length > 0
        ? expenses
            .map(
              (expense, index) => `
                <tr>
                  <td style="padding:8px; border:1px solid #ddd;">${index + 1}</td>
                  <td style="padding:8px; border:1px solid #ddd;">${expense.category || ""}</td>
                  <td style="padding:8px; border:1px solid #ddd;">${expense.description || ""}</td>
                  <td style="padding:8px; border:1px solid #ddd;">Rs. ${Number(expense.amount || 0).toLocaleString()}</td>
                </tr>
              `
            )
            .join("")
        : `
          <tr>
            <td colspan="4" style="padding:8px; border:1px solid #ddd; text-align:center;">
              No expenses
            </td>
          </tr>
        `;

    const html = `
      <div style="font-family: Arial, sans-serif; color: #222;">
        <h2>Daily Balance Report - ${date}</h2>

        <table style="border-collapse: collapse; width: 100%; margin-bottom: 20px;">
          <tbody>
            <tr>
              <td style="padding:10px; border:1px solid #ddd;"><strong>Opening Cash</strong></td>
              <td style="padding:10px; border:1px solid #ddd;">Rs. ${Number(openingCash || 0).toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding:10px; border:1px solid #ddd;"><strong>Cinema Income</strong></td>
              <td style="padding:10px; border:1px solid #ddd;">Rs. ${Number(cinemaIncome || 0).toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding:10px; border:1px solid #ddd;"><strong>Food Income</strong></td>
              <td style="padding:10px; border:1px solid #ddd;">Rs. ${Number(foodIncome || 0).toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding:10px; border:1px solid #ddd;"><strong>Other Income</strong></td>
              <td style="padding:10px; border:1px solid #ddd;">Rs. ${Number(otherIncome || 0).toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding:10px; border:1px solid #ddd;"><strong>Total Income</strong></td>
              <td style="padding:10px; border:1px solid #ddd;">Rs. ${Number(totalIncome || 0).toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding:10px; border:1px solid #ddd;"><strong>Total Expenses</strong></td>
              <td style="padding:10px; border:1px solid #ddd;">Rs. ${Number(totalExpenses || 0).toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding:10px; border:1px solid #ddd;"><strong>Day End Cash Balance</strong></td>
              <td style="padding:10px; border:1px solid #ddd;"><strong>Rs. ${Number(dayEndCashBalance || 0).toLocaleString()}</strong></td>
            </tr>
          </tbody>
        </table>

        <h3>Bookings</h3>
        <table style="border-collapse: collapse; width: 100%; margin-bottom: 20px;">
          <thead>
            <tr>
              <th style="padding:8px; border:1px solid #ddd;">#</th>
              <th style="padding:8px; border:1px solid #ddd;">Room</th>
              <th style="padding:8px; border:1px solid #ddd;">Time</th>
              <th style="padding:8px; border:1px solid #ddd;">Name</th>
              <th style="padding:8px; border:1px solid #ddd;">Tel</th>
              <th style="padding:8px; border:1px solid #ddd;">Payment</th>
              <th style="padding:8px; border:1px solid #ddd;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${bookingsRows}
          </tbody>
        </table>

        <h3>Expenses</h3>
        <table style="border-collapse: collapse; width: 100%;">
          <thead>
            <tr>
              <th style="padding:8px; border:1px solid #ddd;">#</th>
              <th style="padding:8px; border:1px solid #ddd;">Category</th>
              <th style="padding:8px; border:1px solid #ddd;">Description</th>
              <th style="padding:8px; border:1px solid #ddd;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${expensesRows}
          </tbody>
        </table>
      </div>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject: `Daily Balance Report - ${date}`,
      html,
    });

    res.json({ message: "Finalized report emailed successfully" });
  } catch (err) {
    console.log("SEND FINALIZED REPORT ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});