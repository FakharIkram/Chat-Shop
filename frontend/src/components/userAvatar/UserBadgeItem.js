const UserBadgeItem = ({ user, handleFunction, admin }) => {
  return (
    <div
      onClick={handleFunction}
      style={{
        display: "inline-flex", alignItems: "center", gap: "6px",
        padding: "4px 10px 4px 8px",
        background: "rgba(124,106,247,0.15)",
        border: "1px solid rgba(124,106,247,0.3)",
        borderRadius: "99px",
        cursor: "pointer",
        fontSize: "12px",
        fontWeight: "500",
        color: "#9B8DF9",
        transition: "all 0.15s",
        fontFamily: "'DM Sans', sans-serif",
        whiteSpace: "nowrap",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(124,106,247,0.25)"; e.currentTarget.style.color = "#fff"; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(124,106,247,0.15)"; e.currentTarget.style.color = "#9B8DF9"; }}
    >
      {user.name}
      {admin?._id === user._id && (
        <span style={{ fontSize: "10px", opacity: 0.7 }}>(Admin)</span>
      )}
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    </div>
  );
};

export default UserBadgeItem;