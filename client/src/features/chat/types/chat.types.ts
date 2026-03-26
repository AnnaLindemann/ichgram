export type ChatParticipant = {
  id: string;
  username: string;
  fullName: string;
  avatarUrl: string | null;
};

export type Conversation = {
  id: string;
  participants: ChatParticipant[];
  lastMessageText: string | null;
  lastMessageAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  isRead: boolean;
  isEdited: boolean;
  editedAt: string | null;
  isDeleted: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PaginatedConversations = {
  items: Conversation[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type PaginatedMessages = {
  items: Message[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type CreateDirectConversationInput = {
  participantId: string;
};

export type SendMessageInput = {
  text: string;
};

export type EditMessageInput = {
  text: string;
};

export type SocketReadyPayload = {
  userId: string;
  socketId: string;
};

export type NewMessageSocketPayload = {
  conversationId: string;
  message: Message;
};

export type MessageUpdatedSocketPayload = {
  conversationId: string;
  message: Message;
};

export type MessageDeletedSocketPayload = {
  conversationId: string;
  messageId: string;
};

export type MessageReadSocketPayload = {
  conversationId: string;
  readerId: string;
};