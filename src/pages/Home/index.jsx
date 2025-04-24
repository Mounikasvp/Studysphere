import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { Col, Grid, Row } from "rsuite";
import Sidebar from "../../components/Sidebar";
import { RoomsProvider } from "../../context/rooms.context";
import { useMediaQuery } from "../../misc/custom-hooks";
import Chat from "./Chat";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComments } from "@fortawesome/free-solid-svg-icons";

const Home = () => {
  const isDesktop = useMediaQuery("(min-width: 992px)");
  const location = useLocation();

  // Check if we're at the exact /chat path
  const isExact = location.pathname === '/chat';

  const canRenderSidebar = isDesktop || isExact;

  return (
    <RoomsProvider>
      <div className="chat-page">
        <Grid fluid className="h-100">
          <Row className="h-100">
            {canRenderSidebar && (
              <Col xs={24} md={8} className="h-100">
                <div className="sidebar">
                  <Sidebar />
                </div>
              </Col>
            )}

            <Routes>
              <Route path=":chatId" element={
                <Col xs={24} md={16} className="h-100">
                  <div className="chat-area">
                    <Chat />
                  </div>
                </Col>
              } />
              <Route path="/" element={
                isDesktop && (
                  <Col xs={24} md={16} className="h-100">
                    <div className="empty-chat-placeholder">
                      <FontAwesomeIcon icon={faComments} className="placeholder-icon" />
                      <h3>Select a Chat Room</h3>
                      <p>Choose a chat room from the sidebar or create a new one to start messaging</p>
                    </div>
                  </Col>
                )
              } />
            </Routes>
          </Row>
        </Grid>
      </div>
    </RoomsProvider>
  );
};

export default Home;
