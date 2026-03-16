import { useState } from "react";
import axios from "axios";
import { useHistory } from "react-router";

const Signup = ({ onRegistered }) => {
  const [show, setShow] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmpassword, setConfirmpassword] = useState("");
  const [pic, setPic] = useState("");
  const [picLoading, setPicLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [picName, setPicName] = useState("");

  const history = useHistory();

  const postDetails = (pics) => {
    if (!pics) return;
    if (pics.type !== "image/jpeg" && pics.type !== "image/png") {
      setError("Please select a JPEG or PNG image.");
      return;
    }
    setPicLoading(true);
    setPicName(pics.name);
    const data = new FormData();
    data.append("file", pics);
    data.append("upload_preset", "chat-app");
    data.append("cloud_name", "piyushproj");
    fetch("https://api.cloudinary.com/v1_1/piyushproj/image/upload", { method: "post", body: data })
      .then((res) => res.json())
      .then((data) => { setPic(data.url.toString()); setPicLoading(false); })
      .catch(() => { setError("Image upload failed."); setPicLoading(false); });
  };

  const submitHandler = async () => {
    setError("");
    if (!name || !email || !password || !confirmpassword) {
      setError("Please fill in all required fields.");
      return;
    }
    if (password !== confirmpassword) { setError("Passwords do not match."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }

    setLoading(true);
    try {
      await axios.post(
        "/api/user",
        { name, email, password, pic },
        { headers: { "Content-type": "application/json" } }
      );
      setName(""); setEmail(""); setPassword(""); setConfirmpassword(""); setPic(""); setPicName("");
      setLoading(false);
      if (onRegistered) onRegistered();
      else history.push("/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
      setLoading(false);
    }
  };

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
        <label className="form-label">Full Name <span style={{color:"#F85149"}}>*</span></label>
        <input className="form-input" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} />
      </div>

      <div className="form-group">
        <label className="form-label">Email Address <span style={{color:"#F85149"}}>*</span></label>
        <input className="form-input" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>

      <div className="form-group">
        <label className="form-label">Password <span style={{color:"#F85149"}}>*</span></label>
        <div className="form-input-wrap">
          <input
            className="form-input"
            type={show ? "text" : "password"}
            placeholder="Min. 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="show-btn" onClick={() => setShow(!show)}>{show ? "Hide" : "Show"}</button>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Confirm Password <span style={{color:"#F85149"}}>*</span></label>
        <div className="form-input-wrap">
          <input
            className="form-input"
            type={show ? "text" : "password"}
            placeholder="Re-enter password"
            value={confirmpassword}
            onChange={(e) => setConfirmpassword(e.target.value)}
          />
          <button className="show-btn" onClick={() => setShow(!show)}>{show ? "Hide" : "Show"}</button>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Profile Picture (optional)</label>
        <label className="file-input-label">
          <span>📎</span>
          <span>{picLoading ? "Uploading..." : picName || "Choose image file"}</span>
          <input type="file" accept="image/*" style={{display:"none"}} onChange={(e) => postDetails(e.target.files[0])} />
        </label>
      </div>

      <button className="btn-primary" onClick={submitHandler} disabled={loading || picLoading}>
        {loading ? "Creating account..." : "Create Account"}
      </button>
    </div>
  );
};

export default Signup;