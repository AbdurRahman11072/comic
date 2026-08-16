"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  MessageCircle, X, Send, Loader2, Trash2, User as UserIcon,
  Image as ImageIcon, Smile, Sparkles
} from "lucide-react";
import { useSession } from "@/lib/auth-client";
import api, { uploadImage } from "@/lib/api";
import { toast } from "react-hot-toast";
import { useGetSiteConfigQuery } from "@/redux/api/siteConfigApi";

interface ChatMessage {
  id: string;
  content: string;
  imageUrl?: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    image: string | null;
    role: string;
  };
}

interface ChatDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const REACTION_GIFS = [
  { name: "Shock", url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3ZydW00enZnd3R1Znk0MnV0MnpxcWVrcDNtdnExZGJtNWpmNG56eiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/6nWhy3ulBL7GSCvKw6/giphy.gif" },
  { name: "Popcorn", url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMnVydW00enZnd3R1Znk0MnV0MnpxcWVrcDNtdnExZGJtNWpmNG56eiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/gl0mkIZOW6Nwc/giphy.gif" },
  { name: "Mindblown", url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMnVydW00enZnd3R1Znk0MnV0MnpxcWVrcDNtdnExZGJtNWpmNG56eiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/26ufdipQqU2lhNA4g/giphy.gif" },
  { name: "Let's Go", url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMnVydW00enZnd3R1Znk0MnV0MnpxcWVrcDNtdnExZGJtNWpmNG56eiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/artj92V8o75VPL7AeQ/giphy.gif" },
  { name: "Cry", url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMnVydW00enZnd3R1Znk0MnV0MnpxcWVrcDNtdnExZGJtNWpmNG56eiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/d2lcHJTG5Tscg/giphy.gif" },
  { name: "Fire", url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMnVydW00enZnd3R1Znk0MnV0MnpxcWVrcDNtdnExZGJtNWpmNG56eiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/3o72FfM5HJydzafgUE/giphy.gif" },
];

export function ChatDrawer({ open, onOpenChange }: ChatDrawerProps) {
  const { data: session } = useSession();
  const { data: configRes } = useGetSiteConfigQuery();
  const config = configRes?.data;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [input, setInput] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [mounted, setMounted] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentUser = session?.user as any;
  const isModOrAdmin = currentUser && ["moderator", "admin"].includes(currentUser.role);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchMessages = async () => {
    try {
      const { data } = await api.get("/api/v1/community/chat");
      if (data.success) {
        setMessages(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch chat messages", err);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (open) {
      setLoading(true);
      fetchMessages().finally(() => setLoading(false));
      intervalRef.current = setInterval(fetchMessages, 5000);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [open]);

  useEffect(() => {
    if (open && messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, open]);

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const res = await uploadImage(file);
      if (res.data?.url) {
        setSelectedImage(res.data.url);
        toast.success("Image attached!");
      }
    } catch (err) {
      toast.error("Failed to upload image.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !selectedImage) || sending) return;
    if (!currentUser) {
      toast.error("Please sign in to chat.");
      return;
    }

    setSending(true);
    try {
      const { data } = await api.post("/api/v1/community/chat", {
        content: input.trim(),
        imageUrl: selectedImage || undefined,
      });
      if (data.success) {
        setMessages((prev) => [...prev, data.data]);
        setInput("");
        setSelectedImage(null);
        setShowGifPicker(false);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to send message.");
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (msgId: string) => {
    try {
      await api.delete(`/api/v1/community/chat/${msgId}`);
      setMessages((prev) => prev.filter((m) => m.id !== msgId));
      toast.success("Message deleted.");
    } catch (err) {
      toast.error("Failed to delete message.");
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 font-bold border border-red-500/30">ADMIN</span>;
      case "moderator":
        return <span className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-400 font-bold border border-yellow-500/30">MOD</span>;
      case "creator":
        return <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">CREATOR</span>;
      default:
        return null;
    }
  };

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => onOpenChange(false)}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-md bg-neutral-950/95 border-l border-white/10 flex flex-col h-full shadow-2xl z-10">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-primary" />
            <h2 className="font-bold text-base text-white">Global Community Chat</h2>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="p-1.5 hover:bg-white/10 rounded-full transition text-white/50 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : messages.length > 0 ? (
            messages.map((msg) => {
              const isOwn = currentUser && currentUser.id === msg.user.id;
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 group ${isOwn ? "flex-row-reverse" : "flex-row"}`}
                >
                  <div className="w-8 h-8 rounded-full bg-white/10 overflow-hidden shrink-0 flex items-center justify-center">
                    {msg.user.image ? (
                      <img src={msg.user.image} alt={msg.user.name} className="w-full h-full object-cover" />
                    ) : (
                      <UserIcon className="w-4 h-4 text-white/50" />
                    )}
                  </div>
                  <div className={`flex flex-col max-w-[75%] ${isOwn ? "items-end" : "items-start"}`}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-xs font-semibold text-white/80">{msg.user.name}</span>
                      {getRoleBadge(msg.user.role)}
                    </div>

                    <div
                      className={`p-3 rounded-2xl text-sm leading-relaxed ${
                        isOwn
                          ? "bg-primary text-white rounded-tr-none shadow-md shadow-primary/10"
                          : "bg-white/10 text-white/90 rounded-tl-none"
                      }`}
                    >
                      {msg.content && <p className="whitespace-pre-wrap break-words">{msg.content}</p>}

                      {msg.imageUrl && (
                        <div className="mt-2 rounded-xl overflow-hidden max-h-60 border border-white/10">
                          <img src={msg.imageUrl} alt="Chat media" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-1 px-1">
                      <span className="text-[10px] text-white/40">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      {(isOwn || isModOrAdmin) && (
                        <button
                          onClick={() => handleDelete(msg.id)}
                          className="opacity-0 group-hover:opacity-100 text-white/30 hover:text-red-400 transition text-[10px]"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-20 text-white/40 text-sm">
              No messages yet. Be the first to say hello! 👋
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Reaction GIF Selector Popup */}
        {showGifPicker && (
          <div className="p-3 bg-neutral-900 border-t border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-white/70 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-primary" /> Popular Reaction GIFs
              </span>
              <button
                onClick={() => setShowGifPicker(false)}
                className="text-white/40 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2 max-h-36 overflow-y-auto">
              {REACTION_GIFS.map((gif) => (
                <button
                  key={gif.name}
                  type="button"
                  onClick={() => {
                    setSelectedImage(gif.url);
                    setShowGifPicker(false);
                  }}
                  className="rounded-lg overflow-hidden border border-white/10 hover:border-primary hover:scale-105 transition aspect-video bg-black"
                >
                  <img src={gif.url} alt={gif.name} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Selected Image / GIF Attachment Preview */}
        {selectedImage && (
          <div className="p-3 bg-white/[0.02] border-t border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 rounded-lg overflow-hidden border border-white/20 bg-black">
                <img src={selectedImage} alt="Attachment" className="w-full h-full object-cover" />
              </div>
              <span className="text-xs text-white/70 font-medium">Image attached</span>
            </div>
            <button
              onClick={() => setSelectedImage(null)}
              className="p-1 hover:bg-white/10 rounded-full text-white/50 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Chat Input Bar */}
        {config?.enableGlobalChat === false ? (
          <div className="p-4 border-t border-white/10 bg-amber-500/5 text-center text-xs text-amber-300 font-medium">
            Community Chat is temporarily paused by moderators.
          </div>
        ) : (
          <form onSubmit={handleSend} className="p-3 border-t border-white/10 bg-white/[0.02]">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowGifPicker(!showGifPicker)}
                className={`p-2 rounded-xl border transition ${
                  showGifPicker ? "bg-primary text-white border-primary" : "glass text-white/60 hover:text-white border-white/10"
                }`}
                title="Add Reaction GIF"
              >
                <Smile className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
                className="p-2 rounded-xl glass border border-white/10 text-white/60 hover:text-white transition"
                title="Upload Image"
              >
                {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin text-primary" /> : <ImageIcon className="w-4 h-4" />}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />

              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={currentUser ? "Type a message..." : "Sign in to chat"}
                disabled={!currentUser || sending}
                className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 outline-none text-white text-sm placeholder:text-white/30"
              />

              <button
                type="submit"
                disabled={(!input.trim() && !selectedImage) || sending || !currentUser}
                className="p-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition disabled:opacity-40 shrink-0 shadow-lg shadow-primary/20"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>,
    document.body
  );
}
