"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Booking = {
  _id: string;
  amount: number;
};

type Expense = {
  _id: string;
  amount: number;
};

type FinalizedReport = {
  _id: string;
  date: string;
};

const pages = [
  {
    title: "Bookings",
    description: "Add, edit, extend, and manage room bookings.",
    href: "/bookings",
    emoji: "🎟️",
    accent: "#22c55e",
  },
  {
    title: "Expenses",
    description: "Track daily expenses, card payments, and other costs.",
    href: "/expenses",
    emoji: "💸",
    accent: "#f59e0b",
  },
  {
    title: "Daily Balance",
    description: "Calculate income, expenses, and day-end cash balance.",
    href: "/daily-balance",
    emoji: "📊",
    accent: "#38bdf8",
  },
  {
    title: "Dashboard",
    description: "View booking count, income, expenses, and balance.",
    href: "/dashboard",
    emoji: "📈",
    accent: "#a78bfa",
  },
  {
    title: "Finalized Reports",
    description: "Check saved reports and finalized daily records.",
    href: "/finalized-reports",
    emoji: "🗂️",
    accent: "#f472b6",
  },
  {
    title: "Room Status",
    description: "See which rooms are free or occupied instantly.",
    href: "/room-status",
    emoji: "🏠",
    accent: "#34d399",
  },
];

