import React, { useState } from "react";
import TimeAgo from "timeago-react";
import ProfileAvatar from "../ProfileAvatar";
import { Button, Whisper, Tooltip, Badge } from "rsuite";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy, faLock, faLockOpen } from "@fortawesome/free-solid-svg-icons";
import { auth } from "../../misc/firebase.config";

const RoomItem = ({ room }) => {
  const { createdAt, name, lastMessage, roomCode, isPrivate, admins } = room;
  const [copied, setCopied] = useState(false);

  // Check if current user is an admin of this room
  const isAdmin = admins && admins[auth.currentUser.uid];

  const copyCode = (e) => {
    e.preventDefault();
    e.stopPropagation();

    navigator.clipboard.writeText(roomCode);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <div className="room-item-container">
      <div className="d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center">
          <h3 className="text-disappear">{name}</h3>
          {isPrivate && (
            <Badge content="Private" color="blue" style={{ marginLeft: '5px' }} />
          )}
        </div>
        <TimeAgo
          datetime={
            lastMessage ? new Date(lastMessage.createdAt) : new Date(createdAt)
          }
          className="font-normal text-black-45"
        />
      </div>

      {/* Show room code for admins */}
      {isAdmin && roomCode && (
        <div className="room-code-container">
          <small className="text-muted">Room Code: </small>
          <code>{roomCode}</code>
          <Whisper
            placement="top"
            trigger="hover"
            speaker={<Tooltip>{copied ? 'Copied!' : 'Copy code'}</Tooltip>}
          >
            <Button appearance="link" size="xs" onClick={copyCode} className="copy-btn">
              <FontAwesomeIcon icon={faCopy} />
            </Button>
          </Whisper>
        </div>
      )}

      <div className="d-flex align-items-center text-black-70">
        {lastMessage ? (
          <>
            <div className="d-flex align-items-center">
              <ProfileAvatar
                src={lastMessage.author.avatar}
                name={lastMessage.author.name}
                size="sm"
              />
            </div>
            <div className="text-disappear ml-2">
              <div className="italic">{lastMessage.author.name}</div>
              <span>{lastMessage.text || lastMessage.file.name}</span>
            </div>
          </>
        ) : (
          <span>No messages yet...</span>
        )}
      </div>
    </div>
  );
};

export default RoomItem;
