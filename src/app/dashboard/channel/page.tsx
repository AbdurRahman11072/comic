"use client";

import { useState, useEffect, useRef } from "react";
import { authClient } from "@/lib/auth-client";
import api from "@/lib/api";
import {
  Palette,
  Camera,
  Save,
  Loader2,
  User as UserIcon,
  Image as ImageIcon,
  Type,
  FileText,
  MessageSquare,
  Trash2,
} from "lucide-react";
import { toast } from "react-hot-toast";

interface CreatorProfile {
  id: string;
  userId: string;
  channelName: string;
  description: string | null;
  bannerUrl: string | null;
  profileImage: string | null;
  totalEarnings: number;
  withdrawnAmount: number;
}

export default function ChannelSettingsPage() {
  const { data: session } = authClient.useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<CreatorProfile | null>(null);
  const [notFound, setNotFound] = useState(false);

  // Form state
  const [channelName, setChannelName] = useState("");
  const [description, setDescription] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");

  // Uploading state
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  const profileInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!session?.user?.id) return;
      try {
        const res = await api.get("/api/v1/creators/profile");
        if (res.data.success) {
          const p = res.data.data;
          setProfile(p);
          setChannelName(p.channelName || "");
          setDescription(p.description || "");
          setProfileImage(p.profileImage || "");
          setBannerUrl(p.bannerUrl || "");
        }
      } catch (err: any) {
        if (err.response?.status === 404) {
          setNotFound(true);
        }
        console.error("Failed to fetch creator profile", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [session]);

  const handleImageUpload = async (
    file: File,
    setUrl: (url: string) => void,
    setUploading: (v: boolean) => void
  ) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const uploadUrl =
        process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${uploadUrl}/api/v1/upload`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      const data = await res.json();
      if (data.success && data.data?.url) {
        setUrl(data.data.url);
        toast.success("Image uploaded!");
      } else {
        toast.error("Upload failed.");
      }
    } catch {
      toast.error("Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!channelName.trim()) {
      toast.error("Channel name is required.");
      return;
    }

    setSaving(true);
    try {
      const res = await api.put("/api/v1/creators/profile", {
        channelName: channelName.trim(),
        description: description.trim() || null,
        profileImage: profileImage || null,
        bannerUrl: bannerUrl || null,
      });
      if (res.data.success) {
        setProfile(res.data.data);
        toast.success("Channel settings saved successfully!");
      }
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Failed to save channel settings."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Palette className="w-6 h-6 text-primary" /> Channel Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Customize your creator channel's appearance and details.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Banner */}
        <div className="glass rounded-2xl border border-white/5 overflow-hidden">
          <div
            className="relative h-48 bg-gradient-to-br from-primary/20 via-purple-500/10 to-cyan-500/10 group cursor-pointer"
            onClick={() => bannerInputRef.current?.click()}
            style={
              bannerUrl
                ? {
                    backgroundImage: `url(${bannerUrl})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }
                : undefined
            }
          >
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              {uploadingBanner ? (
                <Loader2 className="w-6 h-6 animate-spin text-white" />
              ) : (
                <>
                  <ImageIcon className="w-6 h-6 text-white" />
                  <span className="text-white font-medium text-sm">
                    {bannerUrl ? "Change Banner" : "Upload Banner"}
                  </span>
                </>
              )}
            </div>
            <input
              ref={bannerInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageUpload(file, setBannerUrl, setUploadingBanner);
              }}
            />
          </div>

          {/* Profile Image + Channel Name Preview */}
          <div className="relative px-6 pb-6">
            <div className="flex items-end gap-5 -mt-12">
              <div
                className="relative w-24 h-24 rounded-2xl border-4 border-background bg-white/5 overflow-hidden group cursor-pointer shrink-0"
                onClick={() => profileInputRef.current?.click()}
              >
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <UserIcon className="w-10 h-10 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  {uploadingProfile ? (
                    <Loader2 className="w-5 h-5 animate-spin text-white" />
                  ) : (
                    <Camera className="w-5 h-5 text-white" />
                  )}
                </div>
                <input
                  ref={profileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file, setProfileImage, setUploadingProfile);
                  }}
                />
              </div>
              <div className="pb-1 min-w-0">
                <h2 className="text-xl font-bold truncate">
                  {channelName || "Your Channel"}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {notFound
                    ? "No profile yet — fill out the details below to create one."
                    : "Creator since " +
                      (profile?.id
                        ? new Date().toLocaleDateString()
                        : "—")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Fields */}
        <div className="glass rounded-2xl p-6 border border-white/5 space-y-6">
          {/* Channel Name */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium mb-2">
              <Type className="w-4 h-4 text-muted-foreground" /> Channel Name
            </label>
            <input
              type="text"
              value={channelName}
              onChange={(e) => setChannelName(e.target.value)}
              placeholder="My Awesome Channel"
              required
              maxLength={60}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 outline-none transition text-white placeholder:text-muted-foreground"
            />
            <p className="text-[11px] text-muted-foreground mt-1.5">
              This is the public name displayed on your creator profile.{" "}
              {channelName.length}/60
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium mb-2">
              <FileText className="w-4 h-4 text-muted-foreground" /> Channel
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell readers about your channel, your style, and what series you publish..."
              rows={5}
              maxLength={500}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 outline-none transition text-white placeholder:text-muted-foreground resize-none"
            />
            <p className="text-[11px] text-muted-foreground mt-1.5">
              {description.length}/500 characters
            </p>
          </div>
        </div>

        {/* Stats Preview (read-only) */}
        {profile && (
          <div className="glass rounded-2xl p-6 border border-white/5">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-4">
              Channel Stats
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                <p className="text-2xl font-bold text-emerald-400">
                  {profile.totalEarnings.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Total Earnings (P)
                </p>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                <p className="text-2xl font-bold text-amber-400">
                  {profile.withdrawnAmount.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Withdrawn (P)
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="flex items-center justify-between pt-4">
          {profile && (
            <a
              href={`/channel/${session?.user?.id}`}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-primary hover:underline font-semibold flex items-center gap-1.5"
            >
              View My Public Channel →
            </a>
          )}
          <button
            type="submit"
            disabled={saving || !channelName.trim()}
            className="flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all disabled:opacity-50 shadow-lg shadow-primary/20 ml-auto"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </form>

      {/* Creator Announcements Manager */}
      {profile && (
        <div className="glass rounded-2xl p-6 border border-white/5 space-y-6 mt-12">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2 text-white">
              <MessageSquare className="w-5 h-5 text-primary" /> Channel Announcements
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Post updates, hiatus notices, and announcements visible to everyone on your channel.
            </p>
          </div>

          <ChannelAnnouncementComposer creatorId={session?.user?.id as string} />
        </div>
      )}
    </div>
  );
}

function ChannelAnnouncementComposer({ creatorId }: { creatorId: string }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [posting, setPosting] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  const fetchPosts = async () => {
    try {
      const res = await api.get(`/api/v1/creators/${creatorId}/posts`);
      if (res.data.success) {
        setPosts(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    if (creatorId) fetchPosts();
  }, [creatorId]);

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setPosting(true);
    try {
      const res = await api.post("/api/v1/creators/posts", {
        title: title.trim(),
        content: content.trim(),
        isPinned,
      });
      if (res.data.success) {
        toast.success("Announcement published!");
        setTitle("");
        setContent("");
        setIsPinned(false);
        fetchPosts();
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to publish announcement");
    } finally {
      setPosting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this announcement?")) return;
    try {
      await api.delete(`/api/v1/creators/posts/${id}`);
      toast.success("Announcement deleted");
      fetchPosts();
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handlePost} className="space-y-4 p-4 rounded-xl bg-white/[0.02] border border-white/5">
        <div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Announcement Title (e.g. Next Chapter Delayed to Friday)"
            required
            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 outline-none text-white text-sm"
          />
        </div>
        <div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your announcement content..."
            rows={3}
            required
            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 outline-none text-white text-sm resize-none"
          />
        </div>
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
            <input
              type="checkbox"
              checked={isPinned}
              onChange={(e) => setIsPinned(e.target.checked)}
              className="w-4 h-4 rounded text-primary border-white/10"
            />
            Pin to top of channel
          </label>
          <button
            type="submit"
            disabled={posting || !title.trim() || !content.trim()}
            className="px-5 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary/90 transition disabled:opacity-50 flex items-center gap-2"
          >
            {posting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Publish Announcement
          </button>
        </div>
      </form>

      {/* Published Announcements List */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Published Announcements ({posts.length})
        </h3>
        {loadingPosts ? (
          <div className="flex justify-center py-6">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          </div>
        ) : posts.length > 0 ? (
          posts.map((p) => (
            <div
              key={p.id}
              className="p-4 rounded-xl glass border border-white/5 flex items-start justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2">
                  {p.isPinned && (
                    <span className="px-1.5 py-0.5 rounded bg-primary/20 text-primary text-[10px] font-bold">
                      PINNED
                    </span>
                  )}
                  <h4 className="font-bold text-sm text-white">{p.title}</h4>
                </div>
                <p className="text-xs text-white/70 mt-1 line-clamp-2">{p.content}</p>
                <span className="text-[10px] text-white/40 mt-2 block">
                  {new Date(p.createdAt).toLocaleDateString()}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(p.id)}
                className="p-2 text-white/30 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        ) : (
          <p className="text-xs text-muted-foreground">No announcements posted yet.</p>
        )}
      </div>
    </div>
  );
}
