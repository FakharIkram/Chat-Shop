import { useEffect, useState } from "react";
import { useHistory } from "react-router";
import Login from "../components/Authentication/Login";
import Signup from "../components/Authentication/Signup";

function Homepage() {
  const history = useHistory();
  const [activeTab, setActiveTab] = useState("login");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userInfo"));
    if (user) history.push("/chats");
  }, [history]);

  return (
    <div className="home-wrapper">
      <div className="home-glow" />
      <div className="home-glow-2" />
      <div className="home-card">
        <div className="home-logo">
          <div className="home-logo-icon">💬</div>
          <span className="home-logo-text">Chat-Shop</span>
        </div>
        <div className="tab-bar">
          <button
            className={`tab-btn ${activeTab === "login" ? "active" : ""}`}
            onClick={() => setActiveTab("login")}
          >
            Sign In
          </button>
          <button
            className={`tab-btn ${activeTab === "signup" ? "active" : ""}`}
            onClick={() => setActiveTab("signup")}
          >
            Create Account
          </button>
        </div>
        {activeTab === "login"
          ? <Login />
          : <Signup onRegistered={() => setActiveTab("login")} />
        }
      </div>
    </div>
  );
}

export default Homepage;