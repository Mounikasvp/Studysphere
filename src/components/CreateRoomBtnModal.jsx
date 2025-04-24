import React, { useCallback, useRef, useState } from "react";
import { Button, Form, Input, Message, Modal, Schema, toaster, Radio, RadioGroup, Checkbox } from "rsuite";
import { useModalState } from "../misc/custom-hooks";
import { serverTimestamp, ref, push, set } from "firebase/database";
import { database, auth } from "../misc/firebase.config";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faCopy } from "@fortawesome/free-solid-svg-icons";
import { generateUniqueCode } from "../misc/helpers";

const Textarea = React.forwardRef((props, ref) => (
  <Input {...props} as="textarea" ref={ref} />
));

const { StringType } = Schema.Types;

const model = Schema.Model({
  name: StringType().isRequired("Chat name is required"),
  description: StringType().isRequired("Description is required"),
  isPrivate: StringType(),
});

const INITIAL_FORM = {
  name: "",
  description: "",
  isPrivate: "public",
};

const CreateRoomBtnModal = () => {
  const { isOpen, open, close } = useModalState();

  const [formValue, setFormValue] = useState(INITIAL_FORM);
  const [isLoading, setIsLoading] = useState(false);
  const formRef = useRef();

  const onFormChange = useCallback((value) => {
    setFormValue(value);
  }, []);

  const onSubmit = async () => {
    if (!formRef.current.check()) {
      return;
    }

    setIsLoading(true);

    // Generate a unique 6-character code for the room
    const roomCode = generateUniqueCode(6);

    const newRoomData = {
      ...formValue,
      createdAt: serverTimestamp(),
      admins: {
        [auth.currentUser.uid]: true,
      },
      fcmUsers: {
        [auth.currentUser.uid]: true,
      },
      members: {
        [auth.currentUser.uid]: true,
      },
      roomCode,
      isPrivate: formValue.isPrivate === 'private',
    };

    try {
      // Create the room
      const roomRef = push(ref(database, "rooms"));
      await set(roomRef, newRoomData);

      // Add this room to the user's joined rooms
      await set(ref(database, `user-rooms/${auth.currentUser.uid}/${roomRef.key}`), {
        joinedAt: serverTimestamp(),
        role: 'admin'
      });

      toaster.push(
        <Message type="info" closable duration={4000}>
          {`${formValue.name} has been created with code: ${roomCode}`}
        </Message>
      );

      setIsLoading(false);
      setFormValue(INITIAL_FORM);
      close();
    } catch (error) {
      setIsLoading(false);
      toaster.push(
        <Message type="error" closable duration={4000}>
          {error.message}
        </Message>
      );
    }
  };

  return (
    <div className="mt-1">
      <Button block appearance="primary" onClick={open} className="create-room-btn">
        <FontAwesomeIcon icon={faPlus} /> Create New Room
      </Button>

      <Modal open={isOpen} onClose={close}>
        <Modal.Header>
          <Modal.Title>New Chat Room</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form
            fluid
            onChange={onFormChange}
            formValue={formValue}
            model={model}
            ref={formRef}
          >
            <Form.Group controlId="name">
              <Form.ControlLabel>Room Name</Form.ControlLabel>
              <Form.Control name="name" placeholder="Enter chat room name..." />
              <Form.HelpText>Room name is required</Form.HelpText>
            </Form.Group>

            <Form.Group controlId="description">
              <Form.ControlLabel>Description</Form.ControlLabel>
              <Form.Control
                rows={5}
                name="description"
                accepter={Textarea}
                placeholder="Enter room description..."
              />
              <Form.HelpText>Room description is required</Form.HelpText>
            </Form.Group>

            <Form.Group controlId="isPrivate">
              <Form.ControlLabel>Privacy Setting</Form.ControlLabel>
              <Form.Control
                name="isPrivate"
                accepter={RadioGroup}
              >
                <Radio value="public">Public (Anyone can join)</Radio>
                <Radio value="private">Private (Join by code only)</Radio>
              </Form.Control>
              <Form.HelpText>
                Public rooms are visible to everyone. Private rooms require a code to join.
              </Form.HelpText>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            block
            appearance="primary"
            onClick={onSubmit}
            disabled={isLoading}
            style={{
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '10px',
              fontWeight: '600'
            }}
          >
            Create Room
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CreateRoomBtnModal;
