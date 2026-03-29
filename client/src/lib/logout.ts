import { clearAuthSession } from "@/lib/auth-storage";
import { disconnectChatSocket } from "@/shared/socket/chatSocket";

export function logout(): void {
  clearAuthSession();
  disconnectChatSocket();
}