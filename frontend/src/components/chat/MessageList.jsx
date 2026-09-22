import { useEffect, useRef } from "react";
import { MessageBubble } from "./MessageBubble";
import { NoConversationPlaceholder } from "./NoConversationPlaceholder";
import { useSelectedConversation } from "../../hooks/useSelectedConversation";
import { useChatStore } from "../../store/useChatStore";

function SkeletonBubble({ own }) {
  return (
    <div className={`flex w-full ${own ? "justify-end" : "justify-start"}`}>
      <div
        className={`skeleton h-9 rounded-2xl ${
          own ? "rounded-br-md" : "rounded-bl-md"
        }`}
        style={{ width: `${Math.random() * 90 + 80}px` }}
        aria-hidden
      />
    </div>
  );
}

const SKELETON_PATTERN = [0, 1, 0, 0, 1, 0, 1, 1]; // 0=other, 1=own

export function MessageList() {
  const { activeConversation, activeConversationId } = useSelectedConversation();
  const isMessagesLoading = useChatStore((s) => s.isMessagesLoading);

  const bottomRef = useRef(null);
  const containerRef = useRef(null);
  const prevIdRef = useRef(null);

  const messages = activeConversation?.messages ?? [];
  const messageCount = messages.length;

  useEffect(() => {
    if (!bottomRef.current) return;
    const conversationChanged = prevIdRef.current !== activeConversationId;
    prevIdRef.current = activeConversationId;

    if (conversationChanged) {
      bottomRef.current.scrollIntoView({ behavior: "instant" });
    } else {
      bottomRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [activeConversationId, messageCount]);

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      {activeConversationId ? (
        <div
          ref={containerRef}
          className="messages-scroll flex flex-1 flex-col gap-1 overflow-y-auto overscroll-contain px-2 py-3 sm:px-3 sm:py-4"
        >
          <p className="mb-3 text-center text-[11px] font-medium uppercase tracking-wide text-muted">
            Today
          </p>

          {isMessagesLoading ? (
            SKELETON_PATTERN.map((own, i) => (
              <SkeletonBubble key={i} own={Boolean(own)} />
            ))
          ) : (
            messages.map((message, i) => (
              <MessageBubble
                key={message._id || message.id}
                message={message}
                isNew={i >= messages.length - 2}
              />
            ))
          )}

          <div ref={bottomRef} className="h-0 w-full shrink-0" aria-hidden />
        </div>
      ) : (
        <NoConversationPlaceholder />
      )}
    </div>
  );
}
