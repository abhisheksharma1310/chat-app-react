import React from 'react'
import { useParams } from 'react-router';
import { Loader } from 'rsuite';
import ChatBottom from '../../components/chat-window/buttom'
import Messages from '../../components/chat-window/messages'
import ChatTop from '../../components/chat-window/top'
import { CurrentRoomProvider } from '../../context/current-room.context';
import { useRooms } from '../../context/room.context';
import { auth } from '../../misc/firebase';
import { transformToArr } from '../../misc/helper';

const Chat = () => {

    const {chatId} = useParams();
    const rooms = useRooms();

    if(!rooms){
        return <Loader center vertical size='md' content='Loading' speed='slow'/>
    }

    const currentRoom = rooms.find(room => room.id === chatId);

    if(!currentRoom){
        return <h6 className='text-center mt-page'>
            Chat {chatId} not found
        </h6>
    }

    const {name, description} = currentRoom;

    const admins =  transformToArr(currentRoom.admins);
    const isAdmin = admins.includes(auth.currentUser.uid);

    const currentRoomData = {
        name, description, admins, isAdmin
    }

    return (
        <CurrentRoomProvider data={currentRoomData}>
            <div className='chat-top'>
                <ChatTop />
            </div>
            <div className='chat-middle'>
                <Messages/>
            </div>
            <div className='chat-bottom'>
                <ChatBottom/>
            </div>
        </CurrentRoomProvider>
    );
};

export default Chat;