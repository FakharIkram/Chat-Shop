import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useHistory } from "react-router-dom";
import { ChatState } from "../../Context/ChatProvider";
import { getSender } from "../../config/ChatLogics";
import UserListItem from "../userAvatar/UserListItem";
import ProfileModal from "./ProfileModal";
import EditProfileModal from "./EditProfileModal";

function SideDrawer() {
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifMenuOpen, setNotifMenuOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);

  const { setSelectedChat, user, notification, setNotification, chats, setChats } = ChatState();
  const history = useHistory();
  const menuRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setUserMenuOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    history.push("/");
  };

  const handleSearch = async () => {
    if (!search) return;
    try {
      setLoading(true);
      const { data } = await axios.get(`/api/user?search=${search}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setLoading(false);
      setSearchResult(data);
    } catch {
      setLoading(false);
    }
  };

  const accessChat = async (userId) => {
    try {
      setLoadingChat(true);
      const { data } = await axios.post("/api/chat", { userId }, {
        headers: { "Content-type": "application/json", Authorization: `Bearer ${user.token}` },
      });
      if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);
      setSelectedChat(data);
      setLoadingChat(false);
      setDrawerOpen(false);
      setSearch("");
      setSearchResult([]);
    } catch {
      setLoadingChat(false);
    }
  };

  const getInitials = (name) => name ? name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0,2) : "?";

  return (
    <>
      {/* ── Top Navbar ── */}
      <div className="navbar">
        <div className="navbar-brand">
          <div className="navbar-brand-dot" />
          Chat-Shop
        </div>

        <div className="navbar-actions">
          {/* Search */}
          <button className="nav-search-btn" onClick={() => setDrawerOpen(true)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            Search users
          </button>

          {/* Notifications */}
          <div style={{position:"relative"}} ref={notifRef}>
            <button className="nav-icon-btn" onClick={() => setNotifMenuOpen(!notifMenuOpen)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              {notification.length > 0 && (
                <span className="notif-badge">{notification.length > 9 ? "9+" : notification.length}</span>
              )}
            </button>
            {notifMenuOpen && (
              <div className="dropdown-menu" style={{right:0, minWidth:"220px"}}>
                {notification.length === 0
                  ? <div className="dropdown-item" style={{color:"var(--text-muted)", cursor:"default"}}>No new messages</div>
                  : notification.map((notif) => (
                    <div key={notif._id} className="dropdown-item" onClick={() => {
                      setSelectedChat(notif.chat);
                      setNotification(notification.filter((n) => n !== notif));
                      setNotifMenuOpen(false);
                    }}>
                      💬 {notif.chat.isGroupChat
                        ? `New msg in ${notif.chat.chatName}`
                        : `New msg from ${getSender(user, notif.chat.users)}`}
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* User Menu */}
          <div style={{position:"relative"}} ref={menuRef}>
            <button
              style={{
                display:"flex", alignItems:"center", gap:"8px",
                background:"var(--bg-tertiary)", border:"1px solid var(--border)",
                borderRadius:"10px", padding:"6px 10px", cursor:"pointer", transition:"all 0.2s"
              }}
              onClick={() => setUserMenuOpen(!userMenuOpen)}
            >
              <div style={{
                width:"28px", height:"28px", borderRadius:"8px",
                background:"linear-gradient(135deg, var(--accent), #9B8DF9)",
                display:"flex", alignItems:"center", justifyContent:"center",
                color:"#fff", fontSize:"11px", fontWeight:"600", overflow:"hidden"
              }}>
                {user?.pic
                  ? <img src={user.pic} alt={user.name} style={{width:"100%",height:"100%",objectFit:"cover"}} />
                  : getInitials(user?.name)}
              </div>
              <span style={{fontSize:"13px", color:"var(--text-primary)", fontWeight:"500", maxWidth:"90px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}}>
                {user?.name}
              </span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>

            {userMenuOpen && (
              <div className="dropdown-menu">
                <div className="dropdown-item" onClick={() => { setProfileModalOpen(true); setUserMenuOpen(false); }}>
                  👤 My Profile
                </div>
                <div className="dropdown-item" onClick={() => { setEditProfileOpen(true); setUserMenuOpen(false); }}>
                  ✏️ Edit Profile
                </div>
                <div className="dropdown-divider" />
                <div className="dropdown-item danger" onClick={logoutHandler}>
                  🚪 Logout
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Search Drawer ── */}
      {drawerOpen && (
        <>
          <div className="drawer-overlay" onClick={() => { setDrawerOpen(false); setSearch(""); setSearchResult([]); }} />
          <div className="drawer-panel">
            <div className="drawer-title">Find People</div>
            <div className="drawer-search-row">
              <input
                className="drawer-search-input"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                autoFocus
              />
              <button className="drawer-go-btn" onClick={handleSearch}>Search</button>
            </div>

            <div style={{flex:1, overflowY:"auto"}}>
              {loading
                ? <div style={{color:"var(--text-muted)", fontSize:"13px", padding:"12px"}}>Searching...</div>
                : searchResult.map((u) => (
                  <UserListItem key={u._id} user={u} handleFunction={() => accessChat(u._id)} />
                ))}
              {loadingChat && <div style={{color:"var(--text-muted)", fontSize:"13px", padding:"12px"}}>Opening chat...</div>}
            </div>
          </div>
        </>
      )}

      {/* ── Profile Modal ── */}
      {profileModalOpen && <ProfileModal user={user} isOpen={profileModalOpen} onClose={() => setProfileModalOpen(false)} />}

      {/* ── Edit Profile Modal ── */}
      {editProfileOpen && <EditProfileModal isOpen={editProfileOpen} onClose={() => setEditProfileOpen(false)} />}
    </>
  );
}

export default SideDrawer;