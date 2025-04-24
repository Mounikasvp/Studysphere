import React, { useEffect, useRef, useState } from "react";
import { Divider, ButtonGroup, Button, Toggle } from "rsuite";
import CreateRoomBtnModal from "./CreateRoomBtnModal";
import JoinRoomModal from "./JoinRoomModal";
import DashboardToggle from "./dashboard/DashboardToggle";
import ChatRoomList from "./rooms/ChatRoomList";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers, faGlobe } from "@fortawesome/free-solid-svg-icons";

const Sidebar = () => {
  const topSidebarRef = useRef();
  const [height, setHeight] = useState(0);
  const [showOnlyJoined, setShowOnlyJoined] = useState(true);

  useEffect(() => {
    const updateHeight = () => {
      if (topSidebarRef.current) {
        // Add a small buffer to ensure there's enough space
        setHeight(topSidebarRef.current.scrollHeight);
      }
    };

    // Initial update
    updateHeight();

    // Update after a short delay to ensure all elements are rendered
    const timer = setTimeout(updateHeight, 100);

    // Add resize listener to handle window size changes
    window.addEventListener('resize', updateHeight);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateHeight);
    };
  }, [topSidebarRef, showOnlyJoined]);

  return (
    <div className="h-100 d-flex flex-column">
      <div className="sidebar-header" ref={topSidebarRef}>
        <DashboardToggle />
        <CreateRoomBtnModal />
        <JoinRoomModal />
        <div className="view-toggle">
          <Toggle
            checked={showOnlyJoined}
            onChange={setShowOnlyJoined}
            checkedChildren="My Groups"
            unCheckedChildren="All Groups"
            className="mt-3 mb-2"
          />
          <small className="text-muted d-block mb-2">
            {showOnlyJoined ?
              'Showing only groups you have joined' :
              'Showing all available groups'}
          </small>
        </div>
        <Divider className="divider">Study Groups</Divider>
      </div>
      <div className="room-list-container">
        <ChatRoomList aboveElHeight={height} showOnlyJoined={showOnlyJoined} />
      </div>
    </div>
  );
};

export default Sidebar;
