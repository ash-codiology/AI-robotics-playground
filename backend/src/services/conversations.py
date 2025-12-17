from typing import Dict, List, Optional, Any
from datetime import datetime
import uuid
import threading
from pydantic import BaseModel


class Conversation(BaseModel):
    id: str
    title: str
    messages: List[Dict[str, Any]]
    created_at: datetime
    updated_at: datetime
    mode: Optional[str] = 'full_book'


class ConversationStore:
    def __init__(self):
        self._conversations: Dict[str, Conversation] = {}
        self._lock = threading.Lock()

    def create_conversation(self, title: str, mode: str = 'full_book') -> Conversation:
        with self._lock:
            conversation_id = str(uuid.uuid4())
            conversation = Conversation(
                id=conversation_id,
                title=title,
                messages=[],
                created_at=datetime.now(),
                updated_at=datetime.now(),
                mode=mode
            )
            self._conversations[conversation_id] = conversation
            return conversation

    def get_conversation(self, conversation_id: str) -> Optional[Conversation]:
        return self._conversations.get(conversation_id)

    def update_conversation(self, conversation_id: str, messages: List[Dict[str, Any]]) -> Optional[Conversation]:
        with self._lock:
            if conversation_id in self._conversations:
                conversation = self._conversations[conversation_id]
                conversation.messages = messages
                conversation.updated_at = datetime.now()
                return conversation
        return None

    def add_message_to_conversation(self, conversation_id: str, message: Dict[str, Any]) -> Optional[Conversation]:
        with self._lock:
            if conversation_id in self._conversations:
                conversation = self._conversations[conversation_id]
                conversation.messages.append(message)
                conversation.updated_at = datetime.now()
                return conversation
        return None

    def delete_conversation(self, conversation_id: str) -> bool:
        with self._lock:
            if conversation_id in self._conversations:
                del self._conversations[conversation_id]
                return True
        return False

    def list_conversations(self) -> List[Conversation]:
        return list(self._conversations.values())

    def clear_conversations(self):
        with self._lock:
            self._conversations.clear()


# Global instance
conversation_store = ConversationStore()