"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { MessageCircle, X, Send, Loader2, Trash2, User as UserIcon } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import api from "@/lib/api";
import { toast } from "react-hot-toast";

interface ChatMessage {
  id: string;
  content: string;
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

export function ChatDrawer({ open, onOpenChange }: ChatDrawerProps) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [input, setInput] = useState("");
  const [mounted, setMounted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

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

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sending) return;
    if (!currentUser) {
      toast.error("Please sign in to chat.");
      return;
    }
    setSending(true);
    try {
      const { data } = await api.post("/api/v1/community/chat", { content: input.trim() });
      if (data.success) {
        setMessages((prev) => [...prev, data.data]);
        setInput("");
      }
    } catch (err) {
      toast.error("Failed to send message.");
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
    if (role === "admin") return <span className="ml-1.5 text-[9px] font-bold bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full uppercase">Admin</span>;
    if (role === "moderator") return <span className="ml-1.5 text-[9px] font-bold bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded-full uppercase">Mod</span>;
    if (role === "creator") return <span className="ml-1.5 text-[9px] font-bold bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded-full uppercase">Creator</span>;
    return null;
  };

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999]" onClick={() => onOpenChange(false)}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Drawer Panel */}
      <div
        className="absolute right-0 top-0 bottom-0 w-full max-w-md flex flex-col bg-background border-l border-white/10 shadow-2xl"
        style={{ animation: "slideInRight 0.25s ease-out" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <MessageCircle className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-bold">Community Chat</h2>
              <p className="text-[10px] text-muted-foreground">{messages.length} messages</p>
            </div>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="p-2 rounded-xl hover:bg-white/5 transition-colors text-muted-foreground hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-2">
              <MessageCircle className="w-10 h-10 opacity-20" />
              <p className="text-sm">No messages yet. Be the first!</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isOwn = currentUser?.id === msg.user.id;
              return (
                <div
                  key={msg.id}
                  className={`group flex gap-2.5 ${isOwn ? "flex-row-reverse" : ""}`}
                >
                  {/* Avatar */}
                  <div className="shrink-0">
                    {msg.user.image ? (
                      <img
                        src={msg.user.image}
                        alt={msg.user.name}
                        className="w-8 h-8 rounded-full object-cover border border-white/10"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/5">
                        <UserIcon className="w-4 h-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Bubble */}
                  <div className={`max-w-[75%] ${isOwn ? "items-end" : "items-start"}`}>
                    <div className={`flex items-center gap-1 mb-1 ${isOwn ? "justify-end" : ""}`}>
                      {!isOwn && (
                        <>
                          <span className="text-[11px] font-bold truncate max-w-[120px]">{msg.user.name}</span>
                          {getRoleBadge(msg.user.role)}
                        </>
                      )}
                      <span className={`text-[9px] text-muted-foreground ${!isOwn ? "ml-auto" : ""}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <div
                      className={`relative px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed ${
                        isOwn
                          ? "bg-primary text-white rounded-br-md"
                          : "bg-white/5 border border-white/5 rounded-bl-md"
                      }`}
                    >
                      {msg.content}
                      {isModOrAdmin && (
                        <button
                          onClick={() => handleDelete(msg.id)}
                          className="absolute -top-2 -right-2 p-1 rounded-full bg-red-500/10 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20"
                          title="Delete message"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        {currentUser ? (
          <form
            onSubmit={handleSend}
            className="px-4 py-3 border-t border-white/5 flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              maxLength={500}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary/40 transition-colors placeholder:text-muted-foreground"
            />
            <button
              type="submit"
              disabled={!input.trim() || sending}
              className="p-2.5 bg-primary rounded-xl text-white disabled:opacity-30 hover:bg-primary/90 transition-all"
            >
              {sending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </form>
        ) : (
          <div className="px-4 py-4 border-t border-white/5 text-center shrink-0">
            <p className="text-xs text-muted-foreground">Sign in to join the conversation.</p>
          </div>
        )}
      </div>

      {/* Inline keyframe animation */}
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>,
    document.body
  );
}