export default function HomePage() {
  const [now, setNow] = useState(new Date());
  const [loading, setLoading] = useState(true);

  const [todayBookings, setTodayBookings] = useState<Booking[]>([]);
  const [todayExpenses, setTodayExpenses] = useState<Expense[]>([]);
  const [finalizedReports, setFinalizedReports] = useState<FinalizedReport[]>(
    []
  );

  const today = useMemo(() => {
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, [now]);

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchStats(today);
  }, [today]);

  const fetchStats = async (date: string) => {
    try {
      setLoading(true);

      const [bookingsRes, expensesRes, finalizedRes] = await Promise.all([
        fetch(`http://localhost:5000/bookings?date=${date}`),
        fetch(`http://localhost:5000/expenses?date=${date}`),
        fetch(`http://localhost:5000/finalized-days`),
      ]);

      const bookingsData = await bookingsRes.json();
      const expensesData = await expensesRes.json();
      const finalizedData = await finalizedRes.json();

      if (bookingsRes.ok) setTodayBookings(bookingsData);
      if (expensesRes.ok) setTodayExpenses(expensesData);
      if (finalizedRes.ok) setFinalizedReports(finalizedData);
    } catch (error) {
      console.error("Error loading home stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const todayIncome = todayBookings.reduce(
    (sum, booking) => sum + Number(booking.amount || 0),
    0
  );

  const todayExpenseTotal = todayExpenses.reduce(
    (sum, expense) => sum + Number(expense.amount || 0),
    0
  );

  const timeText = now.toLocaleTimeString();
  const dateText = now.toLocaleDateString("en-GB", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top left, #1e293b 0%, #0f172a 35%, #020617 100%)",
        color: "#f8fafc",
        padding: "32px 18px 60px",
      }}
    >
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        <div
          style={{
            position: "relative",
            overflow: "hidden",
            borderRadius: "30px",
            padding: "32px",
            marginBottom: "28px",
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.10), rgba(255,255,255,0.04))",
            border: "1px solid rgba(255,255,255,0.12)",
            boxShadow: "0 25px 60px rgba(0,0,0,0.35)",
            backdropFilter: "blur(18px)",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "-60px",
              right: "-40px",
              width: "220px",
              height: "220px",
              borderRadius: "999px",
              background: "rgba(34,197,94,0.18)",
              filter: "blur(30px)",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "-70px",
              left: "-40px",
              width: "240px",
              height: "240px",
              borderRadius: "999px",
              background: "rgba(56,189,248,0.10)",
              filter: "blur(34px)",
            }}
          />

          <div
            style={{
              position: "relative",
              zIndex: 2,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "24px",
              flexWrap: "wrap",
            }}
          >
            <div style={{ maxWidth: "760px" }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "8px 14px",
                  borderRadius: "999px",
                  background: "rgba(34,197,94,0.14)",
                  border: "1px solid rgba(34,197,94,0.25)",
                  color: "#bbf7d0",
                  fontSize: "13px",
                  fontWeight: 700,
                  marginBottom: "18px",
                }}
              >
                <span>🎮</span>
                <span>Premium Control Center</span>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  marginBottom: "14px",
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{
                    width: "74px",
                    height: "74px",
                    borderRadius: "22px",
                    background:
                      "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "34px",
                    boxShadow: "0 18px 35px rgba(34,197,94,0.35)",
                  }}
                >
                  🎮
                </div>

                <div>
                  <h1
                    style={{
                      margin: 0,
                      fontSize: "52px",
                      fontWeight: 900,
                      letterSpacing: "0.5px",
                      lineHeight: 1,
                    }}
                  >
                    GameHut
                  </h1>
                  <p
                    style={{
                      margin: "8px 0 0 0",
                      color: "#cbd5e1",
                      fontSize: "17px",
                    }}
                  >
                    Room Booking & Daily Balance CRM
                  </p>
                </div>
              </div>

              <p
                style={{
                  margin: 0,
                  color: "#94a3b8",
                  fontSize: "16px",
                  lineHeight: 1.7,
                  maxWidth: "700px",
                }}
              >
                Premium business control panel for bookings, room operations,
                customers, daily balances, expenses, and finalized reports.
              </p>
            </div>

            <div
              style={{
                minWidth: "280px",
                padding: "22px",
                borderRadius: "22px",
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.12)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
              }}
            >
              <div
                style={{
                  fontSize: "13px",
                  color: "#94a3b8",
                  marginBottom: "8px",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}
              >
                Live Date & Time
              </div>
              <div
                style={{
                  fontSize: "34px",
                  fontWeight: 900,
                  color: "#f8fafc",
                  marginBottom: "8px",
                }}
              >
                {timeText}
              </div>
              <div
                style={{
                  fontSize: "14px",
                  color: "#cbd5e1",
                  marginBottom: "14px",
                }}
              >
                {dateText}
              </div>

              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 12px",
                  borderRadius: "999px",
                  background: "rgba(34,197,94,0.14)",
                  border: "1px solid rgba(34,197,94,0.25)",
                  color: "#bbf7d0",
                  fontSize: "13px",
                  fontWeight: 700,
                }}
              >
                <span
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "999px",
                    background: "#22c55e",
                    display: "inline-block",
                  }}
                />
                System Online
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "18px",
            marginBottom: "30px",
          }}
        >
          <StatCard
            title="Today Bookings"
            value={loading ? "..." : String(todayBookings.length)}
            subtitle={`Date: ${today}`}
            icon="📅"
            glow="rgba(34,197,94,0.18)"
          />
          <StatCard
            title="Today Income"
            value={loading ? "..." : `Rs. ${todayIncome}`}
            subtitle="Today's booking revenue"
            icon="💰"
            glow="rgba(56,189,248,0.18)"
          />
          <StatCard
            title="Today Expenses"
            value={loading ? "..." : `Rs. ${todayExpenseTotal}`}
            subtitle="Today's expense total"
            icon="🧾"
            glow="rgba(245,158,11,0.18)"
          />
          <StatCard
            title="Finalized Reports"
            value={loading ? "..." : String(finalizedReports.length)}
            subtitle="Saved report records"
            icon="✅"
            glow="rgba(167,139,250,0.18)"
          />
        </div>

        <div
          style={{
            marginBottom: "18px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "14px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: "26px",
                fontWeight: 800,
                color: "#f8fafc",
              }}
            >
              Quick Access
            </h2>
            <p
              style={{
                margin: "8px 0 0 0",
                color: "#94a3b8",
                fontSize: "15px",
              }}
            >
              Jump into any module from the GameHut home screen.
            </p>
          </div>

          <div
            style={{
              padding: "10px 16px",
              borderRadius: "999px",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.10)",
              color: "#cbd5e1",
              fontSize: "14px",
              fontWeight: 600,
            }}
          >
            Premium Home Panel
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "20px",
          }}
        >
          {pages.map((page) => (
            <Link
              key={page.href}
              href={page.href}
              style={{
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <div
                style={{
                  position: "relative",
                  overflow: "hidden",
                  borderRadius: "24px",
                  padding: "24px",
                  minHeight: "210px",
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))",
                  border: "1px solid rgba(255,255,255,0.10)",
                  boxShadow: "0 16px 38px rgba(0,0,0,0.22)",
                  backdropFilter: "blur(10px)",
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: "-25px",
                    right: "-25px",
                    width: "120px",
                    height: "120px",
                    borderRadius: "999px",
                    background: `${page.accent}22`,
                    filter: "blur(12px)",
                  }}
                />

                <div
                  style={{
                    position: "relative",
                    zIndex: 2,
                  }}
                >
                  <div
                    style={{
                      width: "56px",
                      height: "56px",
                      borderRadius: "16px",
                      background: `${page.accent}22`,
                      border: `1px solid ${page.accent}55`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "26px",
                      marginBottom: "18px",
                    }}
                  >
                    {page.emoji}
                  </div>

                  <h3
                    style={{
                      fontSize: "22px",
                      margin: "0 0 10px 0",
                      color: "#f8fafc",
                    }}
                  >
                    {page.title}
                  </h3>

                  <p
                    style={{
                      color: "#cbd5e1",
                      lineHeight: 1.65,
                      marginBottom: "20px",
                      minHeight: "54px",
                    }}
                  >
                    {page.description}
                  </p>

                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "10px 16px",
                      background: `linear-gradient(135deg, ${page.accent}, ${page.accent}cc)`,
                      color: "white",
                      borderRadius: "12px",
                      fontWeight: 800,
                      fontSize: "14px",
                      boxShadow: `0 10px 22px ${page.accent}44`,
                    }}
                  >
                    <span>Open Page</span>
                    <span>→</span>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
  glow,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: string;
  glow: string;
}) {
  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: "22px",
        padding: "20px",
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))",
        border: "1px solid rgba(255,255,255,0.10)",
        boxShadow: "0 14px 32px rgba(0,0,0,0.18)",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "-25px",
          right: "-25px",
          width: "90px",
          height: "90px",
          borderRadius: "999px",
          background: glow,
          filter: "blur(10px)",
        }}
      />
      <div style={{ position: "relative", zIndex: 2 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "14px",
          }}
        >
          <span
            style={{
              fontSize: "14px",
              color: "#94a3b8",
              fontWeight: 700,
            }}
          >
            {title}
          </span>
          <span style={{ fontSize: "22px" }}>{icon}</span>
        </div>

        <div
          style={{
            fontSize: "28px",
            fontWeight: 900,
            color: "#f8fafc",
            marginBottom: "8px",
          }}
        >
          {value}
        </div>

        <div
          style={{
            fontSize: "13px",
            color: "#cbd5e1",
          }}
        >
          {subtitle}
        </div>
      </div>
    </div>
  );
}