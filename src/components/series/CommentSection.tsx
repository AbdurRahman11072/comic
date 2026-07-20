"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { MessageSquare, Send, MoreVertical, Trash2, Loader2, AlertCircle } from "lucide-react";
import api from "@/lib/api";
import { formatDistanceToNow } from "date-fns";
import { toast } from "react-hot-toast";

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    image: string | null;
  };
}

interface CommentSectionProps {
  chapterId: string;
}

export function CommentSection({ chapterId }: CommentSectionProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchComments = async () => {
    try {
      const res = await api.get(`/community/chapters/${chapterId}/comments`);
      setComments(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch comments", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [chapterId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !session) return;
    
    setSubmitting(true);
    try {
      await api.post(`/community/chapters/${chapterId}/comments`, {
        content: newComment.trim()
      });
      setNewComment("");
      fetchComments();
    } catch (err) {
      console.error("Failed to post comment", err);
      toast.error("Failed to post comment.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;
    try {
      await api.delete(`/community/comments/${id}`);
      fetchComments();
    } catch (err) {
      console.error("Failed to delete comment", err);
      toast.error("Failed to delete comment.");
    }
  };

  return (
    <div className="w-full max-w-[800px] mx-auto mt-8 px-4 border-t border-white/10 pt-8">
      <h3 className="text-xl font-bold flex items-center gap-2 mb-6 text-white">
        <MessageSquare className="w-5 h-5 text-primary" />
        Comments ({comments.length})
      </h3>

      {/* Comment Input */}
      {session ? (
        <form onSubmit={handleSubmit} className="mb-8 flex gap-3">
          <div className="w-10 h-10 rounded-full bg-white/10 shrink-0 overflow-hidden border border-white/5">
            {session.user?.image ? (
              <img src={session.user.image} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/50 text-xs">U</div>
            )}
          </div>
          <div className="flex-1 flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 focus:border-primary/50 outline-none text-white text-sm transition"
            />
            <button 
              type="submit"
              disabled={submitting || !newComment.trim()}
              className="px-4 py-2 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition disabled:opacity-50 flex items-center justify-center"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </form>
      ) : (
        <div className="mb-8 p-4 glass rounded-xl border border-white/5 text-center text-sm text-white/60">
          Please <a href="/signin" className="text-primary hover:underline font-medium">sign in</a> to leave a comment.
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3 group">
              <div className="w-10 h-10 rounded-full bg-white/10 shrink-0 overflow-hidden border border-white/5">
                {comment.user.image ? (
                  <img src={comment.user.image} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/50 text-xs font-bold uppercase">
                    {comment.user.name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-sm text-white">{comment.user.name}</span>
                  <span className="text-xs text-white/40">
                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm text-white/80 leading-relaxed">{comment.content}</p>
              </div>
              
              {/* Only show delete if user owns comment or is admin/mod */}
              {(session?.user?.id === comment.user.id || (session?.user as any)?.role === 'admin' || (session?.user as any)?.role === 'moderator') && (
                <button 
                  onClick={() => handleDelete(comment.id)}
                  className="w-8 h-8 flex items-center justify-center text-white/20 hover:text-red-400 hover:bg-red-400/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                  title="Delete comment"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 text-white/40 text-sm">
          No comments yet. Be the first to share your thoughts!
        </div>
      )}
    </div>
  );
}
