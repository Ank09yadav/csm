import React from 'react';
import ChatRoom from '../../components/ChatRoom';

export default function PoetryRoom() {
  return <ChatRoom roomName="poetry" roomDisplayName="Poetry Room" includeSafeAreaTop={false} />;
}