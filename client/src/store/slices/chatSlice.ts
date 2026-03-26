import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type {
  Conversation,
  Message,
} from "@/features/chat/types/chat.types";

type MessagesByConversationId = Record<string, Message[]>;

type ChatState = {
  conversations: Conversation[];
  activeConversationId: string | null;
  messagesByConversationId: MessagesByConversationId;
  isConversationsLoading: boolean;
  isMessagesLoading: boolean;
  isSendingMessage: boolean;
  conversationsError: string | null;
  messagesError: string | null;
  sendMessageError: string | null;
  isSocketReady: boolean;
};

const initialState: ChatState = {
  conversations: [],
  activeConversationId: null,
  messagesByConversationId: {},
  isConversationsLoading: false,
  isMessagesLoading: false,
  isSendingMessage: false,
  conversationsError: null,
  messagesError: null,
  sendMessageError: null,
  isSocketReady: false,
};

function sortMessagesAsc(messages: Message[]): Message[] {
  return [...messages].sort((firstMessage, secondMessage) => {
    return (
      new Date(firstMessage.createdAt).getTime() -
      new Date(secondMessage.createdAt).getTime()
    );
  });
}

function upsertMessage(messages: Message[], incomingMessage: Message): Message[] {
  const existingMessageIndex = messages.findIndex(
    (message) => message.id === incomingMessage.id,
  );

  if (existingMessageIndex === -1) {
    return sortMessagesAsc([...messages, incomingMessage]);
  }

  const nextMessages = [...messages];
  nextMessages[existingMessageIndex] = incomingMessage;

  return sortMessagesAsc(nextMessages);
}

function updateConversationPreview(
  conversations: Conversation[],
  conversationId: string,
  message: Message,
): Conversation[] {
  return conversations
    .map((conversation) => {
      if (conversation.id !== conversationId) {
        return conversation;
      }

      return {
        ...conversation,
        lastMessageText: message.text,
        lastMessageAt: message.createdAt,
      };
    })
    .sort((firstConversation, secondConversation) => {
      const firstTimestamp = firstConversation.lastMessageAt
        ? new Date(firstConversation.lastMessageAt).getTime()
        : 0;
      const secondTimestamp = secondConversation.lastMessageAt
        ? new Date(secondConversation.lastMessageAt).getTime()
        : 0;

      return secondTimestamp - firstTimestamp;
    });
}

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setConversationsLoading(state, action: PayloadAction<boolean>) {
      state.isConversationsLoading = action.payload;
    },
    setMessagesLoading(state, action: PayloadAction<boolean>) {
      state.isMessagesLoading = action.payload;
    },
    setSendingMessage(state, action: PayloadAction<boolean>) {
      state.isSendingMessage = action.payload;
    },
    setConversationsError(state, action: PayloadAction<string | null>) {
      state.conversationsError = action.payload;
    },
    setMessagesError(state, action: PayloadAction<string | null>) {
      state.messagesError = action.payload;
    },
    setSendMessageError(state, action: PayloadAction<string | null>) {
      state.sendMessageError = action.payload;
    },
    setSocketReady(state, action: PayloadAction<boolean>) {
      state.isSocketReady = action.payload;
    },
    setConversations(state, action: PayloadAction<Conversation[]>) {
      state.conversations = [...action.payload].sort(
        (firstConversation, secondConversation) => {
          const firstTimestamp = firstConversation.lastMessageAt
            ? new Date(firstConversation.lastMessageAt).getTime()
            : 0;
          const secondTimestamp = secondConversation.lastMessageAt
            ? new Date(secondConversation.lastMessageAt).getTime()
            : 0;

          return secondTimestamp - firstTimestamp;
        },
      );
    },
    setActiveConversationId(state, action: PayloadAction<string | null>) {
      state.activeConversationId = action.payload;
    },
    setMessagesForConversation(
      state,
      action: PayloadAction<{
        conversationId: string;
        messages: Message[];
      }>,
    ) {
      const { conversationId, messages } = action.payload;

      state.messagesByConversationId[conversationId] = sortMessagesAsc(messages);
    },
    upsertMessageForConversation(
      state,
      action: PayloadAction<{
        conversationId: string;
        message: Message;
      }>,
    ) {
      const { conversationId, message } = action.payload;
      const currentMessages = state.messagesByConversationId[conversationId] ?? [];

      state.messagesByConversationId[conversationId] = upsertMessage(
        currentMessages,
        message,
      );

      state.conversations = updateConversationPreview(
        state.conversations,
        conversationId,
        message,
      );
    },
    markConversationMessagesAsRead(
      state,
      action: PayloadAction<{
        conversationId: string;
        readerId: string;
        currentUserId: string;
      }>,
    ) {
      const { conversationId, readerId, currentUserId } = action.payload;
      const currentMessages = state.messagesByConversationId[conversationId] ?? [];

      if (readerId !== currentUserId) {
        return;
      }

      state.messagesByConversationId[conversationId] = currentMessages.map(
        (message) => {
          if (message.senderId === currentUserId) {
            return message;
          }

          return {
            ...message,
            isRead: true,
          };
        },
      );
    },
    markMessageAsDeleted(
      state,
      action: PayloadAction<{
        conversationId: string;
        messageId: string;
      }>,
    ) {
      const { conversationId, messageId } = action.payload;
      const currentMessages = state.messagesByConversationId[conversationId] ?? [];

      state.messagesByConversationId[conversationId] = currentMessages.map(
        (message) => {
          if (message.id !== messageId) {
            return message;
          }

          return {
            ...message,
            text: "[deleted message]",
            isDeleted: true,
          };
        },
      );
    },
    resetChatState() {
      return initialState;
    },
  },
});

export const {
  setConversationsLoading,
  setMessagesLoading,
  setSendingMessage,
  setConversationsError,
  setMessagesError,
  setSendMessageError,
  setSocketReady,
  setConversations,
  setActiveConversationId,
  setMessagesForConversation,
  upsertMessageForConversation,
  markConversationMessagesAsRead,
  markMessageAsDeleted,
  resetChatState,
} = chatSlice.actions;

export default chatSlice.reducer;