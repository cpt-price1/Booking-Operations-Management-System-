"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Bookings", href: "/bookings" },
  { label: "Expenses", href: "/expenses" },
  { label: "Daily Balance", href: "/daily-balance" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "Finalized Reports", href: "/finalized-reports" },
  { label: "Room Status", href: "/room-status" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 1000,
        padding: "14px 18px",
        backdropFilter: "blur(16px)",
        background: "rgba(2, 6, 23, 0.75)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        <Link
          href="/"
          style={{
            textDecoration: "none",
            color: "white",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                width: "46px",
                height: "46px",
                borderRadius: "14px",
                background: "linear-gradient(135deg, #22c55e, #16a34a)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "22px",
                boxShadow: "0 10px 24px rgba(34,197,94,0.35)",
              }}
            >
              🎮
            </div>

            <div>
              <div
                style={{
                  fontSize: "22px",
                  fontWeight: 900,
                  lineHeight: 1,
                }}
              >
                GameHut
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: "#cbd5e1",
                  marginTop: "4px",
                }}
              >
                CRM Control Panel
              </div>
            </div>
          </div>
        </Link>

        <div
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >
          {navItems.map((item) => {
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  textDecoration: "none",
                  padding: "10px 14px",
                  borderRadius: "12px",
                  fontSize: "14px",
                  fontWeight: 700,
                  color: active ? "white" : "#cbd5e1",
                  background: active
                    ? "linear-gradient(135deg, #22c55e, #16a34a)"
                    : "rgba(255,255,255,0.06)",
                  border: active
                    ? "1px solid rgba(34,197,94,0.45)"
                    : "1px solid rgba(255,255,255,0.08)",
                  boxShadow: active
                    ? "0 10px 20px rgba(34,197,94,0.22)"
                    : "none",
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}