import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Loader, Nav, Message, Button } from "rsuite";
import { useRooms } from "../../context/rooms.context";
import { useProfile } from "../../context/profile.context";
import RoomItem from "./RoomItem";
import { database, auth } from "../../misc/firebase.config";
import { ref, onValue, off } from "firebase/database";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock, faLockOpen } from "@fortawesome/free-solid-svg-icons";

const ChatRoomList = ({ aboveElHeight, showOnlyJoined = true }) => {
  const rooms = useRooms();
  const { profile } = useProfile();
  const location = useLocation();
  const [userRooms, setUserRooms] = useState({});

  // Listen for user's joined rooms
  useEffect(() => {
    if (!profile) return;

    const userRoomsRef = ref(database, `user-rooms/${auth.currentUser.uid}`);

    onValue(userRoomsRef, snapshot => {
      const data = snapshot.val() || {};
      setUserRooms(data);
    });

    return () => {
      off(userRoomsRef);
    };
  }, [profile]);

  // Filter rooms based on the toggle setting
  const filteredRooms = rooms ? rooms.filter(room => {
    // If showing all rooms, include public rooms and rooms the user is a member of
    if (!showOnlyJoined) {
      return !room.isPrivate || (room.members && room.members[auth.currentUser.uid]);
    }

    // If showing only joined rooms, check if user is a member
    return userRooms[room.id];
  }) : [];

  return (
    <Nav
      appearance="subtle"
      vertical
      reversed
      className="room-nav custom-scroll"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflowY: 'auto',
        display: 'block',
        width: '100%'
      }}
      activeKey={location.pathname}
    >
      {!rooms && (
        <Loader center vertical content="Loading" speed="slow" size="md" />
      )}
      {rooms && filteredRooms.length === 0 && (
        <div className="empty-room-list">
          <Message type="info" header="No study groups found">
            {showOnlyJoined ?
              "You haven't joined any study groups yet. Create a new group or join an existing one with a code." :
              "No public study groups available. Create a new group to get started."}
          </Message>
        </div>
      )}
      {rooms &&
        filteredRooms.length > 0 &&
        filteredRooms.map((room) => (
          <Nav.Item eventKey={`/chat/${room.id}`} key={room.id}>
            <Link style={{ textDecoration: "none" }} to={`/chat/${room.id}`}>
              <RoomItem room={room} />
              {room.isPrivate && (
                <span className="room-privacy-indicator">
                  <FontAwesomeIcon icon={faLock} />
                </span>
              )}
            </Link>
          </Nav.Item>
        ))}
    </Nav>
  );
};

export default ChatRoomList;
