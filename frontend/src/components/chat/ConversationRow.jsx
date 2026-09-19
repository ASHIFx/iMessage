import { Avatar } from "@heroui/react";
import { AvatarWithOnlineIndicator } from "./AvatarWithOnlineIndicator";

export function ConversationRow({ user, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={[
        "flex w-full items-center gap-3 border-b border-border px-3 py-2.5 text-left transition-colors",
        selected
          ? "bg-accent/10 text-foreground"
          : "hover:bg-black/4 dark:hover:bg-white/5",
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
        {user.isOnline ? (
          <p className="text-xs font-medium text-green-500 dark:text-green-400">
            Online
          </p>
        ) : null}
      </div>
    </button>
  );
}
