const ChatLoading = () => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px", padding: "8px" }}>
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          style={{
            height: "58px",
            borderRadius: "12px",
            background: "linear-gradient(90deg, #1C2128 25%, #21262D 50%, #1C2128 75%)",
            backgroundSize: "200% 100%",
            animation: `shimmer 1.5s infinite ${i * 0.1}s`,
            opacity: 1 - i * 0.1,
          }}
        />
      ))}
      <style>{`
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
};

export default ChatLoading;