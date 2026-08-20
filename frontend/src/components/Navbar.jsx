import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="brand">
          <span className="brand-mark" />
          SmartBus
        </Link>
        <nav className="nav-links">
          {user ? (
            <>
              <Link to="/my-bookings">My Bookings</Link>
              <span>Hi, {user.fullName.split(" ")[0]}</span>
              <button
                onClick={() => {
                  logout();
                  navigate("/");
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register" className="nav-cta">
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
