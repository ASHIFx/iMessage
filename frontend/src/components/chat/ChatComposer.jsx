import { Button, TextArea } from "@heroui/react";
import { ImageIcon, LoaderIcon, SendHorizontalIcon } from "lucide-react";
import { useRef, useState } from "react";
import useKeyboardSound from "../../hooks/useKeyboardSound";
import { useChatStore } from "../../store/useChatStore";

export function ChatComposer() {
  const composerText = useChatStore((s) => s.composerText);
  const isSoundEnabled = useChatStore((s) => s.isSoundEnabled);
  const sendMediaMessage = useChatStore((s) => s.sendMediaMessage);
  const isSendingMedia = useChatStore((s) => s.isSendingMedia);
  const sendTextMessage = useChatStore((s) => s.sendTextMessage);
  const setComposerText = useChatStore((s) => s.setComposerText);
  const { playRandomKeyStrokeSound } = useKeyboardSound();
  const mediaInputRef = useRef(null);

  const sendingRef = useRef(false);
  const [sendDisabled, setSendDisabled] = useState(false);

  const maybePlaySound = () => {
    if (isSoundEnabled) playRandomKeyStrokeSound();
  };

  const handleSend = async () => {
    if (!composerText.trim() || sendingRef.current) return;
    sendingRef.current = true;
    setSendDisabled(true);
    const ok = await sendTextMessage();
    if (ok) maybePlaySound();
    setTimeout(() => {
      sendingRef.current = false;
      setSendDisabled(false);
    }, 500);
  };

  const handleTextChange = (value) => {
    const text = typeof value === "string" ? value : (value?.target?.value ?? "");
    setComposerText(text);
    maybePlaySound();
  };

  const handleMediaPick = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const MAX_BYTES = 5 * 1024 * 1024;
    if (file.size > MAX_BYTES) {
      alert("File too large. Please pick something under 5 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result; // "data:image/png;base64,..."
      const isVideo = file.type.startsWith("video/");
      const ok = await sendMediaMessage({ base64, isVideo });
      if (ok) maybePlaySound();
    };
    reader.readAsDataURL(file);
  };

  return (
    <footer className="shrink-0 border-t border-border px-1.5 pb-2 pt-2 sm:px-2">
      {isSendingMedia ? (
        <div className="mx-auto mb-2 flex max-w-full items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-sm text-muted">
          <LoaderIcon className="size-4 shrink-0 animate-spin text-accent" strokeWidth={2} aria-hidden />
          <span className="truncate">Sending media…</span>
        </div>
      ) : null}

      <div className="mx-auto flex w-full max-w-full items-end gap-1.5 px-0.5 sm:gap-2 sm:px-1">
        <input
          ref={mediaInputRef}
          type="file"
          accept="image/*,video/*"
          className="sr-only"
          disabled={isSendingMedia}
          tabIndex={-1}
          aria-hidden
          onChange={handleMediaPick}
        />
        <Button
          variant="ghost"
          isIconOnly
          isDisabled={isSendingMedia}
          aria-label="Attach image or video"
          className="size-9 shrink-0 touch-manipulation self-end text-accent"
          onPress={() => mediaInputRef.current?.click()}
        >
          <ImageIcon className="size-5 sm:size-6" strokeWidth={2} />
        </Button>

        <TextArea
          fullWidth
          variant="secondary"
          placeholder="iMessage"
          rows={1}
          value={composerText}
          onChange={handleTextChange}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              if (!sendDisabled) handleSend();
            }
          }}
          className="flex-1 rounded-full"
        />

        <Button
          variant="primary"
          isIconOnly
          aria-label="Send message"
          isDisabled={!composerText.trim() || isSendingMedia || sendDisabled}
          onPress={handleSend}
        >
          <SendHorizontalIcon className="size-5" />
        </Button>
      </div>
    </footer>
  );
}
