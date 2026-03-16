import { useState } from "react";
import axios from "axios";
import { useHistory } from "react-router-dom";
import { ChatState } from "../../Context/ChatProvider";

const Login = () => {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const history = useHistory();
  const { setUser } = ChatState();

  const submitHandler = async () => {
    setError("");
    if (!email || !password) { setError("Please fill in all fields."); return; }
    setLoading(true);
    try {
      const { data } = await axios.post(
        "/api/user/login",
        { email, password },
        { headers: { "Content-type": "application/json" } }
      );
      setUser(data);
      localStorage.setItem("userInfo", JSON.stringify(data));
      setLoading(false);
      history.push("/chats");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => { if (e.key === "Enter") submitHandler(); };

  return (
    <div>
      {error && (
        <div style={{
          background: "rgba(248,81,73,0.1)", border: "1px solid rgba(248,81,73,0.3)",
          borderRadius: "10px", padding: "10px 14px", marginBottom: "16px",
          color: "#F85149", fontSize: "13px"
        }}>
          {error}
        </div>
      )}

      <div className="form-group">
        <label className="form-label">Email Address</label>
        <input
          className="form-input"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Password</label>
        <div className="form-input-wrap">
          <input
            className="form-input"
            type={show ? "text" : "password"}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button className="show-btn" onClick={() => setShow(!show)}>
            {show ? "Hide" : "Show"}
          </button>
        </div>
      </div>

      <button className="btn-primary" onClick={submitHandler} disabled={loading}>
        {loading ? "Signing in..." : "Sign In"}
      </button>

      <button
        className="btn-ghost"
        onClick={() => { setEmail("guest@example.com"); setPassword("123456"); }}
      >
        🎭 Use Guest Credentials
      </button>
    </div>
  );
};

export default Login;