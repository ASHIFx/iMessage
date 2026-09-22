import { CameraIcon, LogOutIcon, SaveIcon, XIcon } from "lucide-react";
import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { useAuthStore } from "../../store/useAuthStore";
import { getInitials } from "../../hooks/useSelectedConversation";

export function ProfileEditor({ onClose }) {
  const authUser = useAuthStore((s) => s.authUser);
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const logout = useAuthStore((s) => s.logout);

  const [fullname, setFullname] = useState(authUser?.fullname || authUser?.fullName || "");
  const [preview, setPreview] = useState(authUser?.profilePic || null);
  const [base64Pic, setBase64Pic] = useState(null);
  const [busy, setBusy] = useState(false);
  const fileInputRef = useRef(null);

  const handleFilePick = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Photo must be under 2 MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setBase64Pic(reader.result);
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullname.trim()) { toast.error("Name cannot be empty"); return; }
    setBusy(true);
    try {
      const payload = { fullname: fullname.trim() };
      if (base64Pic) payload.profilePic = base64Pic;
      await updateProfile(payload);
      toast.success("Profile updated!");
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not update profile");
    } finally {
      setBusy(false);
    }
  };

  const initials = getInitials(fullname || "U");

  return (
    <div className="mt-2 overflow-hidden rounded-2xl border border-border bg-surface shadow-lg">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <p className="text-sm font-semibold">Edit Profile</p>
        <button
          type="button"
          aria-label="Close"
          className="rounded-lg p-1 text-muted hover:bg-default/60 hover:text-foreground transition-colors"
          onClick={onClose}
        >
          <XIcon className="size-4" />
        </button>
      </div>

      <form className="space-y-4 p-4" onSubmit={handleSubmit}>
        <div className="flex justify-center">
          <div className="relative">
            <div className="size-20 overflow-hidden rounded-full bg-accent ring-2 ring-accent/30">
              {preview ? (
                <img src={preview} alt="" className="size-full object-cover" />
              ) : (
                <span className="flex size-full items-center justify-center text-2xl font-bold text-white">
                  {initials}
                </span>
              )}
            </div>
            <button
              type="button"
              aria-label="Change photo"
              className="absolute bottom-0 right-0 flex size-7 items-center justify-center rounded-full bg-accent shadow-md ring-2 ring-surface hover:bg-accent/80 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <CameraIcon className="size-3.5 text-white" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handleFilePick}
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted">Display name</label>
          <input
            className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-accent transition-colors"
            value={fullname}
            onChange={(e) => setFullname(e.target.value)}
            placeholder="Your name"
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted">Email</label>
          <p className="rounded-xl border border-border bg-background/50 px-3 py-2.5 text-sm text-muted">
            {authUser?.email}
          </p>
        </div>

        <button
          type="submit"
          disabled={busy}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-accent/90 disabled:opacity-50 transition-colors"
        >
          <SaveIcon className="size-4" />
          {busy ? "Saving…" : "Save changes"}
        </button>
      </form>

      <div className="border-t border-border p-3">
        <button
          type="button"
          onClick={() => logout()}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/8 py-2.5 text-sm font-medium text-red-500 hover:bg-red-500/15 dark:border-red-400/25 dark:bg-red-400/8 dark:text-red-400 dark:hover:bg-red-400/15 transition-colors"
        >
          <LogOutIcon className="size-4" />
          Sign out
        </button>
      </div>
    </div>
  );
}