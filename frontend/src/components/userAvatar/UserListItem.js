const getInitials = (name) =>
  name ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "?";

const UserListItem = ({ user, handleFunction }) => {
  return (
    <div
      onClick={handleFunction}
      style={{
        display: "flex", alignItems: "center", gap: "12px",
        padding: "10px 12px", borderRadius: "10px", cursor: "pointer",
        transition: "background 0.15s", marginBottom: "4px",
      }}
      onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-hover)"}
      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
    >
      <div style={{
        width: "40px", height: "40px", borderRadius: "12px", flexShrink: 0,
        background: "linear-gradient(135deg, var(--accent), #9B8DF9)",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "#fff", fontSize: "14px", fontWeight: "600", overflow: "hidden",
      }}>
        {user.pic
          ? <img src={user.pic} alt={user.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : getInitials(user.name)}
      </div>
      <div>
        <div style={{ fontSize: "14px", fontWeight: "500", color: "var(--text-primary)" }}>{user.name}</div>
        <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{user.email}</div>
      </div>
    </div>
  );
};

export default UserListItem;