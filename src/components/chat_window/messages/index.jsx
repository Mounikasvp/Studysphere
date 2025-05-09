import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "react-router";
import { Button, Message, toaster } from "rsuite";
import {
  ref as dbRef,
  off,
  onValue,
  query,
  orderByChild,
  equalTo,
  runTransaction,
  update,
  limitToLast,
} from "firebase/database";
import { deleteObject, ref as storageRef } from "firebase/storage";
import { auth, database, storage } from "../../../misc/firebase.config";
import { groupBy, transformToArrWithId } from "../../../misc/helpers";
import MessageItem from "./MessageItem";

const PAGE_SIZE = 15;
const messagesRef = dbRef(database, "/messages");

function shouldScrollToBottom(node, threshold = 30) {
  const percentage =
    (100 * node.scrollTop) / (node.scrollHeight - node.clientHeight) || 0;

  return percentage > threshold;
}

const Messages = () => {
  const { chatId } = useParams();
  const [messages, setMessages] = useState(null);
  const [limit, setLimit] = useState(PAGE_SIZE);
  const selfRef = useRef();

  const isChatEmpty = messages && messages.length === 0;
  const canShowMessages = messages && messages.length > 0;

  const loadMessages = useCallback(
    (limitToUse) => {
      const node = selfRef.current;

      off(messagesRef);

      onValue(
        query(
          messagesRef,
          orderByChild("roomId"),
          equalTo(chatId),
          limitToLast(limitToUse || PAGE_SIZE)
        ),
        (snap) => {
          const data = transformToArrWithId(snap.val());
          setMessages(data);

          if (shouldScrollToBottom(node)) {
            node.scrollTop = node.scrollHeight;
          }
        }
      );

      setLimit((p) => p + PAGE_SIZE);
    },
    [chatId]
  );

  const onLoadMore = useCallback(() => {
    const node = selfRef.current;
    const oldHeight = node.scrollHeight;

    loadMessages(limit);

    setTimeout(() => {
      const newHeight = node.scrollHeight;
      node.scrollTop = newHeight - oldHeight;
    }, 200);
  }, [loadMessages, limit]);

  useEffect(() => {
    const node = selfRef.current;

    loadMessages();

    setTimeout(() => {
      node.scrollTop = node.scrollHeight;
    }, 200);

    return () => {
      off(messagesRef);
    };
  }, [loadMessages]);

  const handleAdmin = useCallback(
    async (uid) => {
      let alertMsg;

      await runTransaction(
        dbRef(database, `/rooms/${chatId}/admins`),
        (admins) => {
          if (admins) {
            if (admins[uid]) {
              admins[uid] = null;
              alertMsg = "Admin permission removed";
            } else {
              admins[uid] = true;
              alertMsg = "Admin permission granted";
            }
          }
          return admins;
        }
      );

      toaster.push(
        <Message type="info" closable duration={4000}>
          {alertMsg}
        </Message>
      );
    },
    [chatId]
  );

  const handleLike = useCallback(async (msgId) => {
    const { uid } = auth.currentUser;
    const messageRef = dbRef(database, `/messages/${msgId}`);

    let alertMsg;

    await runTransaction(messageRef, (msg) => {
      if (msg) {
        if (msg.likes && msg.likes[uid]) {
          msg.likeCount -= 1;
          msg.likes[uid] = null;
          alertMsg = "Like removed";
        } else {
          msg.likeCount += 1;

          if (!msg.likes) {
            msg.likes = {};
          }

          msg.likes[uid] = true;
          alertMsg = "Like added";
        }
      }

      return msg;
    });

    toaster.push(
      <Message type="info" closable duration={4000}>
        {alertMsg}
      </Message>
    );
  }, []);

  const handleDelete = useCallback(
    async (msgId, file) => {
      // eslint-disable-next-line no-alert
      if (!window.confirm("Delete this message?")) {
        return;
      }

      const isLast = messages[messages.length - 1].id === msgId;

      const updates = {};

      updates[`/messages/${msgId}`] = null;

      if (isLast && messages.length > 1) {
        updates[`/rooms/${chatId}/lastMessage`] = {
          ...messages[messages.length - 2],
          msgId: messages[messages.length - 2].id,
        };
      }

      if (isLast && messages.length === 1) {
        updates[`/rooms/${chatId}/lastMessage`] = null;
      }

      try {
        await update(dbRef(database), updates);

        toaster.push(
          <Message type="info" closable duration={4000}>
            Message has been deleted
          </Message>
        );
      } catch (err) {
        return toaster.push(
          <Message type="error" closable duration={4000}>
            {err.message}
          </Message>
        );
      }

      // If file exists and is not a base64 file (meaning it's stored in Firebase Storage)
      if (file && !file.isBase64) {
        try {
          const fileRef = storageRef(storage, file.url);
          await deleteObject(fileRef);
        } catch (err) {
          toaster.push(
            <Message type="error" closable duration={4000}>
              {err.message}
            </Message>
          );
        }
      }
      // Base64 files are deleted automatically when the message is deleted from the database
    },
    [chatId, messages]
  );

  const renderMessages = () => {
    const groups = groupBy(messages, (item) =>
      new Date(item.createdAt).toDateString()
    );

    const items = [];

    Object.keys(groups).forEach((date) => {
      items.push(
        <li key={date} className="text-center mb-1 padded" data-content={date}>
          {date}
        </li>
      );

      const msgs = groups[date].map((msg) => (
        <MessageItem
          key={msg.id}
          message={msg}
          handleAdmin={handleAdmin}
          handleLike={handleLike}
          handleDelete={handleDelete}
        />
      ));

      items.push(...msgs);
    });

    return items;
  };

  return (
    <ul ref={selfRef} className="msg-list custom-scroll">
      {messages && messages.length >= PAGE_SIZE && (
        <li className="text-center mt-2 mb-2">
          <Button onClick={onLoadMore} color="green" appearance="primary">
            Load more
          </Button>
        </li>
      )}
      {isChatEmpty && <li>No messages yet</li>}
      {canShowMessages && renderMessages()}
    </ul>
  );
};

export default Messages;
