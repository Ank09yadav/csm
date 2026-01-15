import React from 'react';
import ChatRoom from '../../components/ChatRoom';

export default function HomeScreen() {
  // This is the default Home screen, which we are repurposing as the "Hindi Room"
  // Since this screen is inside (home), it has the AppHeader (App Layout) above it.
  // So we invoke ChatRoom with includeSafeAreaTop={false} to avoid double padding.
  return (
    <ChatRoom
      roomName="hindi"
      roomDisplayName="Hindi Room"
      isHindiRoom={true}
      includeSafeAreaTop={false}
    />
  );
}