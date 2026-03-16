import { useEffect, useState } from "react";
import axios from "axios";
import io from "socket.io-client";
import { getSender, getSenderFull } from "../config/ChatLogics";
import ScrollableChat from "./ScrollableChat";
import UpdateGroupChatModal from "./miscellaneous/UpdateGroupChatModal";
import ProfileModal from "./miscellaneous/ProfileModal";
import { ChatState } from "../Context/ChatProvider";

const ENDPOINT = "http://localhost:5000";
var socket, selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [istyping, setIsTyping] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [groupModalOpen, setGroupModalOpen] = useState(false);

  const { selectedChat, setSelectedChat, user, notification, setNotification } = ChatState();

  const fetchMessages = async () => {
    if (!selectedChat) return;
    try {
      setLoading(true);
      const { data } = await axios.get(`/api/message/${selectedChat._id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setMessages(data);
      setLoading(false);
      socket.emit("join chat", selectedChat._id);
    } catch {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    socket.emit("stop typing", selectedChat._id);
    try {
      const msgToSend = newMessage;
      setNewMessage("");
      const { data } = await axios.post(
        "/api/message",
        { content: msgToSend, chatId: selectedChat._id },
        { headers: { "Content-type": "application/json", Authorization: `Bearer ${user.token}` } }
      );
      socket.emit("new message", data);
      setMessages((prev) => [...prev, data]);
    } catch {}
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", user);
    socket.on("connected", () => setSocketConnected(true));
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    fetchMessages();
    selectedChatCompare = selectedChat;
    // eslint-disable-next-line
  }, [selectedChat]);

  useEffect(() => {
    socket.on("message recieved", (newMsg) => {
      if (!selectedChatCompare || selectedChatCompare._id !== newMsg.chat._id) {
        if (!notification.includes(newMsg)) {
          setNotification([newMsg, ...notification]);
          setFetchAgain(!fetchAgain);
        }
      } else {
        setMessages((prev) => [...prev, newMsg]);
      }
    });
  });

  const typingHandler = (e) => {
    setNewMessage(e.target.value);
    if (!socketConnected) return;
    if (!typing) { setTyping(true); socket.emit("typing", selectedChat._id); }
    let lastTypingTime = new Date().getTime();
    const timerLength = 3000;
    setTimeout(() => {
      if (new Date().getTime() - lastTypingTime >= timerLength && typing) {
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };

  const getInitials = (name) =>
    name ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "?";

  if (!selectedChat) {
    return (
      <div className="chat-main">
        <div className="empty-state">
          <div className="empty-icon">💬</div>
          <div className="empty-title">Select a conversation</div>
          <div className="empty-sub">Choose from your chats on the left to start messaging</div>
        </div>
      </div>
    );
  }

  const senderFull = !selectedChat.isGroupChat ? getSenderFull(user, selectedChat.users) : null;
  const chatName = selectedChat.isGroupChat
    ? selectedChat.chatName
    : getSender(user, selectedChat.users);
  const chatPic = senderFull?.pic || null;

  return (
    <div className="chat-main">
      {/* Chat Header */}
      <div className="chat-header">
        <div className="chat-header-info">
          {/* Mobile back button */}
          <button
            className="icon-btn"
            style={{ display: "none" }}
            onClick={() => setSelectedChat("")}
          >
            ←
          </button>

          <div className="chat-header-avatar">
            {chatPic
              ? <img src={chatPic} alt={chatName} style={{width:"100%",height:"100%",objectFit:"cover"}} />
              : getInitials(chatName)}
          </div>
          <div>
            <div className="chat-header-name">{chatName}</div>
            <div className="chat-header-sub">
              {selectedChat.isGroupChat
                ? `${selectedChat.users.length} members`
                : "Online"}
            </div>
          </div>
        </div>

        <div className="chat-header-actions">
          {!selectedChat.isGroupChat ? (
            <button className="icon-btn" title="View profile" onClick={() => setProfileOpen(true)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </button>
          ) : (
            <button className="icon-btn" title="Group settings" onClick={() => setGroupModalOpen(true)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="messages-area">
        {loading ? (
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", flex:1 }}>
            <div style={{ color:"var(--text-muted)", fontSize:"14px" }}>Loading messages...</div>
          </div>
        ) : (
          <div className="messages">
            <ScrollableChat messages={messages} />
          </div>
        )}
      </div>

      {/* Typing Indicator */}
      {istyping && (
        <div style={{ paddingLeft:"16px", paddingBottom:"4px" }}>
          <div className="typing-indicator">
            <div className="typing-dot" />
            <div className="typing-dot" />
            <div className="typing-dot" />
          </div>
        </div>
      )}

      {/* Input Bar */}
      <div className="msg-input-bar">
        <input
          className="msg-input"
          placeholder="Type a message..."
          value={newMessage}
          onChange={typingHandler}
          onKeyDown={handleKeyDown}
        />
        <button className="send-btn" onClick={sendMessage}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>

      {/* Modals */}
      {profileOpen && senderFull && (
        <ProfileModal user={senderFull} isOpen={profileOpen} onClose={() => setProfileOpen(false)} />
      )}
      {groupModalOpen && (
        <UpdateGroupChatModal
          isOpen={groupModalOpen}
          onClose={() => setGroupModalOpen(false)}
          fetchMessages={fetchMessages}
          fetchAgain={fetchAgain}
          setFetchAgain={setFetchAgain}
        />
      )}
    </div>
  );
};

export default SingleChat;