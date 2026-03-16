import { useState } from "react";
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter,
  ModalBody, ModalCloseButton, Button, useDisclosure, useToast,
} from "@chakra-ui/react";
import axios from "axios";
import { ChatState } from "../../Context/ChatProvider";

const inputStyle = {
  width: "100%", padding: "11px 16px",
  background: "#1C2128", border: "1px solid #30363D",
  borderRadius: "10px", color: "#E6EDF3",
  fontFamily: "'DM Sans', sans-serif", fontSize: "14px",
  outline: "none", transition: "border-color 0.2s",
  boxSizing: "border-box",
};

const labelStyle = {
  display: "block", fontSize: "12px", fontWeight: "500",
  color: "#8B949E", marginBottom: "6px", letterSpacing: "0.3px",
};

const EditProfileModal = ({ children, isOpen: controlledIsOpen, onClose: controlledOnClose }) => {
  const { isOpen: internalIsOpen, onOpen, onClose: internalOnClose } = useDisclosure();
  const isOpen  = controlledIsOpen  !== undefined ? controlledIsOpen  : internalIsOpen;
  const onClose = controlledOnClose !== undefined ? controlledOnClose : internalOnClose;

  const { user, setUser } = ChatState();
  const toast = useToast();

  const [name, setName]                         = useState(user?.name || "");
  const [email, setEmail]                       = useState(user?.email || "");
  const [pic, setPic]                           = useState(user?.pic || "");
  const [picPreview, setPicPreview]             = useState(user?.pic || "");
  const [currentPassword, setCurrentPassword]  = useState("");
  const [newPassword, setNewPassword]           = useState("");
  const [confirmNewPassword, setConfirmNew]     = useState("");
  const [showCurrent, setShowCurrent]           = useState(false);
  const [showNew, setShowNew]                   = useState(false);
  const [showConfirm, setShowConfirm]           = useState(false);
  const [picLoading, setPicLoading]             = useState(false);
  const [loading, setLoading]                   = useState(false);
  const [picName, setPicName]                   = useState("");

  const handleOpen = () => {
    setName(user?.name || "");
    setEmail(user?.email || "");
    setPic(user?.pic || "");
    setPicPreview(user?.pic || "");
    setCurrentPassword(""); setNewPassword(""); setConfirmNew("");
    if (!controlledIsOpen) onOpen();
  };

  const uploadPic = (pics) => {
    if (!pics) return;
    if (pics.type !== "image/jpeg" && pics.type !== "image/png") {
      toast({ title: "Please select a JPEG or PNG", status: "warning", duration: 3000, isClosable: true }); return;
    }
    setPicLoading(true);
    setPicName(pics.name);
    const data = new FormData();
    data.append("file", pics); data.append("upload_preset", "chat-app"); data.append("cloud_name", "piyushproj");
    fetch("https://api.cloudinary.com/v1_1/piyushproj/image/upload", { method: "post", body: data })
      .then((r) => r.json())
      .then((d) => { setPic(d.url); setPicPreview(d.url); setPicLoading(false); })
      .catch(() => { toast({ title: "Image upload failed", status: "error", duration: 3000, isClosable: true }); setPicLoading(false); });
  };

  const handleSubmit = async () => {
    if (!name || !email) { toast({ title: "Name and email are required", status: "warning", duration: 3000, isClosable: true }); return; }
    if (newPassword && newPassword !== confirmNewPassword) { toast({ title: "Passwords do not match", status: "warning", duration: 3000, isClosable: true }); return; }
    if (newPassword && newPassword.length < 6) { toast({ title: "Password must be at least 6 characters", status: "warning", duration: 3000, isClosable: true }); return; }

    try {
      setLoading(true);
      const payload = { name, email, pic };
      if (newPassword) { payload.currentPassword = currentPassword; payload.newPassword = newPassword; }
      const { data } = await axios.put("/api/user/profile", payload, {
        headers: { "Content-type": "application/json", Authorization: `Bearer ${user.token}` },
      });
      localStorage.setItem("userInfo", JSON.stringify(data));
      setUser(data);
      toast({ title: "Profile updated!", status: "success", duration: 3000, isClosable: true });
      setCurrentPassword(""); setNewPassword(""); setConfirmNew("");
      setLoading(false);
      onClose();
    } catch (error) {
      toast({ title: "Update failed", description: error.response?.data?.message || "Something went wrong", status: "error", duration: 4000, isClosable: true });
      setLoading(false);
    }
  };

  const PwInput = ({ value, onChange, show, onToggle, placeholder }) => (
    <div style={{ position: "relative" }}>
      <input
        style={{ ...inputStyle, paddingRight: "60px" }}
        type={show ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onFocus={(e) => { e.target.style.borderColor = "#7C6AF7"; e.target.style.boxShadow = "0 0 0 3px rgba(124,106,247,0.15)"; }}
        onBlur={(e)  => { e.target.style.borderColor = "#30363D"; e.target.style.boxShadow = "none"; }}
      />
      <button
        onClick={onToggle}
        style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)",
          background: "transparent", border: "none", color: "#8B949E", fontSize: "12px",
          cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontWeight: "500" }}
      >
        {show ? "Hide" : "Show"}
      </button>
    </div>
  );

  return (
    <>
      {children && <span onClick={handleOpen}>{children}</span>}

      <Modal isOpen={isOpen} onClose={onClose} isCentered scrollBehavior="inside">
        <ModalOverlay backdropFilter="blur(4px)" bg="rgba(0,0,0,0.7)" />
        <ModalContent bg="#161B22" border="1px solid #30363D" borderRadius="18px" color="#E6EDF3" maxH="90vh" mx={4}>
          <ModalHeader fontFamily="'Sora', sans-serif" fontSize="20px" fontWeight="700" textAlign="center" pt={6} pb={2}>
            Edit Profile
          </ModalHeader>
          <ModalCloseButton color="#8B949E" />

          <ModalBody overflowY="auto" px={6} pt={4} pb={2}>

            {/* Avatar preview */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
              <div style={{
                width: "80px", height: "80px", borderRadius: "50%",
                border: "3px solid #7C6AF7", overflow: "hidden",
                background: "linear-gradient(135deg, #7C6AF7, #9B8DF9)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontSize: "26px", fontWeight: "700",
              }}>
                {picPreview
                  ? <img src={picPreview} alt="preview" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                  : name?.charAt(0)?.toUpperCase() || "?"}
              </div>
            </div>

            {/* Name */}
            <div style={{ marginBottom: "14px" }}>
              <label style={labelStyle}>Full Name</label>
              <input
                style={inputStyle} placeholder="Your name" value={name}
                onChange={(e) => setName(e.target.value)}
                onFocus={(e) => { e.target.style.borderColor="#7C6AF7"; e.target.style.boxShadow="0 0 0 3px rgba(124,106,247,0.15)"; }}
                onBlur={(e)  => { e.target.style.borderColor="#30363D"; e.target.style.boxShadow="none"; }}
              />
            </div>

            {/* Email */}
            <div style={{ marginBottom: "14px" }}>
              <label style={labelStyle}>Email Address</label>
              <input
                style={inputStyle} type="email" placeholder="you@example.com" value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={(e) => { e.target.style.borderColor="#7C6AF7"; e.target.style.boxShadow="0 0 0 3px rgba(124,106,247,0.15)"; }}
                onBlur={(e)  => { e.target.style.borderColor="#30363D"; e.target.style.boxShadow="none"; }}
              />
            </div>

            {/* Profile picture */}
            <div style={{ marginBottom: "20px" }}>
              <label style={labelStyle}>Profile Picture</label>
              <label style={{
                display: "flex", alignItems: "center", gap: "10px",
                padding: "10px 14px", background: "#1C2128",
                border: "1px dashed #30363D", borderRadius: "10px",
                color: "#8B949E", fontSize: "13px", cursor: "pointer",
                transition: "all 0.2s",
              }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor="#7C6AF7"; e.currentTarget.style.color="#E6EDF3"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor="#30363D"; e.currentTarget.style.color="#8B949E"; }}
              >
                <span>📎</span>
                <span>{picLoading ? "Uploading..." : picName || "Choose new photo"}</span>
                <input type="file" accept="image/*" style={{ display:"none" }} onChange={(e) => uploadPic(e.target.files[0])} />
              </label>
            </div>

            {/* Divider */}
            <div style={{ borderTop: "1px solid #21262D", marginBottom: "16px" }} />
            <div style={{ fontSize: "12px", fontWeight: "600", color: "#484F58", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "14px" }}>
              Change Password (optional)
            </div>

            {/* Current password */}
            <div style={{ marginBottom: "12px" }}>
              <label style={labelStyle}>Current Password</label>
              <PwInput value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
                show={showCurrent} onToggle={() => setShowCurrent(!showCurrent)} placeholder="Enter current password" />
            </div>

            {/* New password */}
            <div style={{ marginBottom: "12px" }}>
              <label style={labelStyle}>New Password</label>
              <PwInput value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                show={showNew} onToggle={() => setShowNew(!showNew)} placeholder="Min. 6 characters" />
            </div>

            {/* Confirm new */}
            <div style={{ marginBottom: "8px" }}>
              <label style={labelStyle}>Confirm New Password</label>
              <PwInput value={confirmNewPassword} onChange={(e) => setConfirmNew(e.target.value)}
                show={showConfirm} onToggle={() => setShowConfirm(!showConfirm)} placeholder="Re-enter new password" />
            </div>

          </ModalBody>

          <ModalFooter borderTop="1px solid #30363D" gap={3} px={6} py={4}>
            <Button onClick={onClose} bg="#21262D" color="#8B949E" _hover={{ bg:"#2D333B", color:"#E6EDF3" }}
              borderRadius="10px" fontFamily="'DM Sans', sans-serif" size="sm">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              isLoading={loading || picLoading}
              loadingText="Saving..."
              bg="linear-gradient(135deg, #7C6AF7, #9B8DF9)"
              color="white"
              _hover={{ opacity: 0.9 }}
              borderRadius="10px"
              fontFamily="'DM Sans', sans-serif"
              size="sm"
              flex={1}
            >
              Save Changes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default EditProfileModal;