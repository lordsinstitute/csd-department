import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="page-container fade-in">
      <div className="page-hero">
        <h1 style={{ fontSize: "3.5rem" }}>
          CryptoVista Analytics
        </h1>
        <p className="page-subtitle" style={{ fontSize: "1.25rem", margin: "1.5rem auto 2.5rem", maxWidth: "700px" }}>
          An intuitive and powerful platform delivering real-time analytics, 
          predictive modeling, and qualitative insights for the modern digital asset market.
        </p>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          <Link to="/login" className="btn btn-primary" style={{ padding: "0.85rem 2.5rem", fontSize: "1rem" }}>
            Get Started
          </Link>
          <Link to="/about" className="btn btn-secondary" style={{ padding: "0.85rem 2.5rem", fontSize: "1rem" }}>
            Learn More
          </Link>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem", marginTop: "4rem" }}>
        <div className="card">
          <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>📊</div>
          <h2>Real-Time Insights</h2>
          <p>
            Experience live normalized price visualization with seamless streaming updates. 
            Track major assets like BTC, ETH, and SOL with unparalleled precision.
          </p>
        </div>

        <div className="card">
          <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>🤖</div>
          <h2>AI Predictions</h2>
          <p>
            Leverage cutting-edge machine learning models to forecast asset movements, 
            trained extensively on historical market patterns and behaviors.
          </p>
        </div>

        <div className="card">
          <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>🧠</div>
          <h2>Market Context</h2>
          <p>
            Understand the bigger picture with LLM-powered market regime classification, 
            momentum analysis, and qualitative risk assessments.
          </p>
        </div>
      </div>

      <div className="card" style={{ marginTop: "4rem", textAlign: "center", background: "rgba(6, 182, 212, 0.05)", borderColor: "rgba(6, 182, 212, 0.2)" }}>
        <h2 style={{ marginBottom: "2rem" }}>Supported Currencies</h2>
        <div style={{ display: "flex", justifyContent: "center", gap: "4rem", flexWrap: "wrap", color: "var(--text-primary)" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "2.5rem", fontWeight: "bold", background: "linear-gradient(to bottom, #f59e0b, #d97706)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>₿</div>
            <div style={{ marginTop: "0.5rem", fontWeight: "500" }}>Bitcoin</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "2.5rem", fontWeight: "bold", background: "linear-gradient(to bottom, #6366f1, #4f46e5)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Ξ</div>
            <div style={{ marginTop: "0.5rem", fontWeight: "500" }}>Ethereum</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "2.5rem", fontWeight: "bold", background: "linear-gradient(to bottom, #06b6d4, #0284c7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>◎</div>
            <div style={{ marginTop: "0.5rem", fontWeight: "500" }}>Solana</div>
          </div>
        </div>
      </div>
    </div>
  );
}
