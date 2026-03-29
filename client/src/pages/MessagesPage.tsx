import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { Link, useLocation } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { getAuthUser } from "@/lib/auth-storage";
import { formatRelativeTime } from "@/lib/formatRelativeTime";
import type { Conversation, Message } from "@/features/chat/types/chat.types";
import {
  deleteMessage,
  editMessage,
  getConversationMessages,
  getMyConversations,
  markConversationAsRead,
  sendMessage,
} from "@/features/chat/api/chat";
import { resolveMediaUrl } from "@/shared/lib/resolveMediaUrl";
import {
  joinConversationRoom,
  leaveConversationRoom,
  onMessageDeleted,
  onMessageRead,
  onMessageUpdated,
  onNewMessage,
  onSocketReady,
} from "@/shared/socket/chatSocket";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchMyProfile } from "@/store/slices/profileSlice";
import {
  markConversationMessagesAsRead,
  markMessageAsDeleted,
  setActiveConversationId,
  setConversations,
  setConversationsError,
  setConversationsLoading,
  setMessagesError,
  setMessagesForConversation,
  setMessagesLoading,
  setSendMessageError,
  setSendingMessage,
  setSocketReady,
  upsertMessageForConversation,
} from "@/store/slices/chatSlice";

const FALLBACK_AVATAR_URL = "https://placehold.co/80x80?text=U";
const MOBILE_BREAKPOINT = 768;
const AUTO_SCROLL_THRESHOLD = 80;

function getAvatarSrc(avatarUrl: string | null | undefined): string {
  if (!avatarUrl || avatarUrl.trim() === "") {
    return FALLBACK_AVATAR_URL;
  }

  return resolveMediaUrl(avatarUrl);
}

function getOtherParticipant(
  conversation: Conversation,
  currentUserId: string | null,
) {
  return (
    conversation.participants.find(
      (participant) => participant.id !== currentUserId,
    ) ?? conversation.participants[0] ?? null
  );
}

function getConversationPreview(messageText: string | null): string {
  if (!messageText || messageText.trim() === "") {
    return "No messages yet";
  }

  return messageText;
}

function formatConversationTimestamp(value: string | null): string {
  if (!value) {
    return "";
  }

  return formatRelativeTime(value);
}

