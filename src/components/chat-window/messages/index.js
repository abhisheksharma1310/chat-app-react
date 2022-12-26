import React, { useEffect, useState } from 'react'
import { useRef } from 'react';
import { useCallback } from 'react';
import { useParams } from 'react-router';
import { Alert, Button } from 'rsuite';
import { auth, database, storage } from '../../../misc/firebase'
import { groupBy, transformToArrWithId } from '../../../misc/helper'
import MessageItem from './MessageItem';

const PAGE_SIZE = 15;
const messagesRef = database.ref('/messages');

function shouldScrollToBottom(node, threshold = 30){

  const percentage = (100*node.scrollTop)/(node.scrollHeight - node.clientHeight) || 0;

  return percentage > threshold;
}

const Messages = () => {

  const { chatId } = useParams();
  const [messages, setMessages] = useState(null);
  const [limit, setLimit] = useState(PAGE_SIZE);
  const selfRef = useRef();

  const isChatEmpty = messages && messages.length === 0;
  const canShowMessages = messages && messages.length > 0;

  //function to fetch messages from firebase
  const loadMessages = useCallback((limitToLast)=> {

    const node = selfRef.current;
    messagesRef.off();

    messagesRef.orderByChild('roomId').equalTo(chatId).limitToLast(limitToLast || PAGE_SIZE).on('value', (snap) => {
      const data = transformToArrWithId(snap.val());
      setMessages(data);

      if(shouldScrollToBottom(node)){
        node.scrollTop = node.scrollHeight;
      }
    });

    //Increase new limit size
    setLimit(p => p + PAGE_SIZE);

  },[chatId]);

  //function to fetch messages from firebase
  const onLoadMore = useCallback(()=>{

    const node = selfRef.current;
    const oldHeight = node.scrollHeight;

    loadMessages(limit);

    setTimeout(()=>{
      const newHeight = node.scrollHeight;
      node.scrollTop = newHeight - oldHeight;
    }, 100);

  },[limit, loadMessages]);

  //function to fetch messages from firebase
  useEffect(() => {

    const node = selfRef.current;
    
    loadMessages();

    setTimeout(()=>{
      node.scrollTop = node.scrollHeight;
    }, 100);
    
    return () => {
      messagesRef.off('value');
    }
  }, [loadMessages]);

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

  //Function to render messages
  const renderMessages = () => {

    const groups = groupBy(messages, item => 
      new Date(item.createdAt).toDateString()
    );

    const items = [];

    Object.keys(groups).forEach((date) => {

      items.push(<li key={date} className='text-center mb-1 padded'>{date}</li>)

      const msgs = groups[date].map(msg => 
        <MessageItem key={msg.id} message={msg} handleAdmin={handleAdmin} handleLike={handleLike} handleDelete={handleDelete} />
      );

      items.push(...msgs);
    });
    return items;
  }

  //Return messages components in chat window
  return (
    <ul ref={selfRef} className='msg-list custom-scroll'>
      {messages && messages.length >= PAGE_SIZE &&
        <li className='text-center mt-2 mb-2'>
          <Button onClick={onLoadMore} color='green'>Load more</Button>
        </li>
      }
      {isChatEmpty && <li>No messages yet</li>}
      {canShowMessages && 
        renderMessages()
      }
    </ul>
  );
};

export default Messages;