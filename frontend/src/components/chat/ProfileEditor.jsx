import { useState } from "react";
import toast from "react-hot-toast";
import { useAuthStore } from "../../store/useAuthStore";

export function ProfileEditor({ onClose }) {
  const authUser = useAuthStore((state) => state.authUser);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const [fullname, setFullname] = useState(authUser?.fullname || authUser?.fullName || "");
  const [profilePic, setProfilePic] = useState(null);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setBusy(true);
    try {
      const formData = new FormData();
      formData.append("fullname", fullname);
      if (profilePic) formData.append("profilePic", profilePic);
      await updateProfile(formData);
      toast.success("Profile updated");
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to update profile");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="mt-2 space-y-2 rounded-xl border border-border bg-surface p-3" onSubmit={handleSubmit}>
      <input className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none" value={fullname} onChange={(event) => setFullname(event.target.value)} placeholder="Your name" required />
      <input className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none" onChange={(event) => setProfilePic(event.target.files?.[0] || null)} accept="image/*" type="file" />
      <div className="flex justify-end gap-2">
        <button className="rounded-lg px-3 py-2 text-sm text-muted" type="button" onClick={onClose}>Cancel</button>
        <button className="rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-white disabled:opacity-50" type="submit" disabled={busy}>{busy ? "Saving..." : "Save"}</button>
      </div>
    </form>
  );
}