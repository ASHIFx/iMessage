import { Avatar } from "@heroui/react";
import { AvatarWithOnlineIndicator } from "./AvatarWithOnlineIndicator";

export function ConversationRow({ user, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={[
        "flex w-full items-center gap-3 border-b border-border px-3 py-2.5 text-left",
        "transition-all duration-150 ease-out",
        selected
          ? "bg-accent/10 text-foreground"
          : "hover:bg-black/4 active:scale-[0.99] dark:hover:bg-white/5",
      ].join(" ")}
    >
      <AvatarWithOnlineIndicator isOnline={user.isOnline ?? false}>
        <Avatar className="size-12 shrink-0">
          <Avatar.Image alt={user.name} src={user.avatarUrl} />
          <Avatar.Fallback className="text-sm font-medium">
            {user.initials}
          </Avatar.Fallback>
        </Avatar>
      </AvatarWithOnlineIndicator>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-semibold">{user.name}</p>
        <p className={`text-xs ${user.isOnline ? "font-medium text-green-500 dark:text-green-400" : "text-muted"}`}>
          {user.isOnline ? "Online" : "Offline"}
        </p>
      </div>

      {/* Subtle selected indicator */}
      {selected && (
        <div className="size-2 shrink-0 rounded-full bg-accent" aria-hidden />
      )}
    </button>
  );
}
