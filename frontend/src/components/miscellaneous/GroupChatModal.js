import { useState } from "react";
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody,
  ModalCloseButton, Button, useDisclosure, FormControl, Input, useToast, Box,
} from "@chakra-ui/react";
import axios from "axios";
import { ChatState } from "../../Context/ChatProvider";
import UserBadgeItem from "../userAvatar/UserBadgeItem";
import UserListItem from "../userAvatar/UserListItem";

const darkInput = {
  bg: "#1C2128", border: "1px solid #30363D", color: "#E6EDF3",
  _placeholder: { color: "#484F58" },
  _focus: { border: "1px solid #7C6AF7", boxShadow: "0 0 0 3px rgba(124,106,247,0.15)" },
  borderRadius: "10px",
};

const GroupChatModal = ({ children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [groupChatName, setGroupChatName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const { user, chats, setChats } = ChatState();

  const handleGroup = (userToAdd) => {
    if (selectedUsers.find((u) => u._id === userToAdd._id)) {
      toast({ title: "User already added", status: "warning", duration: 3000, isClosable: true }); return;
    }
    setSelectedUsers([...selectedUsers, userToAdd]);
  };

  const handleSearch = async (query) => {
    setSearch(query);
    if (!query) return;
    try {
      setLoading(true);
      const { data } = await axios.get(`/api/user?search=${query}`, { headers: { Authorization: `Bearer ${user.token}` } });
      setLoading(false);
      setSearchResult(data);
    } catch { setLoading(false); }
  };

  const handleDelete = (delUser) => setSelectedUsers(selectedUsers.filter((sel) => sel._id !== delUser._id));

  const handleSubmit = async () => {
    if (!groupChatName || selectedUsers.length < 2) {
      toast({ title: "Please fill all fields and add at least 2 users", status: "warning", duration: 4000, isClosable: true }); return;
    }
    try {
      const { data } = await axios.post("/api/chat/group",
        { name: groupChatName, users: JSON.stringify(selectedUsers.map((u) => u._id)) },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setChats([data, ...chats]);
      onClose();
      setGroupChatName(""); setSelectedUsers([]); setSearchResult([]);
      toast({ title: "Group Chat Created!", status: "success", duration: 3000, isClosable: true });
    } catch (error) {
      toast({ title: "Failed to Create!", description: error.response?.data, status: "error", duration: 4000, isClosable: true });
    }
  };

  return (
    <>
      <span onClick={onOpen}>{children}</span>
      <Modal onClose={onClose} isOpen={isOpen} isCentered scrollBehavior="inside">
        <ModalOverlay backdropFilter="blur(4px)" bg="rgba(0,0,0,0.7)" />
        <ModalContent bg="#161B22" border="1px solid #30363D" borderRadius="18px" color="#E6EDF3" maxH="80vh">
          <ModalHeader fontFamily="'Sora', sans-serif" textAlign="center" fontSize="20px" fontWeight="700">
            Create Group Chat
          </ModalHeader>
          <ModalCloseButton color="#8B949E" />
          <ModalBody display="flex" flexDir="column" gap={4} overflowY="auto">
            <FormControl>
              <Input {...darkInput} placeholder="Group name..." value={groupChatName} onChange={(e) => setGroupChatName(e.target.value)} />
            </FormControl>
            <FormControl>
              <Input {...darkInput} placeholder="Search users to add..." onChange={(e) => handleSearch(e.target.value)} />
            </FormControl>
            {selectedUsers.length > 0 && (
              <Box display="flex" flexWrap="wrap" gap={2}>
                {selectedUsers.map((u) => (
                  <UserBadgeItem key={u._id} user={u} handleFunction={() => handleDelete(u)} />
                ))}
              </Box>
            )}
            {loading
              ? <div style={{ color: "var(--text-muted)", fontSize: "13px" }}>Searching...</div>
              : searchResult.slice(0, 4).map((u) => (
                <UserListItem key={u._id} user={u} handleFunction={() => handleGroup(u)} />
              ))}
          </ModalBody>
          <ModalFooter borderTop="1px solid #30363D" gap={2}>
            <Button onClick={onClose} bg="#21262D" color="#E6EDF3" _hover={{ bg: "#2D333B" }} borderRadius="10px">
              Cancel
            </Button>
            <Button onClick={handleSubmit} bg="#7C6AF7" color="white" _hover={{ bg: "#9B8DF9" }} borderRadius="10px">
              Create Group
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default GroupChatModal;