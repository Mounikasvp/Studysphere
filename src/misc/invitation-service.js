import { database, auth } from './firebase.config';
import { ref, push, set, get, query, orderByChild, equalTo, remove, update, serverTimestamp } from 'firebase/database';
import { transformToArrWithId } from './helpers';

// Create a new invitation
export async function createInvitation(groupId, recipientId, groupName) {
  try {
    // Check if an invitation already exists
    const existingInvitation = await checkExistingInvitation(groupId, recipientId);

    if (existingInvitation) {
      throw new Error('An invitation has already been sent to this user');
    }

    // Create new invitation
    const invitationRef = push(ref(database, 'invitations'));

    const invitationData = {
      groupId,
      groupName,
      senderId: auth.currentUser.uid,
      recipientId,
      status: 'pending',
      timestamp: serverTimestamp()
    };

    await set(invitationRef, invitationData);
    return invitationRef.key;
  } catch (error) {
    // If it's an indexing error, we can still try to create the invitation
    if (error.message && error.message.includes('Index not defined')) {
      console.log('Index error when creating invitation, proceeding anyway');

      try {
        // Create new invitation without checking for duplicates
        const invitationRef = push(ref(database, 'invitations'));

        const invitationData = {
          groupId,
          groupName,
          senderId: auth.currentUser.uid,
          recipientId,
          status: 'pending',
          timestamp: serverTimestamp()
        };

        await set(invitationRef, invitationData);
        return invitationRef.key;
      } catch (fallbackError) {
        throw fallbackError;
      }
    } else {
      throw error;
    }
  }
}

// Check if an invitation already exists for this group and recipient
async function checkExistingInvitation(groupId, recipientId) {
  try {
    // First try with the indexed query
    const invitationsRef = ref(database, 'invitations');
    const invitationsQuery = query(
      invitationsRef,
      orderByChild('groupId'),
      equalTo(groupId)
    );

    const snapshot = await get(invitationsQuery);

    if (snapshot.exists()) {
      const invitations = transformToArrWithId(snapshot.val());
      return invitations.some(
        inv => inv.recipientId === recipientId && inv.status === 'pending'
      );
    }

    return false;
  } catch (error) {
    // If index error occurs, fall back to getting all invitations
    console.log('Index error, falling back to full scan:', error.message);

    try {
      const invitationsRef = ref(database, 'invitations');
      const snapshot = await get(invitationsRef);

      if (snapshot.exists()) {
        const invitations = transformToArrWithId(snapshot.val());
        return invitations.some(
          inv => inv.groupId === groupId &&
                inv.recipientId === recipientId &&
                inv.status === 'pending'
        );
      }

      return false;
    } catch (fallbackError) {
      console.error('Error in fallback check:', fallbackError);
      return false;
    }
  }
}

// Get all invitations sent by current user
export async function getSentInvitations() {
  try {
    const invitationsRef = ref(database, 'invitations');
    const invitationsQuery = query(
      invitationsRef,
      orderByChild('senderId'),
      equalTo(auth.currentUser.uid)
    );

    const snapshot = await get(invitationsQuery);

    if (snapshot.exists()) {
      return transformToArrWithId(snapshot.val());
    }

    return [];
  } catch (error) {
    // If index error occurs, fall back to getting all invitations
    console.log('Index error, falling back to full scan:', error.message);

    try {
      const invitationsRef = ref(database, 'invitations');
      const snapshot = await get(invitationsRef);

      if (snapshot.exists()) {
        const invitations = transformToArrWithId(snapshot.val());
        return invitations.filter(inv => inv.senderId === auth.currentUser.uid);
      }

      return [];
    } catch (fallbackError) {
      console.error('Error in fallback getSentInvitations:', fallbackError);
      return [];
    }
  }
}

// Get all invitations received by current user
export async function getReceivedInvitations() {
  try {
    const invitationsRef = ref(database, 'invitations');
    const invitationsQuery = query(
      invitationsRef,
      orderByChild('recipientId'),
      equalTo(auth.currentUser.uid)
    );

    const snapshot = await get(invitationsQuery);

    if (snapshot.exists()) {
      return transformToArrWithId(snapshot.val());
    }

    return [];
  } catch (error) {
    // If index error occurs, fall back to getting all invitations
    console.log('Index error, falling back to full scan:', error.message);

    try {
      const invitationsRef = ref(database, 'invitations');
      const snapshot = await get(invitationsRef);

      if (snapshot.exists()) {
        const invitations = transformToArrWithId(snapshot.val());
        return invitations.filter(inv => inv.recipientId === auth.currentUser.uid);
      }

      return [];
    } catch (fallbackError) {
      console.error('Error in fallback getReceivedInvitations:', fallbackError);
      return [];
    }
  }
}

// Accept an invitation
export async function acceptInvitation(invitationId, invitation) {
  try {
    // Update invitation status
    await update(ref(database, `invitations/${invitationId}`), {
      status: 'accepted'
    });

    // Add user to group members
    await set(
      ref(database, `rooms/${invitation.groupId}/members/${auth.currentUser.uid}`),
      true
    );

    // Add group to user's joined rooms
    await set(
      ref(database, `user-rooms/${auth.currentUser.uid}/${invitation.groupId}`),
      {
        joinedAt: serverTimestamp(),
        role: 'member'
      }
    );

    return true;
  } catch (error) {
    throw error;
  }
}

// Decline an invitation
export async function declineInvitation(invitationId) {
  try {
    await update(ref(database, `invitations/${invitationId}`), {
      status: 'declined'
    });

    return true;
  } catch (error) {
    throw error;
  }
}

// Cancel an invitation (sender cancels it)
export async function cancelInvitation(invitationId) {
  try {
    await remove(ref(database, `invitations/${invitationId}`));
    return true;
  } catch (error) {
    throw error;
  }
}

// Get all users for invitation dropdown
export async function getAllUsers() {
  try {
    const usersRef = ref(database, 'users');
    const snapshot = await get(usersRef);

    if (snapshot.exists()) {
      const users = [];
      snapshot.forEach(childSnapshot => {
        // Don't include current user
        if (childSnapshot.key !== auth.currentUser.uid) {
          users.push({
            uid: childSnapshot.key,
            ...childSnapshot.val()
          });
        }
      });

      return users;
    }

    return [];
  } catch (error) {
    throw error;
  }
}
