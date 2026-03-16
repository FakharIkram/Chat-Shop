import ScrollableFeed from "react-scrollable-feed";
import { isSameSender, isLastMessage, isSameUser } from "../config/ChatLogics";
import { ChatState } from "../Context/ChatProvider";

const ScrollableChat = ({ messages }) => {
  const { user } = ChatState();

  const getInitials = (name) =>
    name ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "?";

  return (
    <ScrollableFeed>
      {messages?.map((m, i) => {
        const isSent = m.sender._id === user._id;
        const showAvatar = !isSent && (isSameSender(messages, m, i, user._id) || isLastMessage(messages, i, user._id));
        const compactTop = isSameUser(messages, m, i, user._id);

        return (
          <div
            key={m._id}
            className={`msg-row ${isSent ? "sent" : "recv"}`}
            style={{ marginTop: compactTop ? "2px" : "12px" }}
          >
            {/* Avatar for received messages */}
            {!isSent && (
              showAvatar ? (
                <div
                  className="msg-avatar"
                  title={m.sender.name}
                  style={{ cursor: "pointer" }}
                >
                  {m.sender.pic
                    ? <img src={m.sender.pic} alt={m.sender.name} style={{width:"100%",height:"100%",objectFit:"cover"}} />
                    : getInitials(m.sender.name)}
                </div>
              ) : (
                <div className="msg-avatar-placeholder" />
              )
            )}

            {/* Bubble */}
            <div className={`msg-bubble ${isSent ? "sent" : "recv"}`}>
              {/* Sender name for group chats */}
              {!isSent && !isSameUser(messages, m, i, user._id) && (
                <div style={{
                  fontSize: "11px", fontWeight: "600",
                  color: "var(--accent)", marginBottom: "4px"
                }}>
                  {m.sender.name}
                </div>
              )}
              {m.content}
            </div>
          </div>
        );
      })}
    </ScrollableFeed>
  );
};

export default ScrollableChat;