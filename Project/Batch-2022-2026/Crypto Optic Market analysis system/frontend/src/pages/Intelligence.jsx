import { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://cryptovista-backend.onrender.com";

export default function Intelligence() {
  const [selectedCoin, setSelectedCoin] = useState("btc");
  const [insight, setInsight] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchInsight = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/llm/${selectedCoin}-summary`);
      const data = await res.json();
      setInsight(data.insight);
    } catch (err) {
      console.error("LLM fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsight();
  }, [selectedCoin]);

  return (
    <div className="page-container fade-in">
      <div className="page-hero">
        <h1 style={{ fontSize: "2.5rem" }}>AI Market Intelligence</h1>
        <p className="page-subtitle">
          Structured qualitative insights generated using large language models.
        </p>
      </div>

      <div className="card" style={{ marginBottom: "2rem", display: "flex", alignItems: "center", gap: "1rem" }}>
        <span style={{ fontWeight: 500, color: "var(--text-primary)" }}>Select Asset:</span>
        <select
          className="coin-select"
          value={selectedCoin}
          onChange={(e) => setSelectedCoin(e.target.value)}
        >
          <option value="btc">Bitcoin (BTC)</option>
          <option value="eth">Ethereum (ETH)</option>
          <option value="sol">Solana (SOL)</option>
        </select>
      </div>

      {loading && <div className="loading" style={{ minHeight: "200px" }}>Generating AI analysis...</div>}

      {!loading && insight && (
        <div className="card intelligence-card fade-in">
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
            <div style={{ fontSize: "2.5rem" }}>🤖</div>
            <div>
              <h2 style={{ marginBottom: "0.25rem" }}>Market Regime</h2>
              <div className={`badge ${insight.market_regime === "Trending" ? "badge-success" : "badge-warning"}`} style={{ fontSize: "1rem", padding: "0.5rem 1rem" }}>
                {insight.market_regime}
              </div>
            </div>
          </div>

          <div className="intelligence-grid" style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1.5rem",
            marginBottom: "3rem"
          }}>
            <div style={{ background: "rgba(6, 182, 212, 0.05)", padding: "1.5rem", borderRadius: "12px", border: "1px solid rgba(6, 182, 212, 0.15)" }}>
              <span style={{ color: "var(--text-muted)", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Momentum</span>
              <strong style={{ display: "block", marginTop: "0.5rem", fontSize: "1.25rem", color: "var(--text-primary)" }}>{insight.momentum}</strong>
            </div>
            <div style={{ background: "rgba(99, 102, 241, 0.05)", padding: "1.5rem", borderRadius: "12px", border: "1px solid rgba(99, 102, 241, 0.15)" }}>
              <span style={{ color: "var(--text-muted)", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Volatility</span>
              <strong style={{ display: "block", marginTop: "0.5rem", fontSize: "1.25rem", color: "var(--text-primary)" }}>{insight.volatility_state}</strong>
            </div>
            <div style={{ background: "rgba(239, 68, 68, 0.05)", padding: "1.5rem", borderRadius: "12px", border: "1px solid rgba(239, 68, 68, 0.15)" }}>
              <span style={{ color: "var(--text-muted)", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Risk Outlook</span>
              <strong style={{ display: "block", marginTop: "0.5rem", fontSize: "1.25rem", color: "var(--text-primary)" }}>{insight.risk_outlook}</strong>
            </div>
          </div>

          <div style={{ background: "rgba(0, 0, 0, 0.03)", padding: "2rem", borderRadius: "12px", marginBottom: "1.5rem" }}>
            <h3 style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem", color: "var(--accent-primary)" }}>
              <span>💡</span> Key Insight
            </h3>
            <p style={{ fontSize: "1.1rem", lineHeight: 1.7, color: "var(--text-primary)", margin: 0 }}>
              {insight.key_insight}
            </p>
          </div>

          <div style={{ background: "rgba(239, 68, 68, 0.05)", padding: "1.5rem", borderRadius: "12px", borderLeft: "4px solid var(--accent-red)" }}>
            <h3 style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem", color: "var(--accent-red)", fontSize: "1rem" }}>
              <span>⚠️</span> Risk Consideration
            </h3>
            <p style={{ margin: 0, color: "var(--text-primary)" }}>{insight.caution}</p>
          </div>
        </div>
      )}
    </div>
  );
}
