"use client";

import React, { useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { creatorService, CreatorPost } from "@/services/creator.service";
import { CreateCreatorPostAction, DeleteCreatorPostAction } from "@/actions/creator";

interface ChannelAnnouncementComposerProps {
  creatorId: string;
  initialPosts?: CreatorPost[];
}

export function ChannelAnnouncementComposer({
  creatorId,
  initialPosts = [],
}: ChannelAnnouncementComposerProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [posting, setPosting] = useState(false);
  const [posts, setPosts] = useState<CreatorPost[]>(initialPosts);
  const [loadingPosts, setLoadingPosts] = useState(false);

  const fetchPosts = async () => {
    setLoadingPosts(true);
    try {
      const res = await creatorService.getCreatorPosts(creatorId);
      if (res.success && res.data) {
        setPosts(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPosts(false);
    }
  };

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setPosting(true);
    try {
      const res = await CreateCreatorPostAction({
        title: title.trim(),
        content: content.trim(),
        isPinned,
      });
      if (res.success) {
        toast.success("Announcement published!");
        setTitle("");
        setContent("");
        setIsPinned(false);
        fetchPosts();
      } else {
        toast.error(res.message || "Failed to publish announcement");
      }
    } catch (_err) {
      toast.error("Failed to publish announcement");
    } finally {
      setPosting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this announcement?")) return;
    try {
      const res = await DeleteCreatorPostAction(id, creatorId);
      if (res.success) {
        toast.success("Announcement deleted");
        fetchPosts();
      } else {
        toast.error(res.message || "Failed to delete");
      }
    } catch (_err) {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="space-y-5">
      <form
        onSubmit={handlePost}
        className="space-y-3.5 p-4 rounded-xl bg-white/[0.02] border border-white/5"
      >
        <div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Announcement Title (e.g. Next Chapter Delayed)"
            required
            className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 outline-none text-white text-xs"
          />
        </div>
        <div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your announcement content..."
            rows={3}
            required
            className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 outline-none text-white text-xs resize-none"
          />
        </div>
        <div className="flex items-center justify-between gap-2 flex-wrap pt-1">
          <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isPinned}
              onChange={(e) => setIsPinned(e.target.checked)}
              className="w-4 h-4 rounded text-primary border-white/10"
            />
            Pin to top
          </label>
          <button
            type="submit"
            disabled={posting || !title.trim() || !content.trim()}
            className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary/90 transition disabled:opacity-50 flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            {posting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Publish
          </button>
        </div>
      </form>

      {/* Published Announcements List */}
      <div className="space-y-3">
        <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
          Published Announcements ({posts.length})
        </h3>
        {loadingPosts ? (
          <div className="flex justify-center py-6">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          </div>
        ) : posts.length > 0 ? (
          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
            {posts.map((p) => (
              <div
                key={p.id}
                className="p-3.5 rounded-xl glass border border-white/5 flex items-start justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {p.isPinned && (
                      <span className="px-1.5 py-0.5 rounded bg-primary/20 text-primary text-[9px] font-bold">
                        PINNED
                      </span>
                    )}
                    <h4 className="font-bold text-xs text-white truncate">{p.title}</h4>
                  </div>
                  <p className="text-xs text-white/70 mt-1 line-clamp-2">{p.content}</p>
                  <span className="text-[10px] text-white/40 mt-1.5 block">
                    {new Date(p.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(p.id)}
                  className="p-1.5 text-white/30 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition shrink-0 cursor-pointer"
                  title="Delete Announcement"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground py-2">No announcements posted yet.</p>
        )}
      </div>
    </div>
  );
}
