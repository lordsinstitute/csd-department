export default function About() {
  return (
    <div className="page-container fade-in">
      <div className="page-hero">
        <h1 style={{ fontSize: "3rem" }}>About CryptoVista Analytics</h1>
        <p className="page-subtitle" style={{ maxWidth: "800px", margin: "0.5rem auto 0" }}>
          An intuitive platform to help you understand cryptocurrency trends and make informed decisions.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "2rem", maxWidth: "900px", margin: "0 auto" }}>
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
            <div style={{ fontSize: "2rem" }}>🌐</div>
            <h2 style={{ margin: 0 }}>What is Cryptocurrency?</h2>
          </div>
          <p style={{ fontSize: "1.05rem", lineHeight: 1.7 }}>
            Cryptocurrency is a digital or virtual form of money that uses cryptography for security. 
            Unlike traditional currencies issued by governments (like the US Dollar), cryptocurrencies 
            operate on decentralized networks based on blockchain technology.
          </p>
        </div>

        <div className="card">
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
            <div style={{ fontSize: "2rem" }}>💱</div>
            <h2 style={{ margin: 0 }}>Buying and Selling Crypto</h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div style={{ background: "rgba(16, 185, 129, 0.05)", padding: "1.25rem", borderRadius: "8px", borderLeft: "4px solid var(--accent-green)" }}>
              <h3 style={{ color: "var(--accent-green)", marginBottom: "0.5rem" }}>Buying</h3>
              <p style={{ margin: 0 }}>When you buy cryptocurrency, you exchange traditional money for digital coins (like Bitcoin or Ethereum), hoping their value might increase over time.</p>
            </div>
            
            <div style={{ background: "rgba(239, 68, 68, 0.05)", padding: "1.25rem", borderRadius: "8px", borderLeft: "4px solid var(--accent-red)" }}>
              <h3 style={{ color: "var(--accent-red)", marginBottom: "0.5rem" }}>Selling</h3>
              <p style={{ margin: 0 }}>When you sell, you exchange your digital coins back to traditional money or another cryptocurrency, often to secure a profit.</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
            <div style={{ fontSize: "2rem" }}>🎯</div>
            <h2 style={{ margin: 0 }}>How This Project Helps You</h2>
          </div>
          <p style={{ fontSize: "1.05rem", lineHeight: 1.7 }}>
            If you are new to the world of crypto, the fast-moving numbers and complex charts can be overwhelming. 
            <strong style={{ color: "var(--text-primary)" }}> CryptoVista Analytics</strong> simplifies this by:
          </p>
          <ul style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1.5rem", marginBottom: "1.5rem", listStyleType: "none", padding: 0 }}>
            <li style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
              <span style={{ color: "var(--accent-primary)", fontSize: "1.25rem" }}>✓</span>
              <div>
                <strong style={{ color: "var(--text-primary)" }}>Clear Visualizations:</strong> We show you market trends in easy-to-read charts.
              </div>
            </li>
            <li style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
              <span style={{ color: "var(--accent-primary)", fontSize: "1.25rem" }}>✓</span>
              <div>
                <strong style={{ color: "var(--text-primary)" }}>AI Predictions:</strong> Our machine learning algorithms analyze past data to forecast where prices might go next.
              </div>
            </li>
            <li style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
              <span style={{ color: "var(--accent-primary)", fontSize: "1.25rem" }}>✓</span>
              <div>
                <strong style={{ color: "var(--text-primary)" }}>Market Insights:</strong> We provide straightforward explanations of market conditions ("Bullish" or "Bearish") so you understand the broader context.
              </div>
            </li>
          </ul>
          <p style={{ fontSize: "1.05rem", lineHeight: 1.7, margin: 0, padding: "1.5rem", background: "rgba(0, 0, 0, 0.03)", borderRadius: "8px" }}>
            By translating complex data into simple insights, we help you understand market behavior and build confidence in making informed decisions.
          </p>
        </div>
      </div>
    </div>
  );
}
