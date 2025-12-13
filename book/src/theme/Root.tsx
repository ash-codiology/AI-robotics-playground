import React from 'react';
import { UserProvider } from '../contexts/UserContext';
import UserBanner from '../components/UserBanner/UserBanner';
import FloatingRAGChatbot from '../components/FloatingRAGChatbot/FloatingRAGChatbot';

function Root({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <UserBanner />
      {children}
      <FloatingRAGChatbot />
    </UserProvider>
  );
}

export default Root;