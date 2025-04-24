import React, { useState, useEffect } from 'react';
import { List, Button, Loader, Message, toaster, Panel, Badge, Placeholder } from 'rsuite';
import { getReceivedInvitations, acceptInvitation, declineInvitation } from '../../misc/invitation-service';
import { database } from '../../misc/firebase.config';
import { ref, onValue, off } from 'firebase/database';
import { useProfile } from '../../context/profile.context';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes, faEnvelope, faUsers } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';

const InvitationsList = () => {
  const { profile } = useProfile();
  const [invitations, setInvitations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [senderNames, setSenderNames] = useState({});
  const [processingInvitations, setProcessingInvitations] = useState({});

  // Listen for invitations in real-time
  useEffect(() => {
    if (!profile) return;

    const invitationsRef = ref(database, 'invitations');
    
    onValue(invitationsRef, snapshot => {
      if (snapshot.exists()) {
        const invitationsData = snapshot.val();
        const receivedInvitations = [];
        
        // Filter invitations for current user
        Object.keys(invitationsData).forEach(key => {
          const invitation = invitationsData[key];
          if (invitation.recipientId === profile.uid && invitation.status === 'pending') {
            receivedInvitations.push({
              id: key,
              ...invitation
            });
          }
        });
        
        // Sort by timestamp (newest first)
        receivedInvitations.sort((a, b) => {
          return (b.timestamp || 0) - (a.timestamp || 0);
        });
        
        setInvitations(receivedInvitations);
      } else {
        setInvitations([]);
      }
      
      setIsLoading(false);
    });
    
    return () => {
      off(invitationsRef);
    };
  }, [profile]);

  // Fetch sender names
  useEffect(() => {
    const senderIds = [...new Set(invitations.map(inv => inv.senderId))];
    
    if (senderIds.length === 0) return;
    
    const names = {};
    
    senderIds.forEach(senderId => {
      const userRef = ref(database, `users/${senderId}`);
      
      onValue(userRef, snapshot => {
        if (snapshot.exists()) {
          const userData = snapshot.val();
          names[senderId] = userData.name;
          setSenderNames({...names});
        }
      });
    });
    
    return () => {
      senderIds.forEach(senderId => {
        off(ref(database, `users/${senderId}`));
      });
    };
  }, [invitations]);

  const handleAccept = async (invitationId, invitation) => {
    setProcessingInvitations(prev => ({
      ...prev,
      [invitationId]: 'accepting'
    }));
    
    try {
      await acceptInvitation(invitationId, invitation);
      
      toaster.push(
        <Message type="success" closable duration={4000}>
          You have joined the group: {invitation.groupName}
        </Message>
      );
      
      setProcessingInvitations(prev => ({
        ...prev,
        [invitationId]: null
      }));
    } catch (error) {
      toaster.push(
        <Message type="error" closable duration={4000}>
          Error accepting invitation: {error.message}
        </Message>
      );
      
      setProcessingInvitations(prev => ({
        ...prev,
        [invitationId]: null
      }));
    }
  };

  const handleDecline = async (invitationId) => {
    setProcessingInvitations(prev => ({
      ...prev,
      [invitationId]: 'declining'
    }));
    
    try {
      await declineInvitation(invitationId);
      
      toaster.push(
        <Message type="info" closable duration={4000}>
          Invitation declined
        </Message>
      );
      
      setProcessingInvitations(prev => ({
        ...prev,
        [invitationId]: null
      }));
    } catch (error) {
      toaster.push(
        <Message type="error" closable duration={4000}>
          Error declining invitation: {error.message}
        </Message>
      );
      
      setProcessingInvitations(prev => ({
        ...prev,
        [invitationId]: null
      }));
    }
  };

  if (isLoading) {
    return (
      <Panel header={<h3>Group Invitations</h3>} bordered>
        <Placeholder.Paragraph rows={3} active />
      </Panel>
    );
  }

  return (
    <Panel 
      header={
        <div className="d-flex align-items-center">
          <FontAwesomeIcon icon={faEnvelope} className="mr-2" style={{ color: '#4f46e5' }} />
          <h3 className="mb-0">Group Invitations</h3>
          {invitations.length > 0 && (
            <Badge content={invitations.length} style={{ marginLeft: '10px' }} />
          )}
        </div>
      } 
      bordered
    >
      {invitations.length === 0 ? (
        <div className="text-center py-3">
          <FontAwesomeIcon icon={faUsers} style={{ fontSize: '2rem', color: '#cbd5e1', marginBottom: '1rem' }} />
          <p className="text-muted">No pending invitations</p>
        </div>
      ) : (
        <List hover>
          {invitations.map(invitation => (
            <List.Item key={invitation.id} style={{ padding: '12px', borderRadius: '12px', marginBottom: '8px' }}>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="font-weight-bold">{invitation.groupName}</div>
                  <div className="text-muted small">
                    Invited by {senderNames[invitation.senderId] || 'Unknown user'}
                  </div>
                </div>
                <div>
                  <Button
                    appearance="primary"
                    color="green"
                    size="sm"
                    onClick={() => handleAccept(invitation.id, invitation)}
                    disabled={processingInvitations[invitation.id]}
                    style={{ marginRight: '8px', borderRadius: '8px' }}
                  >
                    <FontAwesomeIcon icon={faCheck} />
                    {processingInvitations[invitation.id] === 'accepting' ? ' Joining...' : ' Accept'}
                  </Button>
                  <Button
                    appearance="subtle"
                    color="red"
                    size="sm"
                    onClick={() => handleDecline(invitation.id)}
                    disabled={processingInvitations[invitation.id]}
                    style={{ borderRadius: '8px' }}
                  >
                    <FontAwesomeIcon icon={faTimes} />
                    {processingInvitations[invitation.id] === 'declining' ? ' Declining...' : ' Decline'}
                  </Button>
                </div>
              </div>
            </List.Item>
          ))}
        </List>
      )}
    </Panel>
  );
};

export default InvitationsList;
