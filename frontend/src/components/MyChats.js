import { useEffect, useState } from "react";
import axios from "axios";
import { getSender } from "../config/ChatLogics";
import { ChatState } from "../Context/ChatProvider";
import GroupChatModal from "./miscellaneous/GroupChatModal";

const MyChats = ({ fetchAgain }) => {
  const [loggedUser, setLoggedUser] = useState();
  const { selectedChat, setSelectedChat, user, chats, setChats } = ChatState();

  const fetchChats = async () => {
    try {
      const { data } = await axios.get("/api/chat", {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setChats(data);
    } catch {}
  };

  useEffect(() => {
    setLoggedUser(JSON.parse(localStorage.getItem("userInfo")));
    fetchChats();
    // eslint-disable-next-line
  }, [fetchAgain]);

  const getInitials = (name) =>
    name ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "?";

  return (
    <div className="sidebar">
      {/* Header */}
      <div className="sidebar-header">
        <span className="sidebar-title">Messages</span>
        <GroupChatModal>
          <button className="sidebar-new-btn">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            New Group
          </button>
        </GroupChatModal>
      </div>

      {/* Chat List */}
      <div className="sidebar-list">
        {!chats ? (
          <div style={{ padding: "16px", color: "var(--text-muted)", fontSize: "13px" }}>
            Loading chats...
          </div>
        ) : chats.length === 0 ? (
          <div style={{ padding: "24px 16px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
            No conversations yet.<br />Search for someone to start chatting.
          </div>
        ) : (
          chats.map((chat) => {
            const isActive = selectedChat?._id === chat._id;
            const chatName = chat.isGroupChat ? chat.chatName : getSender(loggedUser, chat.users);
            const preview = chat.latestMessage
              ? `${chat.latestMessage.sender.name}: ${chat.latestMessage.content.slice(0, 40)}${chat.latestMessage.content.length > 40 ? "..." : ""}`
              : "No messages yet";

            return (
              <div
                key={chat._id}
                className={`chat-item ${isActive ? "active" : ""}`}
                onClick={() => setSelectedChat(chat)}
              >
                <div className="chat-item-avatar">
                  {!chat.isGroupChat && chat.users?.find(u => u._id !== loggedUser?._id)?.pic
                    ? <img src={chat.users.find(u => u._id !== loggedUser?._id).pic} alt={chatName} />
                    : getInitials(chatName)}
                </div>
                <div className="chat-item-info">
                  <div className="chat-item-name">{chatName}</div>
                  <div className="chat-item-preview">{preview}</div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default MyChats;