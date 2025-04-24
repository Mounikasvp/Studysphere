import React, { useState, useCallback } from "react";
import { InputGroup, Message, toaster } from "rsuite";
import { ReactMic } from "react-mic";
import { useParams } from "react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMicrophone } from "@fortawesome/free-solid-svg-icons";

const AudioMsgBtn = ({ afterUpload }) => {
  const { chatId } = useParams();

  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const onClick = useCallback(() => {
    setIsRecording((p) => !p);
  }, []);

  const onUpload = useCallback(
    async (data) => {
      setIsUploading(true);
      try {
        // Convert blob to base64
        const reader = new FileReader();
        reader.readAsDataURL(data.blob);

        reader.onloadend = () => {
          const base64data = reader.result;

          const file = {
            contentType: 'audio/mp3',
            name: `audio_${Date.now()}.mp3`,
            url: base64data,
            isBase64: true
          };

          setIsUploading(false);
          afterUpload([file]);
        };

        reader.onerror = (error) => {
          throw new Error('Failed to convert audio to base64');
        };
      } catch (error) {
        setIsUploading(false);
        toaster.push(
          <Message type="error" closable duration={4000}>{error.message}</Message>
        )
      }
    },
    [afterUpload]
  );

  return (
    <InputGroup.Button
      onClick={onClick}
      disabled={isUploading}
      className={`audio-btn ${isRecording ? "animate-blink" : ""}`}
    >
      <FontAwesomeIcon icon={faMicrophone} />
      <ReactMic
        record={isRecording}
        className="d-none"
        onStop={onUpload}
        mimeType="audio/mp3"
      />
    </InputGroup.Button>
  );
};

export default AudioMsgBtn;
