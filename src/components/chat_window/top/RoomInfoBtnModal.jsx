import React, { memo, useState, useEffect } from "react";
import { Button, Modal, Tag } from "rsuite";
import { useCurrentRoom } from "../../../context/current-room.context";
import { useModalState } from "../../../misc/custom-hooks";
import { useParams } from "react-router";
import { database, auth } from "../../../misc/firebase.config";
import { ref, get } from "firebase/database";
import InviteUsersModal from "../../rooms/InviteUsersModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle, faLock, faLockOpen } from "@fortawesome/free-solid-svg-icons";

const RoomInfoBtnModal = () => {
  const { isOpen, open, close } = useModalState();
  const description = useCurrentRoom((v) => v.description);
  const name = useCurrentRoom((v) => v.name);
  const isAdmin = useCurrentRoom((v) => v.isAdmin);

  const { chatId } = useParams();
  const [isPrivate, setIsPrivate] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const [currentMembers, setCurrentMembers] = useState([]);

  // Fetch room data when modal opens
  useEffect(() => {
    if (isOpen) {
      const loadRoomData = async () => {
        try {
          const roomRef = ref(database, `rooms/${chatId}`);
          const snapshot = await get(roomRef);

          if (snapshot.exists()) {
            const roomData = snapshot.val();
            setIsPrivate(!!roomData.isPrivate);
            setRoomCode(roomData.roomCode || '');

            // Get current members
            if (roomData.members) {
              setCurrentMembers(Object.keys(roomData.members));
            } else {
              setCurrentMembers([]);
            }
          }
        } catch (error) {
          console.error('Error loading room data:', error);
        }
      };

      loadRoomData();
    }
  }, [chatId, isOpen]);

  return (
    <>
      <Button appearance="link" className="px-0" onClick={open}>
        Room information
      </Button>

      <Modal open={isOpen} onClose={close}>
        <Modal.Header>
          <Modal.Title>
            About {name}
            <Tag color={isPrivate ? 'red' : 'green'} style={{ marginLeft: '10px' }}>
              {isPrivate ? (
                <>
                  <FontAwesomeIcon icon={faLock} /> Private
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faLockOpen} /> Public
                </>
              )}
            </Tag>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h6 className="mb-1">Description</h6>
          <p>{description}</p>

          {isPrivate && isAdmin && (
            <div className="mt-3">
              <h6 className="mb-1">Room Code</h6>
              <p className="d-flex align-items-center">
                <code style={{
                  padding: '5px 10px',
                  backgroundColor: 'rgba(79, 70, 229, 0.1)',
                  borderRadius: '4px',
                  color: '#4f46e5',
                  fontWeight: 'bold'
                }}>
                  {roomCode}
                </code>
                <small className="text-muted ml-2">
                  Share this code with users you want to invite directly
                </small>
              </p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          {isPrivate && isAdmin && (
            <div className="mb-2 w-100">
              <InviteUsersModal
                roomId={chatId}
                roomName={name}
                currentMembers={currentMembers}
              />
            </div>
          )}
          <Button block onClick={close}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default memo(RoomInfoBtnModal);
