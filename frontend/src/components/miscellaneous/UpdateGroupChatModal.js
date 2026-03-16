import { useState } from "react";
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody,
  ModalCloseButton, Button, useDisclosure, FormControl, Input, useToast, Box, Spinner,
} from "@chakra-ui/react";
import axios from "axios";
import { ChatState } from "../../Context/ChatProvider";
import UserBadgeItem from "../userAvatar/UserBadgeItem";
import UserListItem from "../userAvatar/UserListItem";

const darkInput = {
  bg: "#1C2128", border: "1px solid #30363D", color: "#E6EDF3",
  _placeholder: { color: "#484F58" }, _focus: { border: "1px solid #7C6AF7", boxShadow: "0 0 0 3px rgba(124,106,247,0.15)" },
  borderRadius: "10px",
};

const UpdateGroupChatModal = ({ fetchMessages, fetchAgain, setFetchAgain, isOpen: controlledIsOpen, onClose: controlledOnClose }) => {
  const { isOpen: internalIsOpen, onOpen, onClose: internalOnClose } = useDisclosure();
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const onClose = controlledOnClose || internalOnClose;

  const [groupChatName, setGroupChatName] = useState("");
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [renameloading, setRenameLoading] = useState(false);
  const toast = useToast();
  const { selectedChat, setSelectedChat, user } = ChatState();

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

  const handleRename = async () => {
    if (!groupChatName) return;
    try {
      setRenameLoading(true);
      const { data } = await axios.put("/api/chat/rename", { chatId: selectedChat._id, chatName: groupChatName }, { headers: { Authorization: `Bearer ${user.token}` } });
      setSelectedChat(data); setFetchAgain(!fetchAgain); setRenameLoading(false); setGroupChatName("");
    } catch (error) {
      toast({ title: "Error Occured!", description: error.response?.data?.message, status: "error", duration: 5000, isClosable: true });
      setRenameLoading(false);
    }
  };

  const handleAddUser = async (user1) => {
    if (selectedChat.users.find((u) => u._id === user1._id)) {
      toast({ title: "User Already in group!", status: "error", duration: 3000, isClosable: true }); return;
    }
    if (selectedChat.groupAdmin._id !== user._id) {
      toast({ title: "Only admins can add someone!", status: "error", duration: 3000, isClosable: true }); return;
    }
    try {
      setLoading(true);
      const { data } = await axios.put("/api/chat/groupadd", { chatId: selectedChat._id, userId: user1._id }, { headers: { Authorization: `Bearer ${user.token}` } });
      setSelectedChat(data); setFetchAgain(!fetchAgain); setLoading(false);
    } catch (error) {
      toast({ title: "Error!", description: error.response?.data?.message, status: "error", duration: 3000, isClosable: true });
      setLoading(false);
    }
  };

  const handleRemove = async (user1) => {
    if (selectedChat.groupAdmin._id !== user._id && user1._id !== user._id) {
      toast({ title: "Only admins can remove someone!", status: "error", duration: 3000, isClosable: true }); return;
    }
    try {
      setLoading(true);
      const { data } = await axios.put("/api/chat/groupremove", { chatId: selectedChat._id, userId: user1._id }, { headers: { Authorization: `Bearer ${user.token}` } });
      user1._id === user._id ? setSelectedChat() : setSelectedChat(data);
      setFetchAgain(!fetchAgain); fetchMessages(); setLoading(false);
    } catch (error) {
      toast({ title: "Error!", description: error.response?.data?.message, status: "error", duration: 3000, isClosable: true });
      setLoading(false);
    }
  };

  return (
    <>
      {!controlledIsOpen && <span onClick={onOpen} style={{cursor:"pointer"}} />}
      <Modal onClose={onClose} isOpen={isOpen} isCentered scrollBehavior="inside">
        <ModalOverlay backdropFilter="blur(4px)" bg="rgba(0,0,0,0.7)" />
        <ModalContent bg="#161B22" border="1px solid #30363D" borderRadius="18px" color="#E6EDF3" maxH="80vh">
          <ModalHeader fontFamily="'Sora', sans-serif" textAlign="center" fontSize="20px" fontWeight="700">
            {selectedChat.chatName}
          </ModalHeader>
          <ModalCloseButton color="#8B949E" />
          <ModalBody display="flex" flexDir="column" gap={4} overflowY="auto">
            <Box display="flex" flexWrap="wrap" gap={2}>
              {selectedChat.users.map((u) => (
                <UserBadgeItem key={u._id} user={u} admin={selectedChat.groupAdmin} handleFunction={() => handleRemove(u)} />
              ))}
            </Box>
            <FormControl display="flex" gap={2}>
              <Input {...darkInput} placeholder="New group name" value={groupChatName} onChange={(e) => setGroupChatName(e.target.value)} />
              <Button onClick={handleRename} isLoading={renameloading} bg="#7C6AF7" color="white" _hover={{ bg: "#9B8DF9" }} borderRadius="10px" flexShrink={0}>
                Update
              </Button>
            </FormControl>
            <FormControl>
              <Input {...darkInput} placeholder="Search to add users..." onChange={(e) => handleSearch(e.target.value)} />
            </FormControl>
            {loading ? <Spinner color="#7C6AF7" alignSelf="center" /> : searchResult?.map((u) => (
              <UserListItem key={u._id} user={u} handleFunction={() => handleAddUser(u)} />
            ))}
          </ModalBody>
          <ModalFooter borderTop="1px solid #30363D" gap={2}>
            <Button onClick={() => handleRemove(user)} bg="rgba(248,81,73,0.15)" color="#F85149" _hover={{ bg: "rgba(248,81,73,0.25)" }} borderRadius="10px">
              Leave Group
            </Button>
            <Button onClick={onClose} bg="#21262D" color="#E6EDF3" _hover={{ bg: "#2D333B" }} borderRadius="10px">
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default UpdateGroupChatModal;