function formatChatDate(value: string | null): string {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

type ConversationRowProps = {
  conversation: Conversation;
  currentUserId: string | null;
  isActive: boolean;
  onSelect: () => void;
};

function ConversationRow({
  conversation,
  currentUserId,
  isActive,
  onSelect,
}: ConversationRowProps) {
  const participant = getOtherParticipant(conversation, currentUserId);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-full items-center gap-3 px-6 py-4 text-left transition-colors ${
        isActive ? "bg-[#EFEFEF]" : "hover:bg-[#FAFAFA]"
      }`}
    >
      <img
        src={getAvatarSrc(participant?.avatarUrl)}
        alt={participant?.username ?? "User avatar"}
        className="h-14 w-14 rounded-full object-cover"
      />

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-[#262626]">
          {participant?.username ?? "Unknown user"}
        </p>

        <p className="truncate text-sm text-[#8E8E8E]">
          {getConversationPreview(conversation.lastMessageText)}
          {conversation.lastMessageAt ? " · " : ""}
          {formatConversationTimestamp(conversation.lastMessageAt)}
        </p>
      </div>
    </button>
  );
}

type MessageBubbleProps = {
  message: Message;
  isOwnMessage: boolean;
  avatarUrl: string | null;
  onEdit: (message: Message) => void;
  onDelete: (message: Message) => void;
};

function MessageBubble({
  message,
  isOwnMessage,
  avatarUrl,
  onEdit,
  onDelete,
}: MessageBubbleProps) {
  return (
    <div
      className={`flex items-end gap-3 ${
        isOwnMessage ? "justify-end" : "justify-start"
      }`}
    >
      {!isOwnMessage ? (
        <img
          src={getAvatarSrc(avatarUrl)}
          alt="User avatar"
          className="h-8 w-8 rounded-full object-cover"
        />
      ) : null}

      <div className="flex max-w-[75%] flex-col">
        <div
          className={`rounded-[12px] px-4 py-3 text-sm leading-5 ${
            isOwnMessage
              ? "bg-[#5B21FF] text-white"
              : "bg-[#EFEFEF] text-[#262626]"
          }`}
        >
          <p className={message.isDeleted ? "italic opacity-70" : ""}>
            {message.text}
          </p>

          {message.isEdited && !message.isDeleted ? (
            <p
              className={`mt-2 text-[11px] ${
                isOwnMessage ? "text-white/70" : "text-[#8E8E8E]"
              }`}
            >
              edited
            </p>
          ) : null}
        </div>

        {isOwnMessage && !message.isDeleted ? (
          <div className="mt-1 flex items-center justify-end gap-3 px-1 text-[11px] text-[#8E8E8E]">
            <button
              type="button"
              onClick={() => onEdit(message)}
              className="transition-opacity hover:opacity-70"
            >
              Edit
            </button>

            <button
              type="button"
              onClick={() => onDelete(message)}
              className="transition-opacity hover:opacity-70"
            >
              Delete
            </button>
          </div>
        ) : null}
      </div>

      {isOwnMessage ? (
        <img
          src={getAvatarSrc(avatarUrl)}
          alt="Your avatar"
          className="h-8 w-8 rounded-full object-cover"
        />
      ) : null}
    </div>
  );
}

export default function MessagesPage() {
  const dispatch = useAppDispatch();
  const location = useLocation();

  const preselectedConversationId =
    (location.state as { conversationId?: string } | null)?.conversationId ??
    null;

  const authUser = getAuthUser();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const messagesScrollRef = useRef<HTMLDivElement | null>(null);
  const shouldAutoScrollRef = useRef(true);
  const markingReadConversationIdRef = useRef<string | null>(null);
  const activeConversationIdRef = useRef<string | null>(null);

  const {
    conversations,
    activeConversationId,
    messagesByConversationId,
    isConversationsLoading,
    isMessagesLoading,
    isSendingMessage,
    conversationsError,
    messagesError,
    sendMessageError,
  } = useAppSelector((state) => state.chat);

  const currentProfile = useAppSelector((state) => state.profile.currentProfile);

  const [messageText, setMessageText] = useState("");
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(
    window.innerWidth < MOBILE_BREAKPOINT,
  );

  const currentUserId = authUser?.id ?? null;
  const ownAvatarUrl =
    currentProfile?.user.avatarUrl ?? authUser?.avatarUrl ?? null;

  const activeConversation = useMemo(() => {
    return (
      conversations.find(
        (conversation) => conversation.id === activeConversationId,
      ) ?? null
    );
  }, [activeConversationId, conversations]);

  const activeMessages = useMemo(() => {
    if (!activeConversationId) {
      return [];
    }

    return messagesByConversationId[activeConversationId] ?? [];
  }, [activeConversationId, messagesByConversationId]);

  const activeParticipant = useMemo(() => {
    if (!activeConversation) {
      return null;
    }

    return getOtherParticipant(activeConversation, currentUserId);
  }, [activeConversation, currentUserId]);

  function scrollMessagesToBottom(behavior: ScrollBehavior = "auto") {
    const container = messagesScrollRef.current;

    if (!container) {
      return;
    }

    requestAnimationFrame(() => {
      container.scrollTo({
        top: container.scrollHeight,
        behavior,
      });
    });
  }

  function updateShouldAutoScroll() {
    const container = messagesScrollRef.current;

    if (!container) {
      shouldAutoScrollRef.current = true;
      return;
    }

    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;

    shouldAutoScrollRef.current = distanceFromBottom <= AUTO_SCROLL_THRESHOLD;
  }

  function resetComposer() {
    setMessageText("");
    setEditingMessageId(null);
  }

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    }

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (!currentProfile) {
      void dispatch(fetchMyProfile());
    }
  }, [currentProfile, dispatch]);

  useEffect(() => {
    let isCancelled = false;

    async function loadConversations() {
      dispatch(setConversationsLoading(true));
      dispatch(setConversationsError(null));

      const result = await getMyConversations();

      if (isCancelled) {
        return;
      }

      if (!result.ok) {
        dispatch(setConversationsError(result.error));
        dispatch(setConversationsLoading(false));
        return;
      }

      dispatch(setConversations(result.data.items));

      const nextActiveConversationId =
        result.data.items.find(
          (conversation) => conversation.id === preselectedConversationId,
        )?.id ??
        result.data.items[0]?.id ??
        null;

      dispatch(setActiveConversationId(nextActiveConversationId));
      dispatch(setConversationsLoading(false));
    }

    void loadConversations();

    return () => {
      isCancelled = true;
    };
  }, [dispatch, preselectedConversationId]);

  useEffect(() => {
    if (!activeConversationId) {
      resetComposer();
      return;
    }

    const conversationId = activeConversationId;
    shouldAutoScrollRef.current = true;
    resetComposer();

    let isCancelled = false;

    async function loadMessages() {
      dispatch(setMessagesLoading(true));
      dispatch(setMessagesError(null));

      const result = await getConversationMessages(conversationId);

      if (isCancelled) {
        return;
      }

      if (!result.ok) {
        dispatch(setMessagesError(result.error));
        dispatch(setMessagesLoading(false));
        return;
      }

      dispatch(
        setMessagesForConversation({
          conversationId,
          messages: result.data.items,
        }),
      );

      dispatch(setMessagesLoading(false));
      scrollMessagesToBottom("auto");
    }

    void loadMessages();

    return () => {
      isCancelled = true;
    };
  }, [activeConversationId, dispatch]);

  useEffect(() => {
    activeConversationIdRef.current = activeConversationId;
  }, [activeConversationId]);

  useEffect(() => {
    if (!activeConversationId || !currentUserId) {
      return;
    }

    const conversationId = activeConversationId;
    const readerId = currentUserId;

    const hasIncomingUnreadMessages = activeMessages.some(
      (message) => message.senderId !== readerId && !message.isRead,
    );

    if (!hasIncomingUnreadMessages) {
      if (markingReadConversationIdRef.current === conversationId) {
        markingReadConversationIdRef.current = null;
      }

      return;
    }

    if (markingReadConversationIdRef.current === conversationId) {
      return;
    }

    markingReadConversationIdRef.current = conversationId;

    async function syncReadState() {
      const result = await markConversationAsRead(conversationId);

      if (!result.ok) {
        markingReadConversationIdRef.current = null;
        return;
      }

      markingReadConversationIdRef.current = null;
    }

    void syncReadState();
  }, [activeConversationId, activeMessages, currentUserId]);

  useEffect(() => {
    if (!currentUserId) {
      return;
    }

    const offReady = onSocketReady(() => {
      dispatch(setSocketReady(true));
    });

    const offNewMessage = onNewMessage((payload) => {
      dispatch(
        upsertMessageForConversation({
          conversationId: payload.conversationId,
          message: payload.message,
        }),
      );

      const isActiveConversation =
        payload.conversationId === activeConversationIdRef.current;
      const isOwnMessage = payload.message.senderId === currentUserId;

      if (isActiveConversation && (shouldAutoScrollRef.current || isOwnMessage)) {
        scrollMessagesToBottom(isOwnMessage ? "smooth" : "auto");
      }
    });

    const offUpdatedMessage = onMessageUpdated((payload) => {
      dispatch(
        upsertMessageForConversation({
          conversationId: payload.conversationId,
          message: payload.message,
        }),
      );
    });

    const offDeletedMessage = onMessageDeleted((payload) => {
      dispatch(
        markMessageAsDeleted({
          conversationId: payload.conversationId,
          messageId: payload.messageId,
        }),
      );
    });

    const offReadMessage = onMessageRead((payload) => {
      dispatch(
        markConversationMessagesAsRead({
          conversationId: payload.conversationId,
          readerId: payload.readerId,
          currentUserId,
        }),
      );
    });

    return () => {
      offReady();
      offNewMessage();
      offUpdatedMessage();
      offDeletedMessage();
      offReadMessage();
    };
  }, [currentUserId, dispatch]);

  useEffect(() => {
    if (!activeConversationId) {
      return;
    }

    const conversationId = activeConversationId;

    joinConversationRoom(conversationId);

    return () => {
      leaveConversationRoom(conversationId);
    };
  }, [activeConversationId]);

  async function handleSendMessage() {
    if (!activeConversationId || isSendingMessage) {
      return;
    }

    const conversationId = activeConversationId;
    const trimmedText = messageText.trim();

    if (!trimmedText) {
      return;
    }

    dispatch(setSendingMessage(true));
    dispatch(setSendMessageError(null));

    if (editingMessageId) {
      const result = await editMessage(editingMessageId, {
        text: trimmedText,
      });

      if (!result.ok) {
        dispatch(setSendMessageError(result.error));
        dispatch(setSendingMessage(false));
        return;
      }

      resetComposer();
      dispatch(setSendingMessage(false));
      return;
    }

    const result = await sendMessage(conversationId, {
      text: trimmedText,
    });

    if (!result.ok) {
      dispatch(setSendMessageError(result.error));
      dispatch(setSendingMessage(false));
      return;
    }

    dispatch(
      upsertMessageForConversation({
        conversationId,
        message: result.data,
      }),
    );

    setMessageText("");
    shouldAutoScrollRef.current = true;
    scrollMessagesToBottom("smooth");
    dispatch(setSendingMessage(false));
  }

  async function handleDeleteMessage(message: Message) {
    if (!activeConversationId || message.isDeleted) {
      return;
    }

    dispatch(setSendMessageError(null));

    const result = await deleteMessage(message.id);

    if (!result.ok) {
      dispatch(setSendMessageError(result.error));
      return;
    }

    if (editingMessageId === message.id) {
      resetComposer();
    }
  }

  function handleStartEditMessage(message: Message) {
    if (message.isDeleted) {
      return;
    }

    setEditingMessageId(message.id);
    setMessageText(message.text);
  }

  function handleCancelEdit() {
    resetComposer();
    dispatch(setSendMessageError(null));
  }

  function handleMessageInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter" || event.shiftKey) {
      return;
    }

    event.preventDefault();
    void handleSendMessage();
  }

  const showSidebar = !isMobile || !activeConversationId;
  const showActiveConversation = !isMobile || Boolean(activeConversationId);

  return (
    <section className="flex min-h-[calc(100vh-80px)] w-full overflow-hidden bg-white">
      {showSidebar ? (
        <aside className="flex w-full max-w-[360px] flex-col border-r border-[#DBDBDB]">
          <div className="border-b border-[#DBDBDB] px-6 py-5">
            <h1 className="text-xl font-semibold text-[#262626]">
              {currentProfile?.user.username ?? authUser?.username ?? "Messages"}
            </h1>
          </div>

          <div className="flex-1 overflow-y-auto">
            {isConversationsLoading ? (
              <div className="p-6 text-sm text-[#8E8E8E]">Loading chats...</div>
            ) : null}

            {conversationsError ? (
              <div className="p-6 text-sm text-red-500">
                {conversationsError}
              </div>
            ) : null}

            {!isConversationsLoading &&
            !conversationsError &&
            conversations.length === 0 ? (
              <div className="p-6 text-sm text-[#8E8E8E]">
                No conversations yet.
              </div>
            ) : null}

            {conversations.map((conversation) => (
              <ConversationRow
                key={conversation.id}
                conversation={conversation}
                currentUserId={currentUserId}
                isActive={conversation.id === activeConversationId}
                onSelect={() => dispatch(setActiveConversationId(conversation.id))}
              />
            ))}
          </div>
        </aside>
      ) : null}

      {showActiveConversation ? (
        <div className="flex min-w-0 flex-1 flex-col">
          {!activeConversation || !activeParticipant ? (
            <div className="flex flex-1 items-center justify-center px-6">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-[#262626]">
                  Your messages
                </h2>
                <p className="mt-2 text-sm text-[#8E8E8E]">
                  Select a conversation to start chatting.
                </p>
              </div>
            </div>
          ) : (
            <>
              <header className="flex items-center border-b border-[#DBDBDB] px-6 py-5">
                {isMobile ? (
                  <button
                    type="button"
                    onClick={() => dispatch(setActiveConversationId(null))}
                    className="mr-4 text-sm font-medium text-[#262626]"
                  >
                    ← Back
                  </button>
                ) : null}

                <div className="flex items-center gap-3">
                  <img
                    src={getAvatarSrc(activeParticipant.avatarUrl)}
                    alt={activeParticipant.username}
                    className="h-11 w-11 rounded-full object-cover"
                  />

                  <div>
                    <p className="text-sm font-semibold text-[#262626]">
                      {activeParticipant.username}
                    </p>
                  </div>
                </div>
              </header>

              <div
                ref={messagesScrollRef}
                onScroll={updateShouldAutoScroll}
                className="flex-1 overflow-y-auto px-6 py-6"
              >
                <div className="mx-auto flex max-w-3xl flex-col">
                  <div className="flex flex-col items-center pt-14 pb-14">
                    <img
                      src={getAvatarSrc(activeParticipant.avatarUrl)}
                      alt={activeParticipant.username}
                      className="h-24 w-24 rounded-full object-cover"
                    />

                    <h2 className="mt-4 text-2xl font-semibold text-[#262626]">
                      {activeParticipant.username}
                    </h2>

                    <p className="mt-1 text-sm text-[#8E8E8E]">
                      {activeParticipant.username} · ICHgram
                    </p>

                    <Button
                      asChild
                      type="button"
                      variant="secondary"
                      className="mt-4 h-9 rounded-[10px] px-10 text-sm bg-[#EFEFEF]  font-semibold"
                    >
                      <Link to={`/profile/${activeParticipant.id}`}>
                        View profile
                      </Link>
                    </Button>
                  </div>

                  <div className="pb-20 text-center  text-xs text-[#8E8E8E]">
                    {formatChatDate(activeConversation.lastMessageAt)}
                  </div>

                  {isMessagesLoading ? (
                    <div className="pb-6 text-sm text-[#8E8E8E]">
                      Loading messages...
                    </div>
                  ) : null}

                  {messagesError ? (
                    <div className="pb-6 text-sm text-red-500">
                      {messagesError}
                    </div>
                  ) : null}

                  {!isMessagesLoading &&
                  !messagesError &&
                  activeMessages.length === 0 ? (
                    <div className="pb-6 text-center text-sm text-[#8E8E8E]">
                      No messages yet. Start the conversation.
                    </div>
                  ) : null}

                  <div className="flex flex-col gap-4">
                    {activeMessages.map((message) => {
                      const isOwnMessage = message.senderId === currentUserId;

                      return (
                        <MessageBubble
                          key={message.id}
                          message={message}
                          isOwnMessage={isOwnMessage}
                          avatarUrl={
                            isOwnMessage
                              ? ownAvatarUrl
                              : activeParticipant.avatarUrl
                          }
                          onEdit={handleStartEditMessage}
                          onDelete={(targetMessage) => {
                            void handleDeleteMessage(targetMessage);
                          }}
                        />
                      );
                    })}

                    <div ref={messagesEndRef} />
                  </div>
                </div>
              </div>

              <div className="px-6 py-5">
                <div className="mx-auto flex max-w-3xl flex-col gap-3">
                  {sendMessageError ? (
                    <p className="text-sm text-red-500">{sendMessageError}</p>
                  ) : null}

                  {editingMessageId ? (
                    <div className="flex items-center justify-between text-xs text-[#8E8E8E]">
                      <span>Editing message</span>

                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="text-[#262626]"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : null}

                  <div className="flex items-center gap-3 rounded-full border border-[#DBDBDB] px-4 py-3">
                    <input
                      type="text"
                      value={messageText}
                      onChange={(event) => setMessageText(event.target.value)}
                      onKeyDown={handleMessageInputKeyDown}
                      placeholder="Write message"
                      className="flex-1 border-none bg-transparent text-sm text-[#262626] outline-none placeholder:text-[#8E8E8E]"
                      disabled={isSendingMessage}
                    />

                    <button
                      type="button"
                      onClick={() => void handleSendMessage()}
                      disabled={isSendingMessage || messageText.trim() === ""}
                      className="text-sm font-semibold text-[#0095F6] disabled:text-[#B2DFFC]"
                    >
                      {isSendingMessage
                        ? editingMessageId
                          ? "Saving..."
                          : "Sending..."
                        : editingMessageId
                          ? "Save"
                          : "Send"}
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      ) : null}
    </section>
  );
}
