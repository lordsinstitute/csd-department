import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Login() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isSignUp) {
        const { user } = await signUp(form.email, form.password);

        setError("Account created! You can now sign in.");
        setIsSignUp(false);
      } else {
        await signIn(form.email, form.password);
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container fade-in" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
      <div className="auth-card" style={{ width: "100%", maxWidth: "450px" }}>

        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h2 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>
            {isSignUp ? "Create Account" : "Sign In"}
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
            {isSignUp ? "Join CryptoVista to unlock advanced analytics." : "Welcome back to CryptoVista Analytics."}
          </p>
        </div>

        {error && (
          <div
            className="error fade-in"
            style={{
              marginBottom: "1.5rem",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              className="input"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              className="input"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              required
              disabled={loading}
              minLength={6}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", marginTop: "1rem", padding: "0.85rem" }}
            disabled={loading}
          >
            {loading
              ? "Loading..."
              : isSignUp
              ? "Sign Up"
              : "Sign In"}
          </button>
        </form>

        {/* Toggle Section */}
        <div style={{ marginTop: "2rem", textAlign: "center", fontSize: "0.95rem", color: "var(--text-muted)" }}>
          {isSignUp ? (
            <>
              Already have an account?{" "}
              <span
                style={{ color: "var(--accent-primary)", cursor: "pointer", fontWeight: 600 }}
                onClick={() => {
                  setIsSignUp(false);
                  setError("");
                }}
              >
                Sign In
              </span>
            </>
          ) : (
            <>
              Don’t have an account?{" "}
              <span
                style={{ color: "var(--accent-primary)", cursor: "pointer", fontWeight: 600 }}
                onClick={() => {
                  setIsSignUp(true);
                  setError("");
                }}
              >
                Create one
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}