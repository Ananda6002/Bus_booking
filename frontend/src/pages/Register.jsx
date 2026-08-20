import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container page-section" style={{ maxWidth: 460 }}>
      <h2 className="section-title">Create your account</h2>
      <div className="card">
        {error && <div className="error-banner">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="field" style={{ marginBottom: 14 }}>
            <label>Full name</label>
            <input required value={form.fullName} onChange={update("fullName")} />
          </div>
          <div className="field" style={{ marginBottom: 14 }}>
            <label>Email</label>
            <input type="email" required value={form.email} onChange={update("email")} />
          </div>
          <div className="field" style={{ marginBottom: 14 }}>
            <label>Phone (10 digits)</label>
            <input required pattern="\d{10}" maxLength={10} value={form.phone} onChange={update("phone")} />
          </div>
          <div className="form-row" style={{ marginBottom: 20 }}>
            <div className="field">
              <label>Password</label>
              <input type="password" required minLength={6} value={form.password} onChange={update("password")} />
            </div>
            <div className="field">
              <label>Confirm password</label>
              <input
                type="password"
                required
                minLength={6}
                value={form.confirmPassword}
                onChange={update("confirmPassword")}
              />
            </div>
          </div>
          <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>
        <p style={{ marginTop: 16, fontSize: "0.9rem" }}>
          Already have an account? <Link to="/login" style={{ color: "var(--amber-deep)", fontWeight: 600 }}>Log in</Link>
        </p>
      </div>
    </div>
  );
}
