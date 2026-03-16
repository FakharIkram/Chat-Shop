import { useDisclosure } from "@chakra-ui/hooks";
import {
  Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalFooter, ModalBody, ModalCloseButton, Button, Text, Image,
} from "@chakra-ui/react";

const ProfileModal = ({ user, children, isOpen: controlledIsOpen, onClose: controlledOnClose }) => {
  const { isOpen: internalIsOpen, onOpen, onClose: internalOnClose } = useDisclosure();
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const onClose = controlledOnClose || internalOnClose;

  return (
    <>
      {children && <span onClick={onOpen}>{children}</span>}
      <Modal size="sm" onClose={onClose} isOpen={isOpen} isCentered>
        <ModalOverlay backdropFilter="blur(4px)" bg="rgba(0,0,0,0.7)" />
        <ModalContent bg="#161B22" border="1px solid #30363D" borderRadius="18px" color="#E6EDF3">
          <ModalHeader
            fontFamily="'Sora', sans-serif"
            fontSize="22px"
            fontWeight="700"
            textAlign="center"
            pt={6} pb={2}
          >
            {user?.name}
          </ModalHeader>
          <ModalCloseButton color="#8B949E" />
          <ModalBody display="flex" flexDir="column" alignItems="center" gap={4} pb={6}>
            <Image
              borderRadius="full"
              boxSize="120px"
              src={user?.pic}
              alt={user?.name}
              border="3px solid #7C6AF7"
            />
            <Text fontSize="14px" color="#8B949E" bg="#1C2128" px={4} py={2} borderRadius="10px" w="100%" textAlign="center">
              📧 {user?.email}
            </Text>
          </ModalBody>
          <ModalFooter justifyContent="center" pb={5}>
            <Button
              onClick={onClose}
              bg="#21262D" color="#E6EDF3"
              _hover={{ bg: "#2D333B" }}
              borderRadius="10px"
              size="sm"
            >
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ProfileModal;