import { MessageI } from '@/pages/Chat/types/message';
import { RoomInfo } from '@/pages/Chat/types/room';
import { create } from 'zustand';

interface Conversation {
  room: RoomInfo;
  messages: MessageI[];
}

interface ChatState {
  chatIsOpen: boolean;
  conversations: Conversation[];
  activeConversation: string | null;
  isLoading: boolean;
  setChatIsOpen: (isOpen: boolean) => void;
  setActiveConversation: (name: string) => void;
  setIsLoading: (isLoading: boolean) => void;

  setRooms: (rooms: RoomInfo[]) => void;
  updateRoom: (room: RoomInfo) => void;
  setMessages: (roomName: string, messages: MessageI[]) => void;
  addMessage: (roomName: string, message: MessageI) => void;
}

const useChat = create<ChatState>((set) => ({
  chatIsOpen: false,
  activeConversation: null,
  conversations: [],
  isLoading: false,
  setIsLoading: (isLoading) => set({ isLoading }),
  setChatIsOpen: (isOpen) => set({ chatIsOpen: isOpen }),
  setActiveConversation: (name) => set({ activeConversation: name }),
  setMessages: (roomName, messages) => {
    set((state) => {
      const conversationIndex = state.conversations.findIndex(
        (c) => c.room.name === roomName,
      );
      if (conversationIndex === -1) return state;

      const conversation = state.conversations[conversationIndex];
      const existingMessages = conversation.messages || [];

      // Prepend messages (pagination is loading older)
      const allMessages = [...messages, ...existingMessages];

      const uniqueMessages = allMessages.reduce((acc, current) => {
        const exists = acc.find((item) => item._id === current._id);
        if (!exists) acc.push(current);
        return acc;
      }, [] as MessageI[]);

      const sortedMessages = uniqueMessages.sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );

      const updatedConversation = {
        ...conversation,
        messages: sortedMessages,
      };

      const updatedConversations = [...state.conversations];
      updatedConversations[conversationIndex] = updatedConversation;

      return {
        ...state,
        conversations: updatedConversations,
      };
    });
  },

  addMessage: (roomName, message) => {
    set((state) => {
      const index = state.conversations.findIndex((c) => c.room.name === roomName);
      if (index === -1) return state;

      // Create a new messages array
      const newMessages = [...state.conversations[index].messages, message];
      // Create a new conversation object
      const updatedConversation = {
        ...state.conversations[index],
        messages: newMessages,
      };
      // Create a new conversations array
      const updatedConversations = [...state.conversations];
      updatedConversations[index] = updatedConversation;
      return { ...state, conversations: updatedConversations };
    });
  },
  setRooms: (rooms) => set(() => ({
    conversations: rooms.map(room => ({
      room,
      messages: []
    }))
  })),
  updateRoom: (room) => set((state) => {
    const conversationIndex = state.conversations.findIndex(c => c.room.name === room.name);
    if (conversationIndex === -1) {
      return state;
    }
    const conversation = state.conversations[conversationIndex];
    conversation.room = room;
    return {
      ...state,
      conversations: [
        ...state.conversations.slice(0, conversationIndex),
        conversation,
        ...state.conversations.slice(conversationIndex + 1),
      ],
    };
  }),
}));

export default useChat;