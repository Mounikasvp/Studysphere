import React, { useCallback } from "react";
import { Button, Drawer, Message, toaster } from "rsuite";
import { useMediaQuery, useModalState } from "../../misc/custom-hooks";
import Dashboard from ".";
import { auth, database } from "../../misc/firebase.config";
import { ref, set } from "firebase/database";
import { isOfflineForDatabase } from "../../context/profile.context";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

const DashboardToggle = () => {
  const { isOpen, close, open } = useModalState();
  const isMobile = useMediaQuery("(max-width: 992px)");
  const navigate = useNavigate();

  const onSignOut = useCallback(() => {
    set(ref(database, `/status/${auth.currentUser.uid}`), isOfflineForDatabase)
      .then(() => {
        auth.signOut();
        toaster.push(
          <Message type="info" closable duration={4000}>
            Signed out
          </Message>
        );
        close();
        // Redirect to landing page after sign out
        navigate('/');
      })
      .catch((err) => {
        toaster.push(
          <Message type="error" closable duration={4000}>
            {err.message}
          </Message>
        );
      });
  }, [close, navigate]);

  return (
    <>
      <Button block appearance="primary" onClick={open} className="dashboard-btn">
        <FontAwesomeIcon icon={faUser} /> Dashboard
      </Button>
      <Drawer
        size={isMobile ? "full" : "sm"}
        open={isOpen}
        onClose={close}
        placement="left"
      >
        <Dashboard onSignOut={onSignOut} />
      </Drawer>
    </>
  );
};

export default DashboardToggle;
