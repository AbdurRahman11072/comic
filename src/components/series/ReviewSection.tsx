"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { Star, Send, Trash2, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { formatDistanceToNow } from "date-fns";
import { toast } from "react-hot-toast";

interface Review {
  id: string;
  rating: number;
  content: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    image: string | null;
  };
}

interface ReviewSectionProps {
  seriesId: string;
}

export function ReviewSection({ seriesId }: ReviewSectionProps) {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchReviews = async () => {
    try {
      const res = await api.get(`/community/reviews/${seriesId}`);
      if (res.data.success) {
        setReviews(res.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [seriesId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) {
      toast.error("Please select a rating");
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post(`/community/reviews/${seriesId}`, {
        rating,
        content
      });
      if (res.data.success) {
        toast.success("Review submitted successfully");
        setRating(0);
        setContent("");
        fetchReviews();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    try {
      await api.delete(`/community/reviews/${id}`);
      fetchReviews();
    } catch (err) {
      console.error("Failed to delete review", err);
      toast.error("Failed to delete review.");
    }
  };

  return (
    <div className="mt-12 space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
        Reviews & Ratings
      </h2>

      {session ? (
        <form onSubmit={handleSubmit} className="glass p-6 rounded-2xl border border-white/5 space-y-4">
          <h3 className="font-semibold text-lg">Leave a Review</h3>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="focus:outline-none transition-transform hover:scale-110"
              >
                <Star className={`w-8 h-8 ${star <= rating ? 'text-yellow-500 fill-yellow-500' : 'text-white/20'}`} />
              </button>
            ))}
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your review here (optional)..."
            rows={3}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-primary/50 outline-none text-white transition resize-none"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition flex items-center gap-2 disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              Submit Review
            </button>
          </div>
        </form>
      ) : (
        <div className="p-6 glass rounded-2xl border border-white/5 text-center text-white/60">
          Please <a href="/signin" className="text-primary hover:underline font-bold">sign in</a> to leave a review.
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : reviews.length > 0 ? (
        <div className="grid gap-4">
          {reviews.map((review) => (
            <div key={review.id} className="glass p-6 rounded-2xl border border-white/5 flex gap-4 group">
              <div className="w-12 h-12 rounded-full bg-white/10 shrink-0 overflow-hidden border border-white/5 hidden sm:block">
                {review.user.image ? (
                  <img src={review.user.image} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/50 font-bold uppercase text-lg">
                    {review.user.name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="font-bold">{review.user.name}</span>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className={`w-3 h-3 ${star <= review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-white/20'}`} />
                      ))}
                    </div>
                  </div>
                  <span className="text-xs text-white/40">
                    {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                  </span>
                </div>
                {review.content && (
                  <p className="text-white/80 leading-relaxed text-sm">{review.content}</p>
                )}
              </div>
              
              {(session?.user?.id === review.user.id || (session?.user as any)?.role === 'admin' || (session?.user as any)?.role === 'moderator') && (
                <button 
                  onClick={() => handleDelete(review.id)}
                  className="w-8 h-8 flex items-center justify-center text-white/20 hover:text-red-400 hover:bg-red-400/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all shrink-0"
                  title="Delete review"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 text-white/40 glass rounded-2xl border border-white/5">
          No reviews yet. Be the first to review this series!
        </div>
      )}
    </div>
  );
}
