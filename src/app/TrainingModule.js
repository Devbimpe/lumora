import React from "react";

export default function TrainingModules() {
  return (
    <div>
      {/* Navigation Section */}
      <div style={{ textAlign: "center", marginTop: 40 }}>
        <nav style={{ display: "flex", justifyContent: "center", gap: 40 }}>
          <a
            href="#"
            style={{
              color: "#222",
              textDecoration: "none",
              fontWeight: 700,
              fontSize: 16,
            }}
          >
            Training Module
          </a>
          <a
            href="#"
            style={{
              color: "#222",
              textDecoration: "none",
              fontWeight: 700,
              fontSize: 16,
            }}
          >
            Admin Login
          </a>
        </nav>
      </div>
      {/* Main Section */}
      <div style={{ textAlign: "center", marginTop: 80 }}>
        <h1
          style={{
            color: "#17803d",
            fontSize: 64,
            fontWeight: 800,
            marginBottom: 24,
            letterSpacing: 1,
          }}
        >
          THE TRAINING MODULES
        </h1>
        <p
          style={{
            color: "#17803d",
            fontSize: 28,
            maxWidth: 900,
            margin: "0 auto",
            fontWeight: 500,
            lineHeight: 1.3,
          }}
        >
          Engage with interactive scenarios and group discussion designed to
          <br />
          enhance critical thinking and decision-making.
        </p>
      </div>
    </div>
  );
}