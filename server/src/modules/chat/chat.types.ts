export interface ChatParticipantDto {
  id: string;
  username: string;
  fullName: string;
  avatarUrl: string | null;
}

export interface ConversationDto {
  id: string;
  participants: ChatParticipantDto[];
  lastMessageText: string | null;
  lastMessageAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MessageDto {
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
}

export interface PaginatedConversationsDto {
  items: ConversationDto[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedMessagesDto {
  items: MessageDto[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}