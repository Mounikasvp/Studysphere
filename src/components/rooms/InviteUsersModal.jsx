import React, { useState, useEffect } from 'react';
import { Modal, Button, Message, toaster, List, Avatar, Tag } from 'rsuite';
import { useModalState } from '../../misc/custom-hooks';
import UserSearch from '../UserSearch';
import { createInvitation } from '../../misc/invitation-service';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPlus, faTimes } from '@fortawesome/free-solid-svg-icons';

const InviteUsersModal = ({ roomId, roomName, currentMembers = [] }) => {
  const { isOpen, open, close } = useModalState();
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Reset selected users when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedUsers([]);
    }
  }, [isOpen]);

  const handleUserSelect = user => {
    // Check if user is already selected
    if (selectedUsers.some(u => u.uid === user.uid)) {
      setSelectedUsers(prev => prev.filter(u => u.uid !== user.uid));
    } else {
      setSelectedUsers(prev => [...prev, user]);
    }
  };

  const handleRemoveUser = userId => {
    setSelectedUsers(prev => prev.filter(user => user.uid !== userId));
  };

  const handleInviteUsers = async () => {
    if (selectedUsers.length === 0) {
      toaster.push(
        <Message type="warning" closable duration={4000}>
          Please select at least one user to invite
        </Message>
      );
      return;
    }

    setIsLoading(true);

    try {
      // Send invitations to all selected users
      const invitationPromises = selectedUsers.map(user =>
        createInvitation(roomId, user.uid, roomName)
      );

      await Promise.all(invitationPromises);

      toaster.push(
        <Message type="success" closable duration={4000}>
          Invitations sent successfully
        </Message>
      );

      setIsLoading(false);
      close();
    } catch (error) {
      // Check if it's an indexing error
      if (error.message && error.message.includes('Index not defined')) {
        toaster.push(
          <Message type="error" closable duration={4000}>
            <div>
              <p>Error sending invitations: Firebase index not defined.</p>
              <p>Please see FIREBASE_RULES.md for instructions on how to deploy the required database rules.</p>
              <p>The application will still work, but with reduced performance until the rules are updated.</p>
            </div>
          </Message>
        );
      } else {
        toaster.push(
          <Message type="error" closable duration={4000}>
            Error sending invitations: {error.message}
          </Message>
        );
      }
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        appearance="primary"
        onClick={open}
        style={{
          background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          padding: '8px 16px',
          fontWeight: '600',
          marginRight: '8px'
        }}
      >
        <FontAwesomeIcon icon={faUserPlus} /> Invite Users
      </Button>

      <Modal open={isOpen} onClose={close} size="md">
        <Modal.Header>
          <Modal.Title>Invite Users to {roomName}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUsers.length > 0 && (
            <div className="mb-3">
              <h6 className="mb-2">Selected Users:</h6>
              <div className="d-flex flex-wrap">
                {selectedUsers.map(user => (
                  <Tag
                    key={user.uid}
                    closable
                    onClose={() => handleRemoveUser(user.uid)}
                    style={{
                      margin: '0 8px 8px 0',
                      borderRadius: '12px',
                      padding: '6px 12px',
                      backgroundColor: 'rgba(79, 70, 229, 0.1)',
                      color: '#4f46e5'
                    }}
                  >
                    <Avatar
                      circle
                      src={user.avatar || null}
                      alt={user.name}
                      size="xs"
                      style={{ marginRight: '6px' }}
                    >
                      {user.name[0].toUpperCase()}
                    </Avatar>
                    {user.name}
                  </Tag>
                ))}
              </div>
            </div>
          )}

          <UserSearch
            onSelect={handleUserSelect}
            selectedUsers={selectedUsers}
            excludeUsers={currentMembers}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button
            appearance="primary"
            onClick={handleInviteUsers}
            disabled={isLoading || selectedUsers.length === 0}
            style={{
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '10px',
              fontWeight: '600'
            }}
            block
          >
            {isLoading ? 'Sending Invitations...' : 'Send Invitations'}
          </Button>
          <Button
            appearance="subtle"
            onClick={close}
            disabled={isLoading}
            style={{
              marginTop: '8px'
            }}
            block
          >
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default InviteUsersModal;
