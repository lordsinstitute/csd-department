import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

import CoinOverview from "./CoinOverview";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://cryptovista-backend.onrender.com";

/* -------------------------------------------------
   Coin Configuration
--------------------------------------------------*/
const COINS = {
  BTC: {
    label: "Bitcoin (BTC)",
    chartEndpoint: "/btc/chart",
    predictionEndpoint: "/btc/prediction",
    color: "#f7931a",
  },
  ETH: {
    label: "Ethereum (ETH)",
    chartEndpoint: "/eth/chart",
    predictionEndpoint: "/eth/prediction",
    color: "#627eea",
  },
  SOL: {
    label: "Solana (SOL)",
    chartEndpoint: "/sol/chart",
    predictionEndpoint: "/sol/prediction",
    color: "#14f195",
  },
};

export default function CryptoDashboard() {
  const [selectedCoin, setSelectedCoin] = useState("BTC");
  const [chartData, setChartData] = useState([]);
  const [predictionRaw, setPredictionRaw] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  /* -------------------------------------------------
     Fetch Initial Market Data
  --------------------------------------------------*/
  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      const coin = COINS[selectedCoin];

      const [chartRes, predRes] = await Promise.all([
        fetch(API_BASE + coin.chartEndpoint),
        fetch(API_BASE + coin.predictionEndpoint),
      ]);

      if (!chartRes.ok || !predRes.ok) {
        throw new Error("API response error");
      }

      const chartJson = await chartRes.json();
      const predJson = await predRes.json();

      const rawData = Array.isArray(chartJson) ? chartJson : [];
      let minVal = Math.min(...rawData.map(d => d.value));
      let maxVal = Math.max(...rawData.map(d => d.value));
      if (!isFinite(minVal) || !isFinite(maxVal)) {
        minVal = 0; maxVal = 1;
      }
      const range = maxVal - minVal || 1;

      const normalizedData = rawData.map(d => ({
        ...d,
        normalizedValue: (d.value - minVal) / range
      }));

      setChartData(normalizedData);
      setPredictionRaw(
        typeof predJson.predicted_normalized_price === "number"
          ? predJson.predicted_normalized_price
          : null
      );
    } catch (err) {
      console.error("API Error:", err);
      setError("Unable to load market data.");
      setChartData([]);
      setPredictionRaw(null);
    } finally {
      setLoading(false);
    }
  };

  /* -------------------------------------------------
     SSE Stream Subscription
  --------------------------------------------------*/
  useEffect(() => {
    fetchInitialData();

    const coin = selectedCoin.toLowerCase();
    const eventSource = new EventSource(`${API_BASE}/api/stream/${coin}`);

    eventSource.onopen = () => {
      setIsConnected(true);
      console.log(`✅ SSE connected for ${coin}`);
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.error) {
          console.error("SSE error:", data.error);
          return;
        }

        setChartData((prev) => {
          const exists = prev.some((p) => p.time === data.time);
          if (exists) return prev;

          const newArray = [...prev, data].slice(-1000);
          let minPrice = Math.min(...newArray.map(d => d.value));
          let maxPrice = Math.max(...newArray.map(d => d.value));
          if (!isFinite(minPrice) || !isFinite(maxPrice)) {
            minPrice = 0; maxPrice = 1;
          }
          const range = maxPrice - minPrice || 1;

          return newArray.map(d => ({
            ...d,
            normalizedValue: (d.value - minPrice) / range
          }));
        });
      } catch (err) {
        console.error("Error parsing SSE data:", err);
      }
    };

    eventSource.onerror = (err) => {
      console.error("SSE connection error:", err);
      setIsConnected(false);
      eventSource.close();
    };

    return () => {
      eventSource.close();
      setIsConnected(false);
    };
  }, [selectedCoin]);

  /* -------------------------------------------------
     Render
  --------------------------------------------------*/
  return (
    <>
      {/* Dynamic Coin Description */}
      <CoinOverview selectedCoin={selectedCoin} />

      {/* Chart Card */}
      <div className="card fade-in">
        {/* Header */}
        <div className="dashboard-header">
          <h2>
            {COINS[selectedCoin].label} — Normalized Price
          </h2>

          <select
            className="coin-select"
            value={selectedCoin}
            onChange={(e) => setSelectedCoin(e.target.value)}
          >
            {Object.entries(COINS).map(([key, coin]) => (
              <option key={key} value={key}>
                {coin.label}
              </option>
            ))}
          </select>
        </div>

        {/* Error State */}
        {error && <p className="error">{error}</p>}

        {/* Chart */}
        <div className="chart-box">
          {loading && chartData.length === 0 ? (
            <div className="loading"><span>Loading chart data...</span></div>
          ) : (
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                <XAxis
                  dataKey="time"
                  tickFormatter={(t) =>
                    new Date(t * 1000).toLocaleTimeString()
                  }
                  stroke="var(--text-muted)"
                  tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  stroke="var(--text-muted)"
                  domain={[0, 1]}
                  ticks={[0, 0.25, 0.5, 0.75, 1]}
                  tickFormatter={(v) => v.toFixed(2)}
                  tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  width={60}
                />
                <Tooltip
                  formatter={(value, name, props) => {
                    return [`$${props.payload.value?.toFixed(2)}`, "Exact Price"];
                  }}
                  labelFormatter={(l) =>
                    new Date(l * 1000).toLocaleTimeString()
                  }
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid rgba(0,0,0,0.1)',
                    borderRadius: '8px',
                    backdropFilter: 'blur(8px)',
                    color: 'var(--text-primary)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                  itemStyle={{ color: COINS[selectedCoin].color, fontWeight: 'bold' }}
                />
                <Line
                  type="monotone"
                  dataKey="normalizedValue"
                  stroke={COINS[selectedCoin].color}
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 6, strokeWidth: 0, fill: COINS[selectedCoin].color }}
                  isAnimationActive
                  animationDuration={300}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Prediction */}
        <div className="prediction-box">
          <span style={{ fontSize: "1.2rem" }}>🔮</span>
          <span>Predicted Next Normalized Price:</span>
          <strong style={{ marginLeft: "auto", fontSize: "1.1rem", color: "var(--accent-primary)" }}>
            {predictionRaw !== null && chartData.length > 0
              ? (() => {
                let minP = Math.min(...chartData.map(d => d.value));
                let maxP = Math.max(...chartData.map(d => d.value));
                if (!isFinite(minP) || !isFinite(maxP)) { minP = 0; maxP = 1; }
                const r = maxP - minP || 1;
                return ((predictionRaw - minP) / r).toFixed(6);
              })()
              : "Loading..."}
          </strong>
        </div>

        {/* Connection Status */}
        <div
          className="connection-status"
          style={{ marginTop: "10px", fontSize: "0.9em" }}
        >
          {isConnected ? (
            <span style={{ color: "var(--accent-green)", fontWeight: 500 }}>🟢 Live</span>
          ) : (
            <span style={{ color: "#d97706", fontWeight: 500 }}>🟡 Connecting...</span>
          )}
        </div>
      </div>
    </>
  );
}