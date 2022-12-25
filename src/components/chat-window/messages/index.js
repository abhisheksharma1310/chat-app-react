import React, { useEffect, useState } from 'react'
import { useCallback } from 'react';
import { useParams } from 'react-router';
import { Alert } from 'rsuite';
import { auth, database, storage } from '../../../misc/firebase'
import { transformToArrWithId } from '../../../misc/helper'
import MessageItem from './MessageItem';

const Messages = () => {

  const { chatId } = useParams();
  const [messages, setMessages] = useState();

  const isChatEmpty = messages && messages.length === 0;
  const canShowMessages = messages && messages.length > 0;

  useEffect(() => {
    const messagesRef = database.ref('/messages');
    messagesRef.orderByChild('roomId').equalTo(chatId).on('value', (snap) => {
      const data = transformToArrWithId(snap.val());
      setMessages(data);
    });
    return () => {
      messagesRef.off('value');
    }
  }, [chatId]);

  //function to handle room admin
  const handleAdmin = useCallback(async (uid) => {
    const adminRef = database.ref(`/rooms/${chatId}/admins`);
    let alertMsg;
    await adminRef.transaction(admins => {
      if (admins) {
        if (admins[uid]) {
          admins[uid] = null;
          alertMsg = 'Admin permission removed';
        } else {
          admins[uid] = true;
          alertMsg = 'Admin permission granted';
        }
      }
      return admins;
    });
    Alert.info(alertMsg, 4000);
  }, [chatId]);

  //function to handle message like
  const handleLike = useCallback(async (msgId) => {
    const { uid } = auth.currentUser;
    const messageRef = database.ref(`/messages/${msgId}`);
    let alertMsg;
    await messageRef.transaction(msg => {
      if (msg) {
        if (msg.likes && msg.likes[uid]) {
          msg.likeCount -= 1;
          msg.likes[uid] = null;
          alertMsg = 'Message unliked';
        } else {
          msg.likeCount += 1;
          if (!msg.likes) {
            msg.likes = {};
          }
          msg.likes[uid] = true;
          alertMsg = 'Message liked';
        }
      }
      return msg;
    });
    Alert.info(alertMsg, 4000);
  }, []);

  //Function to handle delete message
  const handleDelete = useCallback(async (msgId, file) => {
    if (!window.confirm('You want to delete this message?')) {
      return;
    }
    const isLast = messages[messages.length - 1].id === msgId;
    const updates = {};
    updates[`/messages/${msgId}`] = null;
    if (isLast && messages.length > 1) {
      updates[`/rooms/${chatId}/lastMessage`] = {
        ...messages[messages.length - 2],
        msgId: messages[messages.length - 2].id
      }
    }

    if (isLast && messages.length === 1) {
      updates[`/rooms/${chatId}/lastMessage`] = null;
    }

    try {
      await database.ref().update(updates);
      Alert.info('Message has been deleted');
    } catch (error) {
      return Alert.error(error.message);
    }

    if (file) {
      try {
        const fileRef = storage.refFromURL(file.url);
        await fileRef.delete();
      } catch (error) {
        Alert.error(error.message);
      }
    }

  }, [messages, chatId]);

  //Return messages components in chat window
  return (
    <ul className='msg-list custom-scroll'>
      {isChatEmpty && <li>No messages yet</li>}
      {canShowMessages && messages.map(msg => <MessageItem key={msg.id} message={msg} handleAdmin={handleAdmin} handleLike={handleLike} handleDelete={handleDelete} />)}
    </ul>
  );
};

export default Messages;