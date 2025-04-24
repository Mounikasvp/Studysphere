import React, { memo } from "react";
import { Link } from "react-router-dom";
import { useCurrentRoom } from "../../../context/current-room.context";
import { useMediaQuery } from "../../../misc/custom-hooks";
import { ButtonToolbar } from "rsuite";
import RoomInfoBtnModal from "./RoomInfoBtnModal";
import EditRoomBtnDrawer from "./EditRoomBtnDrawer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faInfoCircle } from "@fortawesome/free-solid-svg-icons";

const ChatTop = () => {
  const name = useCurrentRoom((v) => v.name);
  const isMobile = useMediaQuery("(max-width: 992px)");
  const isAdmin = useCurrentRoom(v => v.isAdmin);

  return (
    <div className="room-header">
      <div className="d-flex justify-content-between align-items-center">
        <h4 className="room-title">
          {isMobile && (
            <Link to={"/chat"} className="back-link">
              <FontAwesomeIcon icon={faArrowLeft} />
            </Link>
          )}
          <span>{name}</span>
        </h4>

        <div className="room-actions">
          {isAdmin && <EditRoomBtnDrawer />}
        </div>
      </div>
      <div className="room-info">
        <div className="room-description">
          <RoomInfoBtnModal />
        </div>
      </div>
    </div>
  );
};

export default memo(ChatTop);
