import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const closeMenu = () => setMenuOpen(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/");
      closeMenu();
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  return (
    <nav className="navbar">
      {/* Logo */}
      <Link to="/" className="logo" onClick={closeMenu}>
        CryptoVista Analytics
      </Link>

      {/* Navigation Links */}
      <div className={`nav-links ${menuOpen ? "active" : ""}`}>
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
          onClick={closeMenu}
        >
          Home
        </NavLink>

        {user ? (
          <>
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                isActive ? "nav-item active" : "nav-item"
              }
              onClick={closeMenu}
            >
              Dashboard
            </NavLink>

            <NavLink
              to="/intelligence"
              className={({ isActive }) =>
                isActive ? "nav-item active" : "nav-item"
              }
              onClick={closeMenu}
            >
              Intelligence
            </NavLink>
          </>
        ) : null}

        <NavLink
          to="/about"
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
          onClick={closeMenu}
        >
          About
        </NavLink>

        {user ? (
          <button
            onClick={handleSignOut}
            className="btn btn-secondary"
            style={{
              padding: "0.5rem 1rem",
              fontSize: "0.9rem",
              marginLeft: "1rem"
            }}
          >
            Logout
          </button>
        ) : (
          <NavLink
            to="/login"
            className="btn btn-primary"
            style={{
              padding: "0.5rem 1.5rem",
              fontSize: "0.95rem",
              marginLeft: "1rem",
              textDecoration: "none"
            }}
            onClick={closeMenu}
          >
            Sign In
          </NavLink>
        )}
      </div>

      {/* Mobile Toggle */}
      <button
        className="menu-toggle"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle Menu"
      >
        {menuOpen ? "✕" : "☰"}
      </button>
    </nav>
  );
}
