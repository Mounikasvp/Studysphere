import { ref, update } from "firebase/database";
import React from "react";
import { Button, Divider, Drawer, Message, toaster, Nav } from "rsuite";
import { useProfile } from "../../context/profile.context";
import { database } from "../../misc/firebase.config";
import { getUserUpdates } from "../../misc/helpers";
import EditableInput from "../EditableInput";
import AvatarUploadBtn from "./AvatarUploadBtn";
import ProviderBlock from "./ProviderBlock";
import InvitationsList from "./InvitationsList";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faEnvelope } from "@fortawesome/free-solid-svg-icons";

const Dashboard = ({ onSignOut }) => {
  const { profile } = useProfile();

  const onSave = async (newData) => {
    try {
      const updates = await getUserUpdates(
        profile.uid,
        "name",
        newData,
        database
      );

      await update(ref(database), updates);

      toaster.push(
        <Message type="success" closable duration={4000}>
          Nickname has been updated
        </Message>
      );
    } catch (error) {
      toaster.push(
        <Message type="error" closable duration={4000}>
          {error.message}
        </Message>
      );
    }
  };

  const [activeTab, setActiveTab] = React.useState('profile');

  return (
    <>
      <Drawer.Header>
        <Drawer.Title>Dashboard</Drawer.Title>
      </Drawer.Header>

      <Drawer.Body>
        <Nav appearance="tabs" activeKey={activeTab} onSelect={setActiveTab} style={{ marginBottom: '20px' }}>
          <Nav.Item eventKey="profile" icon={<FontAwesomeIcon icon={faUser} />}>
            Profile
          </Nav.Item>
          <Nav.Item eventKey="invitations" icon={<FontAwesomeIcon icon={faEnvelope} />}>
            Invitations
          </Nav.Item>
        </Nav>

        {activeTab === 'profile' && (
          <div style={{ height: "calc(100% - 80px)" }}>
            <h3>Hey, {profile.name}</h3>
            <ProviderBlock />
            <Divider />
            <EditableInput
              name="nickname"
              initialValue={profile.name}
              onSave={onSave}
              label={<h6 className="mb-2">Nickname</h6>}
            />
            <AvatarUploadBtn />
          </div>
        )}

        {activeTab === 'invitations' && (
          <div style={{ height: "calc(100% - 80px)" }}>
            <InvitationsList />
          </div>
        )}

        <div style={{ marginTop: '20px' }}>
          <Drawer.Actions>
            <Button block color="red" appearance="primary" onClick={onSignOut}>
              Sign Out
            </Button>
          </Drawer.Actions>
        </div>
      </Drawer.Body>
    </>
  );
};

export default Dashboard;
