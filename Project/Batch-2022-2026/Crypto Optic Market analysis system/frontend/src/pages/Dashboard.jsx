import CryptoDashboard from "../components/CryptoDashboard";

export default function Dashboard() {
  return (
    <div className="page-container fade-in">
      <div className="page-hero">
        <h1 style={{ fontSize: "2.5rem" }}>Market Dashboard</h1>
        <p className="page-subtitle">
          Real-time analytics and predictive modeling.
        </p>
      </div>

      <CryptoDashboard />

      <div className="card" style={{
          marginTop: "2rem",
          padding: "1.5rem",
          display: "flex",
          gap: "1rem",
          alignItems: "flex-start"
        }}>
        <div style={{ fontSize: "2rem", marginTop: "0.2rem" }}>ℹ️</div>
        <div>
          <strong style={{ color: "var(--text-primary)", fontSize: "1.1rem" }}>Dashboard Overview</strong>
          <p style={{ marginTop: "0.75rem", marginBottom: "0.5rem" }}>
            <strong style={{ color: "var(--text-primary)" }}>Normalized Prices:</strong> The prices shown on this dashboard are normalized. 
            Normalization scales raw market data into a standard range (e.g., between 0 and 1) to optimize the performance and accuracy of our predictive machine learning models.
          </p>
          <p style={{ margin: 0 }}>
            <strong style={{ color: "var(--text-primary)" }}>Time Axis:</strong> The timestamps along the X-axis reflect the live stream of data as it's processed, displayed in your local timezone. This ensures you can track real-time price movements as they happen.
          </p>
        </div>
      </div>
    </div>
  );
}